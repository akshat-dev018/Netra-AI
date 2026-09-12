"""Synthetic data generation and model training for the NETRA ML Engine.

Generates a deterministic 15,000-row synthetic dataset with an explicit
closed-form delay function, trains a primary LightGBM regressor and two
quantile auxiliary models (p10, p90), evaluates on a held-out test set,
and persists the full model bundle as ``netra_ml_engine.pkl``.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import joblib
import lightgbm
import numpy as np
import pandas as pd
import sklearn
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split


# ===================================================================== #
#  Deterministic ground-truth delay formula                              #
# ===================================================================== #

def rush_hour_multiplier(hour: int | np.ndarray) -> float | np.ndarray:
    """Piecewise rush-hour surcharge in minutes.

    Peaks during morning rush (07-10) and evening rush (17-20).

    Definition:
        hour 7:   4.0
        hour 8:   7.0  (morning peak)
        hour 9:   6.0
        hour 10:  3.0
        hour 17:  5.0
        hour 18:  8.0  (evening peak)
        hour 19:  7.0
        hour 20:  3.5
        all else: 0.0

    Args:
        hour: Integer hour(s) of day (0-23).  Supports scalar or
            numpy array for vectorised generation.

    Returns:
        Rush-hour delay surcharge in minutes (same shape as *hour*).
    """
    mapping: dict[int, float] = {
        7: 4.0,
        8: 7.0,
        9: 6.0,
        10: 3.0,
        17: 5.0,
        18: 8.0,
        19: 7.0,
        20: 3.5,
    }

    if isinstance(hour, np.ndarray):
        result = np.zeros_like(hour, dtype=np.float64)
        for h, val in mapping.items():
            result[hour == h] = val
        return result

    return mapping.get(int(hour), 0.0)


def compute_ground_truth_delay(
    speed_drop_ratio: np.ndarray,
    weather_severity: np.ndarray,
    hour_of_day: np.ndarray,
    toll_wait_time: np.ndarray,
    rng: np.random.RandomState,
) -> np.ndarray:
    """Closed-form ground-truth delay with Gaussian noise.

    Formula:
        delay = 2.0
             + 45 * speed_drop_ratio ** 1.3
             + 18 * weather_severity
             + rush_hour_multiplier(hour_of_day)
             + toll_wait_time * 0.6
             + N(0, 3.5)
        delay = clip(delay, 0, 180)

    Args:
        speed_drop_ratio: Array of shape (n,) in [0, 1].
        weather_severity: Array of shape (n,) in [0, 1].
        hour_of_day: Array of shape (n,) in 0-23.
        toll_wait_time: Array of shape (n,) in minutes.
        rng: Seeded ``np.random.RandomState`` for reproducibility.

    Returns:
        Clipped delay array of shape (n,).
    """
    base_delay = 2.0
    delay = (
        base_delay
        + 45.0 * np.power(speed_drop_ratio, 1.3)
        + 18.0 * weather_severity
        + rush_hour_multiplier(hour_of_day)
        + toll_wait_time * 0.6
        + rng.normal(0.0, 3.5, size=len(speed_drop_ratio))
    )
    return np.clip(delay, 0.0, 180.0)


# ===================================================================== #
#  Synthetic dataset generator                                           #
# ===================================================================== #

FEATURE_NAMES: list[str] = [
    "speed_drop_ratio",
    "weather_severity",
    "hour_of_day",
    "day_of_week",
    "is_weekend",
    "toll_wait_time",
    "segment_speed_std",
    "v_freeflow_kmh",
    "v_current_kmh",
    "distance_m",
]


def generate_synthetic_dataset(
    n_samples: int = 15_000,
    seed: int = 42,
) -> pd.DataFrame:
    """Generate a deterministic synthetic training dataset.

    Args:
        n_samples: Number of rows to generate.
        seed: Random seed for full reproducibility.

    Returns:
        A ``pd.DataFrame`` with columns ``FEATURE_NAMES + ["delay_minutes"]``.
    """
    rng = np.random.RandomState(seed)

    speed_drop_ratio = rng.beta(2.0, 5.0, size=n_samples)
    weather_severity = rng.beta(1.5, 6.0, size=n_samples)
    hour_of_day = rng.randint(0, 24, size=n_samples)
    day_of_week = rng.randint(0, 7, size=n_samples)
    is_weekend = (day_of_week >= 5).astype(np.float64)
    toll_wait_time = rng.exponential(scale=8.0, size=n_samples)
    segment_speed_std = rng.gamma(2.0, 5.0, size=n_samples)
    v_freeflow_kmh = rng.uniform(40.0, 120.0, size=n_samples)
    v_current_kmh = v_freeflow_kmh * (1.0 - speed_drop_ratio)
    distance_m = rng.uniform(5_000, 200_000, size=n_samples)

    delay = compute_ground_truth_delay(
        speed_drop_ratio, weather_severity, hour_of_day, toll_wait_time, rng
    )

    data = pd.DataFrame(
        {
            "speed_drop_ratio": speed_drop_ratio,
            "weather_severity": weather_severity,
            "hour_of_day": hour_of_day,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "toll_wait_time": toll_wait_time,
            "segment_speed_std": segment_speed_std,
            "v_freeflow_kmh": v_freeflow_kmh,
            "v_current_kmh": v_current_kmh,
            "distance_m": distance_m,
            "delay_minutes": delay,
        }
    )
    return data


# ===================================================================== #
#  Training pipeline                                                     #
# ===================================================================== #

def train_and_save(
    output_path: str = "netra_ml_engine.pkl",
) -> dict[str, Any]:
    """Full training pipeline: generate data, train models, evaluate, save.

    Trains three LightGBM models:
        1. Primary regressor (squared_error objective).
        2. Quantile regressor for the 10th percentile (alpha=0.1).
        3. Quantile regressor for the 90th percentile (alpha=0.9).

    The saved bundle (``output_path``) contains:
        - ``model``: the primary fitted ``LGBMRegressor``
        - ``model_p10``: quantile-0.1 ``LGBMRegressor``
        - ``model_p90``: quantile-0.9 ``LGBMRegressor``
        - ``feature_names``: ordered list of feature column names
        - ``sklearn_version``: version string of scikit-learn used
        - ``lightgbm_version``: version string of LightGBM used

    Args:
        output_path: Filepath for the persisted ``.pkl`` bundle.

    Returns:
        A dict with ``mae``, ``rmse``, and ``output_path``.
    """
    np.random.seed(42)

    print("[NETRA train] Generating synthetic dataset (15,000 rows)…")
    df = generate_synthetic_dataset(n_samples=15_000, seed=42)

    X = df[FEATURE_NAMES]
    y = df["delay_minutes"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    # --- Primary regressor ------------------------------------------------
    print("[NETRA train] Training primary LGBMRegressor…")
    model = lightgbm.LGBMRegressor(
        random_state=42,
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        verbose=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    print(f"[NETRA train] Test MAE : {mae:.4f}")
    print(f"[NETRA train] Test RMSE: {rmse:.4f}")

    # --- Quantile regressors (for real confidence intervals) ---------------
    print("[NETRA train] Training quantile models (p10, p90)…")
    model_p10 = lightgbm.LGBMRegressor(
        objective="quantile",
        alpha=0.1,
        random_state=42,
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        verbose=-1,
    )
    model_p10.fit(X_train, y_train)

    model_p90 = lightgbm.LGBMRegressor(
        objective="quantile",
        alpha=0.9,
        random_state=42,
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        verbose=-1,
    )
    model_p90.fit(X_train, y_train)

    # --- Persist bundle ---------------------------------------------------
    bundle: dict[str, Any] = {
        "model": model,
        "model_p10": model_p10,
        "model_p90": model_p90,
        "feature_names": list(FEATURE_NAMES),
        "sklearn_version": sklearn.__version__,
        "lightgbm_version": lightgbm.__version__,
    }

    resolved_path = str(Path(output_path).resolve())
    joblib.dump(bundle, resolved_path)
    print(f"[NETRA train] Bundle saved → {resolved_path}")

    return {"mae": mae, "rmse": rmse, "output_path": resolved_path}


# ===================================================================== #
#  CLI entry-point                                                       #
# ===================================================================== #

if __name__ == "__main__":
    train_and_save()

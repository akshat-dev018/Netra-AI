"""NETRA ML Engine — inference module.

Loads a persisted model bundle and produces freight delay predictions
with real confidence intervals (quantile regression), SHAP-based
explainability breakdowns, and a calibrated risk score.
"""

from __future__ import annotations

import os
import warnings
from pathlib import Path
from typing import Any

import joblib
import lightgbm
import numpy as np
import shap
import sklearn

from feature_extractor import FeatureExtractor

# Suppress noisy SHAP / LightGBM informational output during inference.
warnings.filterwarnings("ignore", category=UserWarning, module="shap")


class NetraPredictor:
    """Load a trained NETRA bundle and run inference on route payloads.

    Attributes:
        model: Primary ``LGBMRegressor`` for point predictions.
        model_p10: Quantile-0.1 model for lower confidence bound.
        model_p90: Quantile-0.9 model for upper confidence bound.
        feature_names: Ordered feature list used at train time.
        explainer: Cached ``shap.TreeExplainer`` for the primary model.
    """

    def __init__(self, bundle_path: str = "netra_ml_engine.pkl") -> None:
        """Load a persisted model bundle and validate version compatibility.

        Args:
            bundle_path: Path to the ``.pkl`` file produced by ``train.py``.

        Raises:
            FileNotFoundError: If ``bundle_path`` does not exist.
            RuntimeError: If the scikit-learn or LightGBM version recorded
                in the bundle does not match the currently installed version.
        """
        resolved = str(Path(bundle_path).resolve())
        if not Path(resolved).is_file():
            raise FileNotFoundError(
                f"Model bundle not found at '{resolved}'. "
                "Run train.py first to generate netra_ml_engine.pkl."
            )

        bundle: dict[str, Any] = joblib.load(resolved)

        # --- version compatibility check ----------------------------------
        saved_sk = bundle.get("sklearn_version", "unknown")
        saved_lgb = bundle.get("lightgbm_version", "unknown")

        if saved_sk != sklearn.__version__:
            raise RuntimeError(
                f"scikit-learn version mismatch: bundle={saved_sk}, "
                f"installed={sklearn.__version__}. Retrain the model."
            )
        if saved_lgb != lightgbm.__version__:
            raise RuntimeError(
                f"LightGBM version mismatch: bundle={saved_lgb}, "
                f"installed={lightgbm.__version__}. Retrain the model."
            )

        self.model: lightgbm.LGBMRegressor = bundle["model"]
        self.model_p10: lightgbm.LGBMRegressor = bundle["model_p10"]
        self.model_p90: lightgbm.LGBMRegressor = bundle["model_p90"]
        self.feature_names: list[str] = bundle["feature_names"]

        # Build SHAP explainer once — reused across calls.
        self.explainer: shap.TreeExplainer = shap.TreeExplainer(self.model)
        self._extractor = FeatureExtractor()

    # ------------------------------------------------------------------ #
    #  Public prediction entry-point                                       #
    # ------------------------------------------------------------------ #

    def predict_from_payload(
        self,
        route_data: dict[str, Any],
        toll_wait_time: float = 8.0,
    ) -> dict[str, Any]:
        """Run end-to-end inference from a raw route payload.

        Steps:
            1. Parse traffic features.
            2. Fetch weather severity.
            3. Assemble feature vector in training order.
            4. Predict delay, confidence, explainability, risk.

        Args:
            route_data: A dict matching the NETRA input schema.
            toll_wait_time: Estimated toll-booth wait time in minutes.
                Defaults to ``8.0`` when the caller has no better estimate.

        Returns:
            A dict with keys:
                route_identifier (str),
                predicted_delay_minutes (float),
                risk_score (int 0-100),
                confidence_percentage (int 60-97),
                explainability_breakdown (dict with traffic_congestion_pct,
                    adverse_weather_pct, toll_queue_pct),
                telemetry_summary (dict).

            ``risk_score`` is computed as::

                int(clip((predicted_delay / 90) * 100, 0, 100))

            This maps a 90-minute delay to a score of 100.
        """
        # 1. Traffic features
        traffic = self._extractor.parse_traffic_payload(route_data)

        # 2. Weather
        weather = self._extractor.fetch_weather_severity(
            lat=traffic["lat"],
            lon=traffic["lon"],
            api_key=os.environ.get("OWM_API_KEY"),
        )

        # 3. Feature vector (must match FEATURE_NAMES order from train.py)
        feature_values: dict[str, float] = {
            "speed_drop_ratio": traffic["speed_drop_ratio"],
            "weather_severity": weather["weather_severity"],
            "hour_of_day": float(traffic["hour_of_day"]),
            "day_of_week": float(traffic["day_of_week"]),
            "is_weekend": float(traffic["is_weekend"]),
            "toll_wait_time": toll_wait_time,
            "segment_speed_std": traffic["segment_speed_std"],
            "v_freeflow_kmh": traffic["v_freeflow_kmh"],
            "v_current_kmh": traffic["v_current_kmh"],
            "distance_m": traffic["distance_m"],
        }

        X = np.array(
            [[feature_values[f] for f in self.feature_names]], dtype=np.float64
        )

        # 4. Predictions
        predicted_delay: float = float(self.model.predict(X)[0])
        pred_p10: float = float(self.model_p10.predict(X)[0])
        pred_p90: float = float(self.model_p90.predict(X)[0])

        # --- Confidence (real quantile-based) -----------------------------
        confidence_pct = self._compute_confidence(predicted_delay, pred_p10, pred_p90)

        # --- Explainability (real SHAP) -----------------------------------
        explainability = self._compute_explainability(X)

        # --- Risk score ---------------------------------------------------
        # Mapping: 90-minute delay → score 100, linearly scaled, clipped [0, 100].
        risk_score: int = int(np.clip((predicted_delay / 90.0) * 100.0, 0, 100))

        # --- Telemetry summary --------------------------------------------
        telemetry_summary: dict[str, Any] = {
            "weather_source": weather["weather_source"],
            "weather_severity": weather["weather_severity"],
            "weather_description": weather["weather_description"],
            "low_data_quality": traffic["low_data_quality"],
            "notes": traffic["telemetry_notes"],
            "v_freeflow_kmh": traffic["v_freeflow_kmh"],
            "v_current_kmh": traffic["v_current_kmh"],
            "speed_drop_ratio": traffic["speed_drop_ratio"],
            "segment_speeds_kmh": traffic["segment_speeds_kmh"],
            "segment_speed_std": traffic["segment_speed_std"],
            "pred_p10": round(pred_p10, 2),
            "pred_p90": round(pred_p90, 2),
        }

        return {
            "route_identifier": traffic["road"],
            "predicted_delay_minutes": round(predicted_delay, 2),
            "risk_score": risk_score,
            "confidence_percentage": confidence_pct,
            "explainability_breakdown": explainability,
            "telemetry_summary": telemetry_summary,
        }

    # ------------------------------------------------------------------ #
    #  Internal helpers                                                    #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _compute_confidence(
        predicted_delay: float,
        pred_p10: float,
        pred_p90: float,
    ) -> int:
        """Derive a confidence percentage from quantile interval width.

        Formula:
            interval_width = pred_p90 - pred_p10
            confidence = clip(100 - (interval_width / predicted_delay) * 40,
                              60, 97)

        A narrower prediction interval (relative to the point prediction)
        yields higher confidence.

        Args:
            predicted_delay: Point prediction from the primary model.
            pred_p10: 10th-percentile prediction.
            pred_p90: 90th-percentile prediction.

        Returns:
            Integer confidence in [60, 97].
        """
        interval_width = pred_p90 - pred_p10
        # Guard against predicted_delay ≤ 0 to avoid division by zero.
        if predicted_delay > 0:
            raw = 100.0 - (interval_width / predicted_delay) * 40.0
        else:
            # ASSUMPTION: near-zero delay → highest plausible confidence.
            raw = 97.0

        return int(np.clip(raw, 60, 97))

    def _compute_explainability(self, X: np.ndarray) -> dict[str, int]:
        """Compute SHAP-based explainability breakdown.

        Takes the absolute SHAP values for the three primary explainability
        groups, normalises them to sum to 100, and returns integer
        percentages.

        Groups:
            - ``traffic_congestion_pct``: features ``speed_drop_ratio``,
              ``segment_speed_std``, ``v_freeflow_kmh``, ``v_current_kmh``.
            - ``adverse_weather_pct``: feature ``weather_severity``.
            - ``toll_queue_pct``: feature ``toll_wait_time``.

        Args:
            X: Feature array of shape ``(1, n_features)``.

        Returns:
            Dict with integer percentage keys summing to 100.
        """
        shap_values = self.explainer.shap_values(X)
        abs_shap = np.abs(shap_values[0])  # shape (n_features,)

        # Build index lookup
        idx: dict[str, int] = {
            name: i for i, name in enumerate(self.feature_names)
        }

        traffic_features = [
            "speed_drop_ratio",
            "segment_speed_std",
            "v_freeflow_kmh",
            "v_current_kmh",
        ]
        traffic_val = sum(abs_shap[idx[f]] for f in traffic_features)
        weather_val = abs_shap[idx["weather_severity"]]
        toll_val = abs_shap[idx["toll_wait_time"]]

        total = traffic_val + weather_val + toll_val
        if total > 0:
            traffic_pct = (traffic_val / total) * 100.0
            weather_pct = (weather_val / total) * 100.0
            toll_pct = (toll_val / total) * 100.0
        else:
            # ASSUMPTION: if all three groups have zero SHAP, split equally.
            traffic_pct = 34.0
            weather_pct = 33.0
            toll_pct = 33.0

        # Integer rounding that guarantees sum = 100.
        raw = [traffic_pct, weather_pct, toll_pct]
        floored = [int(v) for v in raw]
        remainder = 100 - sum(floored)
        # Distribute leftover to the values with the largest fractional parts.
        fractions = [(v - int(v), i) for i, v in enumerate(raw)]
        fractions.sort(key=lambda x: x[0], reverse=True)
        for k in range(remainder):
            floored[fractions[k][1]] += 1

        return {
            "traffic_congestion_pct": floored[0],
            "adverse_weather_pct": floored[1],
            "toll_queue_pct": floored[2],
        }


# ===================================================================== #
#  Runnable demo                                                         #
# ===================================================================== #

if __name__ == "__main__":
    sample_payload: dict[str, Any] = {
        "road": "NH-48",
        "distance(meters)": 42300,
        "duration(minutes)": 58.2,
        "duration_min(minutes)": 34.7,
        "origin_coordinates": "40.7739489, -73.9709661",
        "road_distance_timing(meters:seconds)": {
            "0": 0,
            "5000": 410,
            "12000": 900,
            "25000": 1850,
            "42300": 3492,
        },
        "datetime_utc": "03/22/2021 08:19:00",
    }

    predictor = NetraPredictor(bundle_path="netra_ml_engine.pkl")
    result = predictor.predict_from_payload(sample_payload, toll_wait_time=8.0)

    import json

    print(json.dumps(result, indent=2, default=str))

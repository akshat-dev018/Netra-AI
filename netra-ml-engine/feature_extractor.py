"""Feature extraction and weather ingestion for the NETRA ML Engine.

This module handles:
    1. Parsing the raw route/traffic JSON payload into numeric features.
    2. Fetching real-time weather severity from the OpenWeatherMap API.
"""

from __future__ import annotations

import os
from datetime import datetime
from typing import Any

import numpy as np
import requests


class FeatureExtractor:
    """Extracts ML-ready features from a NETRA route payload.

    Usage:
        extractor = FeatureExtractor()
        traffic = extractor.parse_traffic_payload(payload)
        weather = extractor.fetch_weather_severity(lat, lon, api_key)
    """

    # ------------------------------------------------------------------ #
    #  OpenWeatherMap condition-code → severity lookup table               #
    #  Docs: https://openweathermap.org/weather-conditions                #
    #  Groups: 2xx thunderstorm, 3xx drizzle, 5xx rain, 6xx snow,        #
    #          7xx atmosphere (fog/mist = 741), 800 clear, 80x clouds     #
    # ------------------------------------------------------------------ #
    _OWM_SEVERITY: dict[int, float] = {
        # 2xx — Thunderstorm
        200: 0.7, 201: 0.8, 202: 0.9,
        210: 0.6, 211: 0.7, 212: 0.85, 221: 0.75,
        230: 0.65, 231: 0.7, 232: 0.8,
        # 3xx — Drizzle
        300: 0.2, 301: 0.25, 302: 0.35,
        310: 0.25, 311: 0.3, 312: 0.4,
        313: 0.35, 314: 0.45, 321: 0.3,
        # 5xx — Rain
        500: 0.3, 501: 0.45, 502: 0.65, 503: 0.8, 504: 0.9,
        511: 0.75, 520: 0.4, 521: 0.5, 522: 0.7, 531: 0.55,
        # 6xx — Snow
        600: 0.5, 601: 0.65, 602: 0.85,
        611: 0.55, 612: 0.6, 613: 0.65,
        615: 0.55, 616: 0.6,
        620: 0.5, 621: 0.6, 622: 0.8,
        # 7xx — Atmosphere (fog, mist, haze, dust, …)
        701: 0.3, 711: 0.35, 721: 0.25,
        731: 0.4, 741: 0.45, 751: 0.4,
        761: 0.45, 762: 0.7, 771: 0.6, 781: 1.0,
        # 800 — Clear
        800: 0.0,
        # 80x — Clouds
        801: 0.05, 802: 0.05, 803: 0.1, 804: 0.1,
    }

    # ------------------------------------------------------------------ #
    #  Traffic payload parser                                              #
    # ------------------------------------------------------------------ #

    def parse_traffic_payload(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Parse a raw NETRA route payload into numeric ML features.

        Args:
            payload: A dict matching the NETRA input schema. Missing keys
                are handled with documented defaults (never silent ``None``).

        Returns:
            A dict with keys:
                road, distance_m, duration_minutes, duration_min_minutes,
                v_freeflow_kmh, v_current_kmh, speed_drop_ratio,
                segment_speeds_kmh, segment_speed_std,
                hour_of_day, day_of_week, is_weekend,
                lat, lon, low_data_quality, telemetry_notes.

        Raises:
            ValueError: If ``origin_coordinates`` cannot be parsed or are
                out of valid range.
        """
        notes: list[str] = []
        low_data_quality = False

        # --- core scalars ------------------------------------------------
        road: str = payload.get("road", "UNKNOWN")
        # ASSUMPTION: distance default 0 signals missing data.
        distance_m: float = float(payload.get("distance(meters)", 0))
        duration_minutes: float = float(payload.get("duration(minutes)", 0))
        duration_min_minutes: float = float(payload.get("duration_min(minutes)", 0))

        if distance_m <= 0:
            low_data_quality = True
            notes.append("distance_m is 0 or negative; freeflow/current speed set to 0")

        if duration_minutes <= 0:
            low_data_quality = True
            notes.append("duration_minutes is 0 or negative; current speed set to 0")

        if duration_min_minutes <= 0:
            low_data_quality = True
            notes.append("duration_min_minutes is 0 or negative; freeflow speed set to 0")

        # --- speeds -------------------------------------------------------
        # v_freeflow_kmh = (distance_m / 1000) / (duration_min_minutes / 60)
        if duration_min_minutes > 0 and distance_m > 0:
            v_freeflow_kmh: float = (distance_m / 1000.0) / (duration_min_minutes / 60.0)
        else:
            v_freeflow_kmh = 0.0

        # v_current_kmh = (distance_m / 1000) / (duration_minutes / 60)
        if duration_minutes > 0 and distance_m > 0:
            v_current_kmh: float = (distance_m / 1000.0) / (duration_minutes / 60.0)
        else:
            v_current_kmh = 0.0

        # speed_drop_ratio — guarded against v_freeflow == 0
        if v_freeflow_kmh > 0:
            speed_drop_ratio: float = max(
                0.0, (v_freeflow_kmh - v_current_kmh) / v_freeflow_kmh
            )
        else:
            speed_drop_ratio = 0.0

        # --- segment speeds -----------------------------------------------
        raw_segments: dict[str, Any] = payload.get(
            "road_distance_timing(meters:seconds)", {}
        )
        segment_speeds_kmh, segment_speed_std = self._compute_segment_speeds(
            raw_segments
        )

        # --- datetime features --------------------------------------------
        datetime_str: str = payload.get("datetime_utc", "")
        hour_of_day, day_of_week, is_weekend = self._parse_datetime(datetime_str)

        # --- coordinates --------------------------------------------------
        lat, lon = self._parse_coordinates(
            payload.get("origin_coordinates", "0.0, 0.0")
        )

        return {
            "road": road,
            "distance_m": distance_m,
            "duration_minutes": duration_minutes,
            "duration_min_minutes": duration_min_minutes,
            "v_freeflow_kmh": v_freeflow_kmh,
            "v_current_kmh": v_current_kmh,
            "speed_drop_ratio": speed_drop_ratio,
            "segment_speeds_kmh": segment_speeds_kmh,
            "segment_speed_std": segment_speed_std,
            "hour_of_day": hour_of_day,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend,
            "lat": lat,
            "lon": lon,
            "low_data_quality": low_data_quality,
            "telemetry_notes": notes,
        }

    # ------------------------------------------------------------------ #
    #  Weather ingestion                                                   #
    # ------------------------------------------------------------------ #

    def fetch_weather_severity(
        self,
        lat: float,
        lon: float,
        api_key: str | None = None,
    ) -> dict[str, Any]:
        """Fetch current weather severity from OpenWeatherMap.

        Args:
            lat: Latitude in range [-90, 90].
            lon: Longitude in range [-180, 180].
            api_key: OWM API key.  Falls back to the ``OWM_API_KEY``
                environment variable if not provided.

        Returns:
            A dict with:
                weather_severity (float 0.0–1.0),
                weather_source ("api" | "fallback"),
                weather_description (str).
        """
        resolved_key: str | None = api_key or os.environ.get("OWM_API_KEY")

        if not resolved_key:
            return self._weather_fallback("No API key provided")

        url = (
            "https://api.openweathermap.org/data/2.5/weather"
            f"?lat={lat}&lon={lon}&appid={resolved_key}&units=metric"
        )

        try:
            resp = requests.get(url, timeout=5)
            resp.raise_for_status()
            data = resp.json()

            # OWM returns weather as a list; take the primary condition.
            condition_id: int = int(data["weather"][0]["id"])
            description: str = data["weather"][0].get("description", "unknown")
            severity: float = self._OWM_SEVERITY.get(condition_id, 0.1)

            return {
                "weather_severity": severity,
                "weather_source": "api",
                "weather_description": description,
            }
        except (requests.RequestException, KeyError, ValueError, IndexError) as exc:
            return self._weather_fallback(str(exc))

    # ------------------------------------------------------------------ #
    #  Internal helpers                                                    #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _weather_fallback(reason: str) -> dict[str, Any]:
        """Return a safe baseline weather dict when the API is unavailable.

        Args:
            reason: Human-readable explanation of why fallback was used.

        Returns:
            Baseline severity dict with ``weather_source = "fallback"``.
        """
        return {
            "weather_severity": 0.1,
            "weather_source": "fallback",
            "weather_description": f"fallback ({reason})",
        }

    @staticmethod
    def _compute_segment_speeds(
        raw_segments: dict[str, Any],
    ) -> tuple[list[float], float]:
        """Compute per-segment speeds from cumulative distance/time checkpoints.

        Args:
            raw_segments: Mapping of cumulative distance (m, str key) to
                cumulative time (seconds).

        Returns:
            A tuple of (list of segment speeds in km/h,
                         std-deviation across those speeds).
        """
        if len(raw_segments) < 2:
            return [], 0.0

        # Sort by cumulative distance (the keys).
        sorted_points = sorted(
            ((float(d), float(t)) for d, t in raw_segments.items()),
            key=lambda x: x[0],
        )

        speeds: list[float] = []
        for i in range(1, len(sorted_points)):
            delta_d_m = sorted_points[i][0] - sorted_points[i - 1][0]
            delta_t_s = sorted_points[i][1] - sorted_points[i - 1][1]
            if delta_t_s > 0 and delta_d_m > 0:
                speed_kmh = (delta_d_m / 1000.0) / (delta_t_s / 3600.0)
                speeds.append(round(speed_kmh, 2))
            else:
                # ASSUMPTION: zero or negative delta → segment speed recorded as 0.
                speeds.append(0.0)

        std = float(np.std(speeds)) if speeds else 0.0
        return speeds, round(std, 4)

    @staticmethod
    def _parse_datetime(datetime_str: str) -> tuple[int, int, bool]:
        """Parse the ``datetime_utc`` field into temporal features.

        Args:
            datetime_str: A string in ``MM/DD/YYYY HH:MM:SS`` format.

        Returns:
            A tuple of (hour_of_day 0-23, day_of_week 0=Mon-6=Sun, is_weekend).

        Raises:
            ValueError: If the string cannot be parsed with the expected format.
        """
        if not datetime_str:
            # ASSUMPTION: missing datetime defaults to midnight Monday.
            return 0, 0, False

        dt = datetime.strptime(datetime_str, "%m/%d/%Y %H:%M:%S")
        hour_of_day = dt.hour
        day_of_week = dt.weekday()  # Monday=0 … Sunday=6
        is_weekend = day_of_week >= 5
        return hour_of_day, day_of_week, is_weekend

    @staticmethod
    def _parse_coordinates(coord_str: str) -> tuple[float, float]:
        """Parse ``"lat, lon"`` string into validated float pair.

        Args:
            coord_str: Comma-separated latitude and longitude.

        Returns:
            (lat, lon) as floats.

        Raises:
            ValueError: If the string format is wrong or values are out of range.
        """
        parts = coord_str.split(",")
        if len(parts) != 2:
            raise ValueError(
                f"origin_coordinates must be 'lat, lon'; got '{coord_str}'"
            )

        lat = float(parts[0].strip())
        lon = float(parts[1].strip())

        if not (-90.0 <= lat <= 90.0):
            raise ValueError(f"Latitude {lat} out of range [-90, 90]")
        if not (-180.0 <= lon <= 180.0):
            raise ValueError(f"Longitude {lon} out of range [-180, 180]")

        return lat, lon

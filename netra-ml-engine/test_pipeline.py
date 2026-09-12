"""Pytest test suite for the NETRA ML Engine pipeline.

Covers:
    - Zero-distance edge case
    - Missing-key payload handling
    - Malformed datetime
    - Weather API failure fallback
    - Happy-path end-to-end prediction shape check
"""

from __future__ import annotations

from typing import Any
from unittest.mock import patch

import numpy as np
import pytest

from feature_extractor import FeatureExtractor


# ===================================================================== #
#  Fixtures                                                              #
# ===================================================================== #

@pytest.fixture
def extractor() -> FeatureExtractor:
    """Return a fresh ``FeatureExtractor`` instance."""
    return FeatureExtractor()


@pytest.fixture
def valid_payload() -> dict[str, Any]:
    """A complete, well-formed payload matching the NETRA schema."""
    return {
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


# ===================================================================== #
#  1. Zero-distance edge case                                            #
# ===================================================================== #

class TestZeroDistance:
    """Verify that a zero-distance payload does not raise ZeroDivisionError."""

    def test_zero_distance_returns_zero_speeds(
        self, extractor: FeatureExtractor
    ) -> None:
        """Freeflow and current speed must be 0 when distance is 0."""
        payload: dict[str, Any] = {
            "road": "TEST-ROAD",
            "distance(meters)": 0,
            "duration(minutes)": 58.2,
            "duration_min(minutes)": 34.7,
            "origin_coordinates": "28.6139, 77.2090",
            "road_distance_timing(meters:seconds)": {},
            "datetime_utc": "03/22/2021 08:19:00",
        }
        result = extractor.parse_traffic_payload(payload)

        assert result["v_freeflow_kmh"] == 0.0
        assert result["v_current_kmh"] == 0.0
        assert result["speed_drop_ratio"] == 0.0
        assert result["low_data_quality"] is True

    def test_zero_duration_min(self, extractor: FeatureExtractor) -> None:
        """Zero ``duration_min`` must not raise ZeroDivisionError."""
        payload: dict[str, Any] = {
            "road": "TEST-ROAD",
            "distance(meters)": 10000,
            "duration(minutes)": 30.0,
            "duration_min(minutes)": 0,
            "origin_coordinates": "28.6139, 77.2090",
            "road_distance_timing(meters:seconds)": {},
            "datetime_utc": "03/22/2021 08:19:00",
        }
        result = extractor.parse_traffic_payload(payload)

        assert result["v_freeflow_kmh"] == 0.0
        assert result["low_data_quality"] is True


# ===================================================================== #
#  2. Missing-key payload                                                #
# ===================================================================== #

class TestMissingKeys:
    """Ensure graceful degradation when keys are absent."""

    def test_empty_payload(self, extractor: FeatureExtractor) -> None:
        """A completely empty dict should still return a result (not crash)."""
        result = extractor.parse_traffic_payload({})

        assert result["road"] == "UNKNOWN"
        assert result["distance_m"] == 0.0
        assert result["low_data_quality"] is True

    def test_missing_road_and_segments(self, extractor: FeatureExtractor) -> None:
        """Missing road and segments should fall back safely."""
        payload: dict[str, Any] = {
            "distance(meters)": 5000,
            "duration(minutes)": 10.0,
            "duration_min(minutes)": 5.0,
            "origin_coordinates": "0.0, 0.0",
            "datetime_utc": "01/01/2023 12:00:00",
        }
        result = extractor.parse_traffic_payload(payload)

        assert result["road"] == "UNKNOWN"
        assert result["segment_speeds_kmh"] == []
        assert result["segment_speed_std"] == 0.0


# ===================================================================== #
#  3. Malformed datetime                                                 #
# ===================================================================== #

class TestMalformedDatetime:
    """Verify that a bad datetime string raises ``ValueError``."""

    def test_wrong_format_raises(self, extractor: FeatureExtractor) -> None:
        """Datetime in ISO format instead of MM/DD/YYYY must raise."""
        payload: dict[str, Any] = {
            "road": "X",
            "distance(meters)": 1000,
            "duration(minutes)": 10.0,
            "duration_min(minutes)": 5.0,
            "origin_coordinates": "10.0, 20.0",
            "road_distance_timing(meters:seconds)": {},
            "datetime_utc": "2021-03-22T08:19:00",  # wrong format
        }
        with pytest.raises(ValueError):
            extractor.parse_traffic_payload(payload)

    def test_garbage_string_raises(self, extractor: FeatureExtractor) -> None:
        """Complete garbage datetime must raise ``ValueError``."""
        payload: dict[str, Any] = {
            "road": "X",
            "distance(meters)": 1000,
            "duration(minutes)": 10.0,
            "duration_min(minutes)": 5.0,
            "origin_coordinates": "10.0, 20.0",
            "road_distance_timing(meters:seconds)": {},
            "datetime_utc": "not-a-date",
        }
        with pytest.raises(ValueError):
            extractor.parse_traffic_payload(payload)


# ===================================================================== #
#  4. Weather API failure fallback                                       #
# ===================================================================== #

class TestWeatherFallback:
    """Ensure weather fallback returns baseline severity on failure."""

    def test_no_api_key_returns_fallback(
        self, extractor: FeatureExtractor
    ) -> None:
        """Without an API key and no env var, severity = 0.1, source = fallback."""
        with patch.dict("os.environ", {}, clear=True):
            result = extractor.fetch_weather_severity(28.0, 77.0, api_key=None)

        assert result["weather_severity"] == 0.1
        assert result["weather_source"] == "fallback"

    def test_network_error_returns_fallback(
        self, extractor: FeatureExtractor
    ) -> None:
        """A network exception must be caught and return fallback."""
        import requests

        with patch("feature_extractor.requests.get") as mock_get:
            mock_get.side_effect = requests.ConnectionError("no network")
            result = extractor.fetch_weather_severity(
                28.0, 77.0, api_key="fake-key"
            )

        assert result["weather_severity"] == 0.1
        assert result["weather_source"] == "fallback"

    def test_malformed_json_returns_fallback(
        self, extractor: FeatureExtractor
    ) -> None:
        """A response with missing keys must fallback, not crash."""
        from unittest.mock import MagicMock

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.raise_for_status.return_value = None
        mock_resp.json.return_value = {}  # missing "weather" key

        with patch("feature_extractor.requests.get", return_value=mock_resp):
            result = extractor.fetch_weather_severity(
                28.0, 77.0, api_key="fake-key"
            )

        assert result["weather_severity"] == 0.1
        assert result["weather_source"] == "fallback"


# ===================================================================== #
#  5. Happy-path end-to-end prediction shape check                       #
# ===================================================================== #

class TestEndToEnd:
    """Verify the full inference pipeline produces correctly shaped output.

    These tests require a trained model bundle to be present.  They are
    skipped (not failed) if the bundle file is missing so that unit tests
    can run in CI before training.
    """

    @pytest.fixture
    def predictor(self) -> Any:
        """Load ``NetraPredictor``, skipping if bundle is absent."""
        try:
            from inference import NetraPredictor

            return NetraPredictor(bundle_path="netra_ml_engine.pkl")
        except (FileNotFoundError, RuntimeError):
            pytest.skip("Model bundle not found; run train.py first.")

    def test_output_keys(
        self, predictor: Any, valid_payload: dict[str, Any]
    ) -> None:
        """The prediction dict must contain all required top-level keys."""
        result = predictor.predict_from_payload(valid_payload)

        required_keys = {
            "route_identifier",
            "predicted_delay_minutes",
            "risk_score",
            "confidence_percentage",
            "explainability_breakdown",
            "telemetry_summary",
        }
        assert required_keys.issubset(result.keys())

    def test_risk_score_range(
        self, predictor: Any, valid_payload: dict[str, Any]
    ) -> None:
        """``risk_score`` must be an int in [0, 100]."""
        result = predictor.predict_from_payload(valid_payload)

        assert isinstance(result["risk_score"], int)
        assert 0 <= result["risk_score"] <= 100

    def test_confidence_range(
        self, predictor: Any, valid_payload: dict[str, Any]
    ) -> None:
        """``confidence_percentage`` must be an int in [60, 97]."""
        result = predictor.predict_from_payload(valid_payload)

        assert isinstance(result["confidence_percentage"], int)
        assert 60 <= result["confidence_percentage"] <= 97

    def test_explainability_sums_to_100(
        self, predictor: Any, valid_payload: dict[str, Any]
    ) -> None:
        """The three explainability percentages must sum to exactly 100."""
        result = predictor.predict_from_payload(valid_payload)
        breakdown = result["explainability_breakdown"]

        total = (
            breakdown["traffic_congestion_pct"]
            + breakdown["adverse_weather_pct"]
            + breakdown["toll_queue_pct"]
        )
        assert total == 100

    def test_delay_is_non_negative(
        self, predictor: Any, valid_payload: dict[str, Any]
    ) -> None:
        """Predicted delay must be a non-negative float."""
        result = predictor.predict_from_payload(valid_payload)

        assert isinstance(result["predicted_delay_minutes"], float)
        assert result["predicted_delay_minutes"] >= 0.0

    def test_telemetry_summary_shape(
        self, predictor: Any, valid_payload: dict[str, Any]
    ) -> None:
        """``telemetry_summary`` must contain weather and speed fields."""
        result = predictor.predict_from_payload(valid_payload)
        ts = result["telemetry_summary"]

        assert "weather_source" in ts
        assert "weather_severity" in ts
        assert "low_data_quality" in ts
        assert "v_freeflow_kmh" in ts
        assert "speed_drop_ratio" in ts

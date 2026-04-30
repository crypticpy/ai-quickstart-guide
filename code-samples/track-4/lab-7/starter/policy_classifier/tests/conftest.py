"""Shared fixtures for contract testing.

The FakeClassifier subclass lets us run the same contract test suite
against the port without spending API credits. Real adapters run in the
integration test (test_integration.py) when ANTHROPIC_API_KEY is set.
"""

from __future__ import annotations

import pytest

from policy_classifier import Classifier, ClassificationResult, DEPARTMENTS


class FakeClassifier(Classifier):
    """In-memory adapter used for unit-level contract tests.

    Maps known phrases to known departments. Anything else falls back to
    general_info, exactly the way the real adapters fall back.
    """

    KEYWORDS = {
        "pothole": "public_works",
        "stray dog": "animal_services",
        "rats": "code_enforcement",
        "trash": "sanitation",
        "water bill": "utilities_billing",
        "permit": "permits_and_licensing",
        "snap": "human_services",
    }

    def classify(self, message: str) -> ClassificationResult:
        cleaned = self.validate_message(message).lower()
        for phrase, label in self.KEYWORDS.items():
            if phrase in cleaned:
                return ClassificationResult(
                    label=label, confidence=1.0, raw=f"matched: {phrase}"
                )
        return ClassificationResult(
            label="general_info", confidence=0.0, raw="no match"
        )


@pytest.fixture
def fake_classifier() -> FakeClassifier:
    return FakeClassifier()

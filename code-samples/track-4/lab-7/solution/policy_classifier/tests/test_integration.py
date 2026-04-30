"""Integration tests: same contract suite, run against the real adapters.

Skipped automatically when ANTHROPIC_API_KEY is not set, so unit-level
runs stay fast and free.
"""

from __future__ import annotations

import os

import pytest

from policy_classifier import ClassificationResult, DEPARTMENTS, make_classifier


pytestmark = pytest.mark.skipif(
    not os.environ.get("ANTHROPIC_API_KEY"),
    reason="ANTHROPIC_API_KEY not set; integration tests require a live API.",
)


@pytest.fixture(params=["zero_shot", "few_shot", "structured"])
def real_classifier(request):
    return make_classifier(strategy=request.param)


def test_real_adapter_returns_classification_result(real_classifier):
    result = real_classifier.classify("There is a pothole on Maple Street.")
    assert isinstance(result, ClassificationResult)
    assert result.label in DEPARTMENTS
    assert 0.0 <= result.confidence <= 1.0


def test_real_adapter_routes_pothole_to_public_works(real_classifier):
    result = real_classifier.classify("There is a pothole on Maple Street.")
    assert result.label == "public_works"


def test_real_adapter_rejects_empty(real_classifier):
    with pytest.raises(ValueError):
        real_classifier.classify("")

"""Contract tests.

Every adapter must satisfy this contract. The same suite runs against the
FakeClassifier (always) and against the real adapters in test_integration.py
when an API key is available.

If a new adapter is added, run this suite against it. If a test fails, the
adapter does not satisfy the contract; fix the adapter, not the test.
"""

from __future__ import annotations

import pytest

from policy_classifier import ClassificationResult, DEPARTMENTS

# TODO: Once make_classifier is implemented, you can also run these
# contract tests against the real adapters by parameterizing on
# ("zero_shot", "few_shot", "structured"). For starter scope, the
# FakeClassifier proves the port shape.


def test_classify_returns_classification_result(fake_classifier):
    result = fake_classifier.classify("There is a pothole on Maple Street.")
    assert isinstance(result, ClassificationResult)


def test_label_is_in_allowed_set(fake_classifier):
    result = fake_classifier.classify("My water bill tripled this month.")
    assert result.label in DEPARTMENTS


def test_confidence_is_in_range(fake_classifier):
    result = fake_classifier.classify("There is a pothole on Maple Street.")
    assert 0.0 <= result.confidence <= 1.0


def test_falls_back_for_unknown_message(fake_classifier):
    result = fake_classifier.classify("Hello, how are you today?")
    assert result.label in DEPARTMENTS  # never None, never raises


def test_rejects_empty_message(fake_classifier):
    with pytest.raises(ValueError):
        fake_classifier.classify("   ")


def test_rejects_non_string_message(fake_classifier):
    with pytest.raises(TypeError):
        fake_classifier.classify(None)  # type: ignore[arg-type]


def test_result_is_immutable(fake_classifier):
    """ClassificationResult is frozen; consumers cannot mutate it."""
    result = fake_classifier.classify("There is a pothole.")
    with pytest.raises(Exception):
        result.label = "tampered"  # type: ignore[misc]

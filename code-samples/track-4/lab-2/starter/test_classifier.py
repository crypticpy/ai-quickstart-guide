"""Tests for the lab 4.1 classifier.

These tests do not call the real API. They use a stub `complete` function so
the lab can be exercised offline. The real accuracy run happens when you
execute `python classifier.py`.
"""

from __future__ import annotations

import pytest

from classifier import (
    DEPARTMENTS,
    Prediction,
    accuracy,
    classify_few_shot,
    classify_structured,
    classify_zero_shot,
    load_dataset,
)


def fake_complete_factory(reply: str):
    """Build a stub `complete(system, user, **kwargs)` that always returns `reply`."""
    def _complete(system, user, **kwargs):
        return reply
    return _complete


def test_dataset_loads_without_comment_row():
    rows = load_dataset()
    assert len(rows) >= 50
    assert all("_comment" not in row for row in rows)
    assert all(row["label"] in DEPARTMENTS for row in rows)


def test_zero_shot_returns_prediction_with_known_label():
    complete = fake_complete_factory("public_works")
    pred = classify_zero_shot("There is a pothole", complete)
    assert isinstance(pred, Prediction)
    assert pred.label == "public_works"


def test_zero_shot_strips_whitespace_and_punctuation():
    complete = fake_complete_factory("  animal_services.\n")
    pred = classify_zero_shot("Stray dog", complete)
    assert pred.label == "animal_services"


def test_few_shot_uses_examples():
    examples = [
        {"text": "pothole on Main", "label": "public_works"},
        {"text": "dog barking", "label": "animal_services"},
    ]
    complete = fake_complete_factory("animal_services")
    pred = classify_few_shot("loose cat in yard", complete, examples=examples)
    assert pred.label == "animal_services"


def test_structured_parses_json():
    complete = fake_complete_factory(
        '{"department": "utilities_billing", "confidence": 0.92}'
    )
    pred = classify_structured("water bill spike", complete)
    assert pred.label == "utilities_billing"


def test_structured_falls_back_on_bad_json():
    complete = fake_complete_factory("not json at all")
    pred = classify_structured("anything", complete)
    assert pred.label == "general_info"


def test_accuracy_simple_case():
    pairs = [
        ("a", Prediction(label="a", raw="a")),
        ("b", Prediction(label="a", raw="a")),
    ]
    assert accuracy(pairs) == pytest.approx(0.5)

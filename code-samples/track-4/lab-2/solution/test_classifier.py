"""Tests for the lab 4.2 solution. No real API calls."""

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
    def _complete(system, user, **kwargs):
        return reply
    return _complete


def test_dataset_loads_without_comment_row():
    rows = load_dataset()
    assert len(rows) >= 50
    assert all("_comment" not in row for row in rows)
    assert all(row["label"] in DEPARTMENTS for row in rows)


def test_zero_shot_returns_prediction_with_known_label():
    pred = classify_zero_shot("anything", fake_complete_factory("public_works"))
    assert isinstance(pred, Prediction)
    assert pred.label == "public_works"


def test_zero_shot_strips_punctuation_and_case():
    pred = classify_zero_shot("anything", fake_complete_factory("  Animal_Services.\n"))
    assert pred.label == "animal_services"


def test_zero_shot_falls_back_on_unknown_label():
    pred = classify_zero_shot("anything", fake_complete_factory("not_a_department"))
    assert pred.label == "general_info"


def test_few_shot_uses_examples():
    examples = [
        {"text": "pothole", "label": "public_works"},
        {"text": "stray dog", "label": "animal_services"},
    ]
    pred = classify_few_shot(
        "loose cat", fake_complete_factory("animal_services"), examples=examples
    )
    assert pred.label == "animal_services"


def test_structured_parses_clean_json():
    reply = '{"department": "utilities_billing", "confidence": 0.91}'
    pred = classify_structured("water bill", fake_complete_factory(reply))
    assert pred.label == "utilities_billing"


def test_structured_extracts_json_from_noisy_reply():
    reply = 'Sure, here is the JSON:\n{"department": "sanitation", "confidence": 0.7}\nDone.'
    pred = classify_structured("trash pickup", fake_complete_factory(reply))
    assert pred.label == "sanitation"


def test_structured_falls_back_on_bad_json():
    pred = classify_structured("anything", fake_complete_factory("not json"))
    assert pred.label == "general_info"


def test_accuracy_arithmetic():
    pairs = [
        ("a", Prediction(label="a", raw="a")),
        ("b", Prediction(label="a", raw="a")),
        ("b", Prediction(label="b", raw="b")),
    ]
    assert accuracy(pairs) == pytest.approx(2 / 3)

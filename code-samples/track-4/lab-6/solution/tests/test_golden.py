"""Golden-set accuracy test (solution)."""

from __future__ import annotations

import pytest

from classifier import DEPARTMENTS, classify_structured

GOLDEN_ACCURACY_FLOOR = 0.85


@pytest.mark.golden
def test_structured_classifier_meets_accuracy_floor(cassette_complete, golden_cases):
    correct = 0
    mismatches: list[tuple[str, str, str]] = []
    for row in golden_cases:
        pred = classify_structured(row["text"], cassette_complete)
        if pred.label == row["label"]:
            correct += 1
        else:
            mismatches.append((row["id"], row["label"], pred.label))
    accuracy = correct / len(golden_cases)
    print(f"\ngolden accuracy: {accuracy:.2%} on {len(golden_cases)} cases")
    if mismatches:
        print("mismatches (id, gold, pred):")
        for m in mismatches:
            print(f"  {m}")
    assert accuracy >= GOLDEN_ACCURACY_FLOOR, (
        f"accuracy {accuracy:.2%} below floor {GOLDEN_ACCURACY_FLOOR:.2%}"
    )


@pytest.mark.golden
def test_every_prediction_is_in_label_set(cassette_complete, golden_cases):
    sample = golden_cases[:10]
    for row in sample:
        pred = classify_structured(row["text"], cassette_complete)
        assert pred.label in DEPARTMENTS, (
            f"label {pred.label!r} for {row['id']} is not a known department"
        )

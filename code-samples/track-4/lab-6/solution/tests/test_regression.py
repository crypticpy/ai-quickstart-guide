"""Prompt regression test (solution)."""

from __future__ import annotations

import pytest

from classifier import (
    STRUCTURED_SYSTEM_V1,
    STRUCTURED_SYSTEM_V2,
    classify_structured,
)

REGRESSION_DELTA = 0.05


def _accuracy(cases, complete, system) -> float:
    correct = 0
    for row in cases:
        pred = classify_structured(row["text"], complete, system=system)
        if pred.label == row["label"]:
            correct += 1
    return correct / len(cases)


@pytest.mark.regression
def test_candidate_prompt_does_not_regress(cassette_complete, golden_cases):
    v1 = _accuracy(golden_cases, cassette_complete, STRUCTURED_SYSTEM_V1)
    v2 = _accuracy(golden_cases, cassette_complete, STRUCTURED_SYSTEM_V2)
    print(f"\nv1 accuracy: {v1:.2%}")
    print(f"v2 accuracy: {v2:.2%}")
    assert v2 >= v1 - REGRESSION_DELTA, (
        f"candidate prompt regressed: v1={v1:.2%} v2={v2:.2%} delta>{REGRESSION_DELTA:.2%}"
    )

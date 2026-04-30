"""Golden-set accuracy test.

Run the structured classifier over every row in golden.jsonl. Pass when
accuracy is at least GOLDEN_ACCURACY_FLOOR.
"""

from __future__ import annotations

import pytest

from classifier import DEPARTMENTS, classify_structured

GOLDEN_ACCURACY_FLOOR = 0.85


@pytest.mark.golden
def test_structured_classifier_meets_accuracy_floor(cassette_complete, golden_cases):
    """TODO: run `classify_structured` on every case in `golden_cases` and
    assert that overall accuracy is >= GOLDEN_ACCURACY_FLOOR.

    Hints:
      * Use `cassette_complete` as the `complete` argument.
      * `pred.label` is the label your classifier returned.
      * Print mismatches so a failing run shows what regressed.
    """
    raise NotImplementedError("Implement test_structured_classifier_meets_accuracy_floor")


@pytest.mark.golden
def test_every_prediction_is_in_label_set(cassette_complete, golden_cases):
    """TODO: run a sample of golden cases and assert every prediction's
    label is in DEPARTMENTS. A model that returns an off-vocabulary string
    should never reach production callers.
    """
    raise NotImplementedError("Implement test_every_prediction_is_in_label_set")

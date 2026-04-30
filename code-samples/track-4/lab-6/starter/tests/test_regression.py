"""Prompt regression test.

Compares prompt version A (current production) and prompt version B
(candidate) on the golden set. Fails the candidate if accuracy drops by
more than REGRESSION_DELTA.
"""

from __future__ import annotations

import pytest

from classifier import (
    STRUCTURED_SYSTEM_V1,
    STRUCTURED_SYSTEM_V2,
    classify_structured,
)

REGRESSION_DELTA = 0.05  # five percentage points


@pytest.mark.regression
def test_candidate_prompt_does_not_regress(cassette_complete, golden_cases):
    """TODO: evaluate `classify_structured(..., system=STRUCTURED_SYSTEM_V1)`
    and `classify_structured(..., system=STRUCTURED_SYSTEM_V2)` on the
    golden set. Compute accuracy for each. Assert that V2 accuracy is at
    least V1 accuracy minus REGRESSION_DELTA. Print both numbers.
    """
    raise NotImplementedError("Implement test_candidate_prompt_does_not_regress")

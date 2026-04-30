"""LLM-as-judge tests for /answer (solution).

Gated behind RUN_JUDGE_TESTS=1 so a default `pytest` does not spend money.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

import pytest

from civic_assistant.answer import answer

COMMON_DIR = Path(__file__).resolve().parents[5] / "common"
if COMMON_DIR.exists() and str(COMMON_DIR) not in sys.path:
    sys.path.insert(0, str(COMMON_DIR))


JUDGE_CASES = [
    {
        "question": "How many days per week can I work remote?",
        "reference": "Two or three, depending on the approved pattern.",
    },
    {
        "question": "Who can approve a fully remote arrangement?",
        "reference": "The division director.",
    },
]


JUDGE_SYSTEM = (
    "You score policy answers on a 0 to 1 scale. "
    "1 means the candidate answers the question and is consistent with the reference. "
    "0 means it does not. Reply with a single number."
)


def _judge_score(question: str, reference: str, candidate: str) -> float:
    from llm_client import get_client
    complete = get_client(provider="anthropic")
    raw = complete(
        system=JUDGE_SYSTEM,
        user=(
            f"Question: {question}\n"
            f"Reference: {reference}\n"
            f"Candidate: {candidate}\n"
            "Score:"
        ),
        max_tokens=10,
        temperature=0.0,
    )
    match = re.search(r"\d*\.?\d+", raw)
    if not match:
        return 0.0
    return max(0.0, min(1.0, float(match.group(0))))


@pytest.mark.skipif(
    os.environ.get("RUN_JUDGE_TESTS") != "1",
    reason="Set RUN_JUDGE_TESTS=1 to run the live judge tests (~$1 per pass).",
)
@pytest.mark.parametrize("case", JUDGE_CASES)
def test_answer_passes_judge(case):
    result = answer(case["question"])
    score = _judge_score(case["question"], case["reference"], result.answer)
    assert score >= 0.7, f"Judge scored {score:.2f} for: {result.answer!r}"

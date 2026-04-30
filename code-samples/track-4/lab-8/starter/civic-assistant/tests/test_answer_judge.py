"""LLM-as-judge tests for /answer.

These call the live API and cost ~$0.50 to $1 per pass. Gated behind the
RUN_JUDGE_TESTS env var so a default `pytest` does not spend on them.
"""

from __future__ import annotations

import os

import pytest

from civic_assistant.answer import answer


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


def _judge_score(question: str, reference: str, candidate: str) -> float:
    """TODO: call Claude with a judge prompt and parse a 0-1 score.

    The judge prompt asks: does the candidate answer the question, and is it
    consistent with the reference? Return a float between 0 and 1.
    """
    raise NotImplementedError("Implement _judge_score.")


@pytest.mark.skipif(
    os.environ.get("RUN_JUDGE_TESTS") != "1",
    reason="Set RUN_JUDGE_TESTS=1 to run the live judge tests (~$1 per pass).",
)
@pytest.mark.parametrize("case", JUDGE_CASES)
def test_answer_passes_judge(case):
    result = answer(case["question"])
    score = _judge_score(case["question"], case["reference"], result.answer)
    assert score >= 0.7, f"Judge scored {score:.2f} for: {result.answer!r}"

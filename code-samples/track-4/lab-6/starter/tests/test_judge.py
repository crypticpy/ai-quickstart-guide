"""LLM-as-judge tests.

For open-ended outputs (summaries, rewrites) there is no single right
answer. A second model call scores the candidate against rubric criteria.
Use this technique sparingly; it adds cost and the judge has its own bias.
"""

from __future__ import annotations

import json
import re

import pytest


SUMMARIZER_SYSTEM = (
    "Summarize the constituent message in one short sentence. "
    "Keep facts. Drop opinion. Reply with the summary only."
)


JUDGE_SYSTEM = (
    "You score a summary against a constituent message on three criteria, "
    "each 0 to 5:\n"
    "  faithfulness  - no facts invented\n"
    "  coverage      - main complaint is captured\n"
    "  brevity       - one sentence, under 25 words\n"
    'Reply with JSON: {"faithfulness": int, "coverage": int, "brevity": int}'
)


SAMPLE_MESSAGES = [
    "My water bill jumped from $40 to $310 this month with no change in usage.",
    "There is a raccoon in my attic. I can hear it scratching at night.",
    "I want to apply for a food assistance program for my family.",
]


def _summarize(message: str, complete) -> str:
    return complete(
        system=SUMMARIZER_SYSTEM,
        user=message,
        max_tokens=80,
        temperature=0.0,
    ).strip()


def _judge(message: str, summary: str, complete) -> dict:
    """TODO: ask the judge to score the summary. Parse the JSON. Return a
    dict with int fields faithfulness, coverage, brevity. On parse failure,
    return all zeros so the test fails loudly.
    """
    raise NotImplementedError("Implement _judge")


@pytest.mark.judge
@pytest.mark.parametrize("message", SAMPLE_MESSAGES)
def test_summary_passes_judge_rubric(cassette_complete, message):
    """TODO: produce a summary, send it to the judge, assert each rubric
    score is at least 3 of 5. Document this floor in a comment.
    """
    raise NotImplementedError("Implement test_summary_passes_judge_rubric")

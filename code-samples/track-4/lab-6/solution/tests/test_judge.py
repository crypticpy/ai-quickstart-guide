"""LLM-as-judge tests (solution)."""

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

RUBRIC_FLOOR = 3  # out of 5 on every criterion


def _summarize(message: str, complete) -> str:
    return complete(
        system=SUMMARIZER_SYSTEM,
        user=message,
        max_tokens=80,
        temperature=0.0,
    ).strip()


def _judge(message: str, summary: str, complete) -> dict:
    raw = complete(
        system=JUDGE_SYSTEM,
        user=f"Message:\n{message}\n\nSummary:\n{summary}",
        max_tokens=120,
        temperature=0.0,
    )
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        return {"faithfulness": 0, "coverage": 0, "brevity": 0}
    try:
        payload = json.loads(match.group(0))
        return {
            "faithfulness": int(payload.get("faithfulness", 0)),
            "coverage": int(payload.get("coverage", 0)),
            "brevity": int(payload.get("brevity", 0)),
        }
    except (json.JSONDecodeError, ValueError, TypeError):
        return {"faithfulness": 0, "coverage": 0, "brevity": 0}


@pytest.mark.judge
@pytest.mark.parametrize("message", SAMPLE_MESSAGES)
def test_summary_passes_judge_rubric(cassette_complete, message):
    summary = _summarize(message, cassette_complete)
    scores = _judge(message, summary, cassette_complete)
    print(f"\nmessage: {message!r}")
    print(f"summary: {summary!r}")
    print(f"scores : {scores}")
    for key, value in scores.items():
        assert value >= RUBRIC_FLOOR, (
            f"{key} score {value} is below rubric floor {RUBRIC_FLOOR}"
        )

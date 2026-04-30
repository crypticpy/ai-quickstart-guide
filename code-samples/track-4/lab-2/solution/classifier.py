"""Lab 4.2 solution: three classifiers for constituent intake messages.

This is the reference answer. Three strategies, one evaluator, and a
`__main__` block that runs all three over the synthetic dataset.
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

COMMON_DIR = Path(__file__).resolve().parents[2] / "common"
sys.path.insert(0, str(COMMON_DIR))

from llm_client import get_client  # noqa: E402

DEPARTMENTS = [
    "public_works",
    "animal_services",
    "code_enforcement",
    "sanitation",
    "utilities_billing",
    "permits_and_licensing",
    "human_services",
    "general_info",
]


@dataclass
class Prediction:
    label: str
    raw: str


def load_dataset(path: Path | None = None) -> list[dict]:
    path = path or COMMON_DIR / "synthetic_data" / "constituent_messages.jsonl"
    rows: list[dict] = []
    for line in path.read_text().splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        if "_comment" in row:
            continue
        rows.append(row)
    return rows


def _normalize_label(text: str) -> str:
    """Pull a known department label out of a model response."""
    cleaned = text.strip().strip(".").strip().lower()
    # Direct match.
    if cleaned in DEPARTMENTS:
        return cleaned
    # Try to find any department name as a substring (handles "Department: public_works.").
    for dept in DEPARTMENTS:
        if re.search(rf"\b{re.escape(dept)}\b", cleaned):
            return dept
    return "general_info"


# ---------------------------------------------------------------------------
# Strategy 1: zero-shot
# ---------------------------------------------------------------------------

ZERO_SHOT_SYSTEM = (
    "You route constituent messages to the right department. "
    "Reply with exactly one of these labels and nothing else:\n"
    + "\n".join(f"- {d}" for d in DEPARTMENTS)
)


def classify_zero_shot(message: str, complete) -> Prediction:
    raw = complete(
        system=ZERO_SHOT_SYSTEM,
        user=f"Message:\n{message}\n\nLabel:",
        max_tokens=20,
        temperature=0.0,
    )
    return Prediction(label=_normalize_label(raw), raw=raw)


# ---------------------------------------------------------------------------
# Strategy 2: few-shot
# ---------------------------------------------------------------------------


def _format_examples(examples: list[dict]) -> str:
    lines = []
    for ex in examples:
        lines.append(f"Message: {ex['text']}\nLabel: {ex['label']}\n")
    return "\n".join(lines)


def classify_few_shot(message: str, complete, examples: list[dict]) -> Prediction:
    user = (
        "Here are labeled examples:\n\n"
        + _format_examples(examples)
        + f"\nNow classify this message. Reply with one label only.\n\nMessage: {message}\nLabel:"
    )
    raw = complete(
        system=ZERO_SHOT_SYSTEM,
        user=user,
        max_tokens=20,
        temperature=0.0,
    )
    return Prediction(label=_normalize_label(raw), raw=raw)


# ---------------------------------------------------------------------------
# Strategy 3: structured output (JSON)
# ---------------------------------------------------------------------------

STRUCTURED_SYSTEM = (
    "You route constituent messages to the right department. "
    "Reply with a single JSON object and nothing else, in this exact shape:\n"
    '{"department": "<one of the labels>", "confidence": <float between 0 and 1>}\n'
    "Allowed labels:\n"
    + "\n".join(f"- {d}" for d in DEPARTMENTS)
)


def classify_structured(message: str, complete) -> Prediction:
    raw = complete(
        system=STRUCTURED_SYSTEM,
        user=f"Message:\n{message}",
        max_tokens=80,
        temperature=0.0,
    )
    try:
        # Pull the first JSON object out of the response in case the model
        # added a leading or trailing line.
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        payload = json.loads(match.group(0)) if match else {}
        dept = str(payload.get("department", "")).strip().lower()
        if dept in DEPARTMENTS:
            return Prediction(label=dept, raw=raw)
    except (json.JSONDecodeError, AttributeError, ValueError):
        pass
    return Prediction(label="general_info", raw=raw)


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------


def accuracy(predictions: Iterable[tuple[str, Prediction]]) -> float:
    pairs = list(predictions)
    if not pairs:
        return 0.0
    correct = sum(1 for gold, pred in pairs if pred.label == gold)
    return correct / len(pairs)


def evaluate(strategy, dataset: list[dict], complete, **kwargs) -> float:
    pairs = []
    for row in dataset:
        pred = strategy(row["text"], complete, **kwargs)
        pairs.append((row["label"], pred))
    return accuracy(pairs)


if __name__ == "__main__":
    complete = get_client(provider="anthropic")
    dataset = load_dataset()
    examples, holdout = dataset[:5], dataset[5:]

    print(f"evaluating on {len(holdout)} held-out messages")
    zs = evaluate(classify_zero_shot, holdout, complete)
    fs = evaluate(classify_few_shot, holdout, complete, examples=examples)
    st = evaluate(classify_structured, holdout, complete)

    print(f"zero-shot  accuracy: {zs:.2%}")
    print(f"few-shot   accuracy: {fs:.2%}")
    print(f"structured accuracy: {st:.2%}")

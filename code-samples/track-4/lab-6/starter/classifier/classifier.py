"""Vendored from lab-2 solution. The system under test for Lab 4.6.

Three strategies (zero-shot, few-shot, structured JSON) over the synthetic
constituent intake dataset. The Lab 4.6 tests target `classify_structured`
because that is the strategy lab-2 ships to production.
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

COMMON_DIR = Path(__file__).resolve().parents[3] / "common"
sys.path.insert(0, str(COMMON_DIR))

from llm_client import get_client  # noqa: E402,F401

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
    cleaned = text.strip().strip(".").strip().lower()
    if cleaned in DEPARTMENTS:
        return cleaned
    for dept in DEPARTMENTS:
        if re.search(rf"\b{re.escape(dept)}\b", cleaned):
            return dept
    return "general_info"


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


STRUCTURED_SYSTEM_V1 = (
    "You route constituent messages to the right department. "
    "Reply with a single JSON object and nothing else, in this exact shape:\n"
    '{"department": "<one of the labels>", "confidence": <float between 0 and 1>}\n'
    "Allowed labels:\n"
    + "\n".join(f"- {d}" for d in DEPARTMENTS)
)

# Candidate prompt the regression test compares against V1.
STRUCTURED_SYSTEM_V2 = (
    "Classify the constituent message into one department. "
    "Output ONLY a JSON object: "
    '{"department": "<label>", "confidence": <0..1>}.\n'
    "Labels: " + ", ".join(DEPARTMENTS)
)


def classify_structured(message: str, complete, system: str = STRUCTURED_SYSTEM_V1) -> Prediction:
    raw = complete(
        system=system,
        user=f"Message:\n{message}",
        max_tokens=80,
        temperature=0.0,
    )
    try:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        payload = json.loads(match.group(0)) if match else {}
        dept = str(payload.get("department", "")).strip().lower()
        if dept in DEPARTMENTS:
            return Prediction(label=dept, raw=raw)
    except (json.JSONDecodeError, AttributeError, ValueError):
        pass
    return Prediction(label="general_info", raw=raw)


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

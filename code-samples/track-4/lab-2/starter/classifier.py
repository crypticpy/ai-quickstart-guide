"""Lab 4.1 starter: three classifiers for constituent intake messages.

Fill in each TODO. The tests in test_classifier.py drive the work.

The departments you must support:

    public_works, animal_services, code_enforcement, sanitation,
    utilities_billing, permits_and_licensing, human_services, general_info
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

# Make `llm_client` from common/ importable when running from this directory.
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
    """Load the labeled synthetic dataset, skipping the comment row at the top."""
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


def classify_zero_shot(message: str, complete) -> Prediction:
    """TODO: build a system prompt that lists the department names and
    instructs the model to return ONLY one of them. Call `complete(system, user)`
    and parse the response.
    """
    raise NotImplementedError("Implement classify_zero_shot")


def classify_few_shot(message: str, complete, examples: list[dict]) -> Prediction:
    """TODO: include 3-5 labeled examples in the user prompt, then ask
    the model to classify the new message. Examples are dicts with
    'text' and 'label' keys.
    """
    raise NotImplementedError("Implement classify_few_shot")


def classify_structured(message: str, complete) -> Prediction:
    """TODO: instruct the model to return a JSON object of the form
    {"department": "<one of DEPARTMENTS>", "confidence": <float 0..1>}.
    Parse the JSON. If parsing fails, return label='general_info' as a safe default.
    """
    raise NotImplementedError("Implement classify_structured")


def accuracy(predictions: Iterable[tuple[str, Prediction]]) -> float:
    """Fraction of predictions whose .label matches the gold label."""
    pairs = list(predictions)
    if not pairs:
        return 0.0
    correct = sum(1 for gold, pred in pairs if pred.label == gold)
    return correct / len(pairs)


def evaluate(strategy, dataset: list[dict], complete, **kwargs) -> float:
    """Run `strategy(message, complete, **kwargs)` over the dataset and return accuracy."""
    pairs = []
    for row in dataset:
        pred = strategy(row["text"], complete, **kwargs)
        pairs.append((row["label"], pred))
    return accuracy(pairs)


if __name__ == "__main__":
    complete = get_client(provider="anthropic")
    dataset = load_dataset()
    # Use first 5 rows as few-shot examples, evaluate on the rest.
    examples, holdout = dataset[:5], dataset[5:]

    zs = evaluate(classify_zero_shot, holdout, complete)
    fs = evaluate(classify_few_shot, holdout, complete, examples=examples)
    st = evaluate(classify_structured, holdout, complete)

    print(f"zero-shot  accuracy: {zs:.2%}")
    print(f"few-shot   accuracy: {fs:.2%}")
    print(f"structured accuracy: {st:.2%}")

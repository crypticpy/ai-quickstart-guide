"""Lab 4.3 solution extra: compare baseline RAG against no-RAG and bad-RAG.

Run:

    python eval.py

Prints a small report that shows when grounded retrieval matters and what
breaks when chunking or k are wrong. Calls the real Anthropic API.
"""

from __future__ import annotations

import sys
from pathlib import Path

COMMON_DIR = Path(__file__).resolve().parents[2] / "common"
sys.path.insert(0, str(COMMON_DIR))

from llm_client import get_client  # noqa: E402

import ingest  # noqa: E402
import rag  # noqa: E402
import retrieve  # noqa: E402

QUESTIONS = [
    "What is the agency's policy on remote work?",
    "How long do we retain general email?",
    "What is the procurement threshold for a sole source?",
    "What is the per diem rate for in-state travel?",
    "Can I use a personal email account for agency business?",
]

# Each question has a primary doc the answer should cite.
EXPECTED_DOCS = {
    "What is the agency's policy on remote work?": "01-remote-work.md",
    "How long do we retain general email?": "02-records-retention.md",
    "What is the procurement threshold for a sole source?": "05-procurement-thresholds.md",
    "What is the per diem rate for in-state travel?": "04-travel-per-diem.md",
    "Can I use a personal email account for agency business?": "08-it-acceptable-use.md",
}


def no_rag_answer(q: str, complete) -> str:
    """Ask the model directly with no retrieved context. Demonstrates hallucination risk."""
    text = complete(
        system=(
            "You are a policy assistant for the Department of Civic Operations. "
            "Answer plainly. If you do not know, say so."
        ),
        user=q,
        max_tokens=300,
        temperature=0.0,
    )
    return text.strip()


def cite_hit_rate(answers: list[tuple[str, rag.Answer]]) -> float:
    hits = 0
    for q, a in answers:
        expected = EXPECTED_DOCS.get(q)
        if expected and any(c["doc_id"] == expected for c in a.citations):
            hits += 1
    return hits / len(answers) if answers else 0.0


def main() -> None:
    # Baseline ingest with default chunking.
    ingest.ingest()
    complete = get_client(provider="anthropic")

    print("== no RAG (model only) ==")
    for q in QUESTIONS:
        print(f"\nQ: {q}")
        print(no_rag_answer(q, complete))

    print("\n== baseline RAG (chunk 600, overlap 100, k=3) ==")
    baseline: list[tuple[str, rag.Answer]] = []
    for q in QUESTIONS:
        a = rag.answer(q, k=3, complete=complete)
        baseline.append((q, a))
        print(f"\nQ: {q}\n{a.text}")
        print("citations:", [c["doc_id"] for c in a.citations])
    print(f"\nbaseline expected-doc hit rate: {cite_hit_rate(baseline):.0%}")

    print("\n== bad RAG: huge chunks (chunk 4000, overlap 0), k=3 ==")
    ingest.ingest(chunk_size=4000, overlap=0)
    huge: list[tuple[str, rag.Answer]] = []
    for q in QUESTIONS:
        a = rag.answer(q, k=3, complete=complete)
        huge.append((q, a))
    print(f"huge-chunks expected-doc hit rate: {cite_hit_rate(huge):.0%}")

    print("\n== bad RAG: tiny k (chunk 600, k=1) ==")
    ingest.ingest(chunk_size=600, overlap=100)
    tiny: list[tuple[str, rag.Answer]] = []
    for q in QUESTIONS:
        a = rag.answer(q, k=1, complete=complete)
        tiny.append((q, a))
    print(f"k=1 expected-doc hit rate: {cite_hit_rate(tiny):.0%}")


if __name__ == "__main__":
    main()

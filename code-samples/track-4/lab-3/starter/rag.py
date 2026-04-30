"""Lab 4.3 starter: retrieve, augment, generate.

Fill in the TODOs. The /ask endpoint in main.py calls answer().
"""

from __future__ import annotations

import sys
from dataclasses import dataclass, field
from pathlib import Path

COMMON_DIR = Path(__file__).resolve().parents[2] / "common"
sys.path.insert(0, str(COMMON_DIR))

from llm_client import get_client  # noqa: E402

from retrieve import Hit, retrieve  # noqa: E402

SYSTEM_PROMPT = (
    "You are a policy assistant for a government agency. "
    "Answer the user's question using only the provided policy excerpts. "
    "If the excerpts do not contain the answer, say you do not have that "
    "information in the policy library and recommend contacting the named "
    "office. Quote short phrases when useful. After the answer, list the "
    "citations you used in the form [doc_id]."
)


@dataclass
class Answer:
    text: str
    citations: list[dict] = field(default_factory=list)
    raw_context: str = ""


def format_context(hits: list[Hit]) -> str:
    """TODO: render retrieved chunks as a single context string the model can read.

    Each chunk should be wrapped with a clear header that includes its
    doc_id and title so the model can cite by id. Suggested format:

        [doc_id: 01-remote-work.md | title: Remote Work Policy]
        <chunk text>
        ---

    Return an empty string if hits is empty.
    """
    raise NotImplementedError("Implement format_context")


def answer(question: str, k: int = 3, complete=None) -> Answer:
    """TODO: retrieve, format, call the LLM, and return an Answer.

    Steps:
    1. Call retrieve(question, k=k) to get hits.
    2. Build the context string with format_context().
    3. Call complete(system=SYSTEM_PROMPT, user=...) where the user message
       contains the question and the context block.
    4. Build citations from hits (one entry per unique doc_id with title).
    5. Return Answer(text=..., citations=..., raw_context=...).

    `complete` is the callable returned by get_client(). When None, fall
    back to the default Anthropic client. Tests pass a stub `complete`.
    """
    raise NotImplementedError("Implement answer")


if __name__ == "__main__":
    q = " ".join(sys.argv[1:]) or "What is the agency's policy on remote work?"
    result = answer(q)
    print(result.text)
    print()
    print("citations:")
    for c in result.citations:
        print(f"  - {c['doc_id']} ({c['title']})")

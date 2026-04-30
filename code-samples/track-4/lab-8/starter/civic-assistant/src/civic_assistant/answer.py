"""RAG-grounded policy answers.

Reads the markdown corpus once at module import, chunks by header, and
serves grounded answers with citations. The retrieval step is keyword
overlap with a small stoplist; for this corpus that is enough.

TODO for the learner:

- Implement `_load_chunks` to read every .md file under settings.policy_corpus_dir
  and split each file into (title, header_path, text) tuples.
- Implement `retrieve(question, k)` returning the top-k chunks by overlap score.
- Implement `answer(question)` building a grounded prompt and returning an
  AnswerResult with citations.
- If retrieval scores all fall below settings.retrieval_score_floor, return
  the fixed "I do not have a policy on that..." response.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Chunk:
    title: str
    header_path: str
    text: str
    score: float = 0.0


@dataclass
class AnswerResult:
    answer: str
    citations: list[str]
    retrieved_chunks: list[Chunk]


NO_POLICY_RESPONSE = (
    "I do not have a policy on that. Please contact the relevant department."
)


def _load_chunks() -> list[Chunk]:
    """TODO: read every markdown file under settings.policy_corpus_dir,
    split on H1/H2 headers, return Chunk objects.
    """
    raise NotImplementedError("Implement _load_chunks.")


def retrieve(question: str, k: int = 3) -> list[Chunk]:
    """TODO: keyword-overlap ranking, return top k chunks."""
    raise NotImplementedError("Implement retrieve.")


def answer(question: str) -> AnswerResult:
    """TODO: build a grounded prompt from the top chunks and call the LLM.

    If the top score is below settings.retrieval_score_floor, return
    NO_POLICY_RESPONSE with no citations and no retrieved_chunks.
    """
    raise NotImplementedError("Implement answer.")

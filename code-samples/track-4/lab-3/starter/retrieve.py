"""Lab 4.3 starter: similarity search over the Chroma collection.

Fill in the TODO. The retriever returns the top-k chunks for a question,
along with their citation metadata.
"""

from __future__ import annotations

from dataclasses import dataclass

from ingest import get_collection


@dataclass
class Hit:
    chunk_id: str
    doc_id: str
    title: str
    text: str
    score: float          # lower = more similar (Chroma returns distance)


def retrieve(question: str, k: int = 3) -> list[Hit]:
    """TODO: query the Chroma collection for the top-k chunks for `question`.

    Return a list of Hit objects ordered from most similar to least similar.
    If the collection is empty, return [].
    """
    raise NotImplementedError("Implement retrieve")


if __name__ == "__main__":
    import sys

    q = " ".join(sys.argv[1:]) or "What is the agency's policy on remote work?"
    hits = retrieve(q)
    for h in hits:
        print(f"[{h.score:.3f}] {h.doc_id} :: {h.title}")
        print(h.text[:200].replace("\n", " "))
        print()

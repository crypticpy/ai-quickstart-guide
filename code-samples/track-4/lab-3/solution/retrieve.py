"""Lab 4.3 solution: similarity search over the Chroma collection."""

from __future__ import annotations

from dataclasses import dataclass

from ingest import get_collection


@dataclass
class Hit:
    chunk_id: str
    doc_id: str
    title: str
    text: str
    score: float


def retrieve(question: str, k: int = 3) -> list[Hit]:
    collection = get_collection()
    if collection.count() == 0:
        return []

    res = collection.query(query_texts=[question], n_results=k)
    ids = res.get("ids", [[]])[0]
    docs = res.get("documents", [[]])[0]
    metas = res.get("metadatas", [[]])[0]
    distances = res.get("distances", [[0.0] * len(ids)])[0]

    hits: list[Hit] = []
    for chunk_id, text, meta, dist in zip(ids, docs, metas, distances):
        hits.append(
            Hit(
                chunk_id=chunk_id,
                doc_id=(meta or {}).get("doc_id", chunk_id.split("#")[0]),
                title=(meta or {}).get("title", ""),
                text=text or "",
                score=float(dist) if dist is not None else 0.0,
            )
        )
    return hits


if __name__ == "__main__":
    import sys

    q = " ".join(sys.argv[1:]) or "What is the agency's policy on remote work?"
    hits = retrieve(q)
    for h in hits:
        print(f"[{h.score:.3f}] {h.doc_id} :: {h.title}")
        print(h.text[:200].replace("\n", " "))
        print()

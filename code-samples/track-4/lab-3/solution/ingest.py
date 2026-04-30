"""Lab 4.3 solution: load policy docs, chunk, embed, store in Chroma."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import chromadb
from chromadb.utils import embedding_functions

DATA_DIR = Path(__file__).parent / "data"
CHROMA_DIR = Path(__file__).parent / ".chroma"
COLLECTION_NAME = "policies"

EMBED_MODEL = "all-MiniLM-L6-v2"

CHUNK_SIZE = 600
CHUNK_OVERLAP = 100

# Refuse to ingest any single document larger than this. Policy docs in real
# agency corpora are typically tens of KB; a multi-MB upload is almost always
# a misrouted PDF/binary or a runaway export and would balloon embedding cost.
MAX_DOC_BYTES = 1_000_000


@dataclass
class Chunk:
    doc_id: str
    chunk_id: str
    text: str
    title: str


def load_documents(data_dir: Path = DATA_DIR) -> list[dict]:
    docs: list[dict] = []
    for path in sorted(data_dir.glob("*.md")):
        size = path.stat().st_size
        if size > MAX_DOC_BYTES:
            raise ValueError(
                f"{path.name} is {size} bytes; max {MAX_DOC_BYTES}. "
                "Split the document or raise MAX_DOC_BYTES deliberately."
            )
        raw = path.read_text(encoding="utf-8")
        lines = raw.splitlines()
        # Drop the first <!-- SYNTHETIC ... --> comment line if present.
        if lines and lines[0].lstrip().startswith("<!--"):
            lines = lines[1:]
        title = path.stem  # fallback
        for line in lines:
            stripped = line.strip()
            if stripped.startswith("# "):
                title = stripped[2:].strip()
                break
        body = "\n".join(lines).strip()
        docs.append({"doc_id": path.name, "title": title, "text": body})
    return docs


def chunk_text(
    text: str,
    *,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[str]:
    if not text:
        return []
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be in [0, chunk_size)")

    chunks: list[str] = []
    step = chunk_size - overlap
    start = 0
    n = len(text)
    while start < n:
        end = min(start + chunk_size, n)
        piece = text[start:end].strip()
        if piece:
            chunks.append(piece)
        if end == n:
            break
        start += step
    return chunks


def build_chunks(
    documents: Iterable[dict],
    *,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[Chunk]:
    out: list[Chunk] = []
    for doc in documents:
        pieces = chunk_text(doc["text"], chunk_size=chunk_size, overlap=overlap)
        for i, piece in enumerate(pieces):
            out.append(
                Chunk(
                    doc_id=doc["doc_id"],
                    chunk_id=f"{doc['doc_id']}#{i}",
                    text=piece,
                    title=doc["title"],
                )
            )
    return out


def get_collection(persist_dir: Path = CHROMA_DIR):
    client = chromadb.PersistentClient(path=str(persist_dir))
    embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=EMBED_MODEL
    )
    return client.get_or_create_collection(
        name=COLLECTION_NAME, embedding_function=embed_fn
    )


def ingest(
    reset: bool = True,
    *,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> int:
    docs = load_documents()
    chunks = build_chunks(docs, chunk_size=chunk_size, overlap=overlap)
    collection = get_collection()

    if reset:
        existing = collection.get()
        if existing.get("ids"):
            collection.delete(ids=existing["ids"])

    if not chunks:
        return 0

    collection.add(
        ids=[c.chunk_id for c in chunks],
        documents=[c.text for c in chunks],
        metadatas=[{"doc_id": c.doc_id, "title": c.title} for c in chunks],
    )
    return len(chunks)


if __name__ == "__main__":
    n = ingest()
    print(f"ingested {n} chunks into Chroma at {CHROMA_DIR}")

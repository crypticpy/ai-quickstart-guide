"""Lab 4.3 starter: load policy docs, chunk them, embed, and store in Chroma.

Fill in each TODO. The tests in test_rag.py drive the work.

The corpus lives in ./data as ~25 markdown files. Each file is a fictional
policy from the Department of Civic Operations. The first line of each file
is an HTML comment marking it as synthetic. Strip that comment before chunking.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import chromadb
from chromadb.utils import embedding_functions

DATA_DIR = Path(__file__).parent / "data"
CHROMA_DIR = Path(__file__).parent / ".chroma"
COLLECTION_NAME = "policies"

# all-MiniLM-L6-v2 is small, fast, and runs on CPU. No API key needed.
EMBED_MODEL = "all-MiniLM-L6-v2"

# Chunking defaults. The exercises ask the learner to vary these.
CHUNK_SIZE = 600          # characters per chunk
CHUNK_OVERLAP = 100       # characters of overlap between adjacent chunks


@dataclass
class Chunk:
    doc_id: str           # source filename, e.g. "01-remote-work.md"
    chunk_id: str         # f"{doc_id}#{n}"
    text: str             # the chunk body
    title: str            # the H1 of the source doc, used for citation rendering


def load_documents(data_dir: Path = DATA_DIR) -> list[dict]:
    """TODO: read every .md file in data_dir.

    For each file:
    - Skip the leading <!-- SYNTHETIC ... --> comment line.
    - Capture the first H1 (line beginning with '# ') as the title.
    - Return a list of dicts: {"doc_id": filename, "title": str, "text": body}.

    Sort the returned list by doc_id so ingestion order is deterministic.
    """
    raise NotImplementedError("Implement load_documents")


def chunk_text(
    text: str,
    *,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> list[str]:
    """TODO: split text into overlapping windows of approximately chunk_size
    characters with `overlap` characters shared between adjacent chunks.

    A simple character-window approach is fine for this lab. Real production
    code uses a token-aware splitter; the lab discusses the trade-off.
    Return an empty list for empty text. Strip whitespace from each chunk.
    """
    raise NotImplementedError("Implement chunk_text")


def build_chunks(documents: Iterable[dict]) -> list[Chunk]:
    """TODO: turn each document into a list of Chunk objects.

    chunk_id format is "<doc_id>#<n>" where n starts at 0.
    """
    raise NotImplementedError("Implement build_chunks")


def get_collection(persist_dir: Path = CHROMA_DIR):
    """Return the Chroma collection, creating it if needed.

    The local sentence-transformers embedding function runs without an API key.
    """
    client = chromadb.PersistentClient(path=str(persist_dir))
    embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=EMBED_MODEL
    )
    return client.get_or_create_collection(
        name=COLLECTION_NAME, embedding_function=embed_fn
    )


def ingest(reset: bool = True) -> int:
    """Load, chunk, and store. Return the number of chunks ingested."""
    docs = load_documents()
    chunks = build_chunks(docs)
    collection = get_collection()

    if reset:
        # Drop any existing rows so re-running ingest is idempotent.
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

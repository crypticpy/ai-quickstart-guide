"""Tests for lab 4.3.

The retrieval and ingest tests touch a local Chroma store and the local
sentence-transformers model. The first run downloads the model (~80 MB).
The rag.answer test uses a stub `complete` and does not call the network.
"""

from __future__ import annotations

import shutil
from pathlib import Path

import pytest

import ingest
import rag
import retrieve


HERE = Path(__file__).parent


@pytest.fixture(scope="module", autouse=True)
def fresh_chroma():
    """Build a clean Chroma store once for the whole test module."""
    chroma_dir = HERE / ".chroma"
    if chroma_dir.exists():
        shutil.rmtree(chroma_dir)
    n = ingest.ingest()
    assert n > 0, "ingest must add at least one chunk"
    yield


def test_load_documents_skips_synthetic_comment_and_keeps_titles():
    docs = ingest.load_documents()
    assert len(docs) == 25
    for d in docs:
        assert "<!-- SYNTHETIC" not in d["text"]
        assert d["title"]
    titles = {d["title"] for d in docs}
    assert "Remote Work Policy" in titles
    assert "Records Retention Schedule" in titles


def test_chunk_text_produces_overlapping_windows():
    text = "a" * 1500
    chunks = ingest.chunk_text(text, chunk_size=600, overlap=100)
    assert len(chunks) >= 2
    # First and second chunks share the overlap region.
    assert chunks[0][-50:] in chunks[1] or chunks[1].startswith(chunks[0][-100:])


def test_build_chunks_attaches_doc_id_and_title():
    docs = ingest.load_documents()
    chunks = ingest.build_chunks(docs)
    assert chunks
    sample = chunks[0]
    assert sample.doc_id.endswith(".md")
    assert sample.title
    assert sample.chunk_id.startswith(sample.doc_id + "#")


def test_retrieve_finds_remote_work_for_relevant_query():
    hits = retrieve.retrieve("Can I work from home two days a week?", k=3)
    assert hits
    assert any("remote-work" in h.doc_id for h in hits)


def test_retrieve_finds_records_retention_for_records_query():
    hits = retrieve.retrieve("How long do we keep email?", k=3)
    assert hits
    assert any("records-retention" in h.doc_id for h in hits)


def test_answer_returns_text_and_citations_using_stub():
    def fake_complete(system, user, **kwargs):
        return "You can work from home up to two days a week. [01-remote-work.md]"

    result = rag.answer(
        "Can I work from home?", k=3, complete=fake_complete
    )
    assert result.text
    assert result.citations
    # Each citation has both a doc_id and a title.
    for c in result.citations:
        assert c["doc_id"]
        assert c["title"]

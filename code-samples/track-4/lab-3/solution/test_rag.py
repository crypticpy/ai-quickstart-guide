"""Tests for the lab 4.3 solution."""

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
    chroma_dir = HERE / ".chroma"
    if chroma_dir.exists():
        shutil.rmtree(chroma_dir)
    n = ingest.ingest()
    assert n > 0
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


def test_chunk_text_overlap_and_size():
    text = "a" * 1500
    chunks = ingest.chunk_text(text, chunk_size=600, overlap=100)
    assert len(chunks) >= 2
    assert all(len(c) <= 600 for c in chunks)


def test_chunk_text_empty_returns_empty():
    assert ingest.chunk_text("") == []


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


def test_retrieve_respects_k():
    hits = retrieve.retrieve("travel reimbursement", k=2)
    assert len(hits) <= 2


def test_format_context_renders_doc_id_header():
    hit = retrieve.Hit(
        chunk_id="01-remote-work.md#0",
        doc_id="01-remote-work.md",
        title="Remote Work Policy",
        text="Hybrid two days remote per week.",
        score=0.1,
    )
    context = rag.format_context([hit])
    assert "doc_id: 01-remote-work.md" in context
    assert "Remote Work Policy" in context
    assert "Hybrid two days remote" in context


def test_format_context_empty():
    assert rag.format_context([]) == ""


def test_answer_returns_text_and_citations_using_stub():
    def fake_complete(system, user, **kwargs):
        assert "Question:" in user
        return "Two days a week is allowed. [01-remote-work.md]"

    result = rag.answer(
        "Can I work from home?", k=3, complete=fake_complete
    )
    assert "Two days a week" in result.text
    assert result.citations
    for c in result.citations:
        assert c["doc_id"]
        assert c["title"]

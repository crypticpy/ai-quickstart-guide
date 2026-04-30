"""Tests for the RAG /answer endpoint that do not require API access.

The retrieval layer is exercised directly; the model call is patched.
"""

from __future__ import annotations

from civic_assistant.answer import retrieve, NO_POLICY_RESPONSE


def test_retrieve_returns_chunks_for_known_topic():
    # TODO: implement once retrieve() is wired up.
    chunks = retrieve("How many days remote work am I eligible for?", k=3)
    assert len(chunks) > 0
    assert any("remote" in c.text.lower() for c in chunks)


def test_retrieve_returns_no_high_score_for_unknown_topic():
    # A question outside the corpus should have low overlap scores.
    chunks = retrieve("What is the policy on lunar landing missions?", k=3)
    if chunks:
        assert max(c.score for c in chunks) < 0.5


def test_no_policy_response_is_a_constant():
    assert "do not have a policy" in NO_POLICY_RESPONSE.lower()

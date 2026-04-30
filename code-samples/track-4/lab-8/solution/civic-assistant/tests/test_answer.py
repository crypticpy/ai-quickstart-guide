"""Tests for the RAG /answer endpoint (solution)."""

from __future__ import annotations

from civic_assistant.answer import (
    NO_POLICY_RESPONSE,
    answer,
    retrieve,
)


def test_retrieve_returns_chunks_for_known_topic():
    chunks = retrieve("How many days remote work am I eligible for?", k=3)
    assert len(chunks) > 0
    assert any("remote" in c.text.lower() for c in chunks)


def test_retrieve_returns_no_high_score_for_unknown_topic():
    chunks = retrieve("What is the policy on lunar landing missions?", k=3)
    if chunks:
        assert max(c.score for c in chunks) < 0.5


def test_no_policy_response_is_a_constant():
    assert "do not have a policy" in NO_POLICY_RESPONSE.lower()


def test_answer_short_circuits_on_unknown_topic():
    """No live API call: low retrieval score returns the fixed response."""
    def explode(*_args, **_kwargs):
        raise AssertionError("complete() should not be called when score is below floor")

    result = answer("policy on lunar landing missions", complete=explode)
    assert result.answer == NO_POLICY_RESPONSE
    assert result.citations == []


def test_answer_calls_complete_when_chunks_match():
    captured: dict = {}

    def fake_complete(system, user, **kwargs):
        captured["system"] = system
        captured["user"] = user
        return "Per the Remote Work Policy, two days remote per week is the default pattern."

    result = answer("How many days remote work am I eligible for?", complete=fake_complete)
    assert "Remote" in result.answer
    assert "Sources:" in captured["user"]
    assert result.retrieved_chunks

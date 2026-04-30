"""Tool-call trace tests for /triage (solution)."""

from __future__ import annotations

import json

from civic_assistant import classify as classify_module
from civic_assistant.triage import run_triage


def _patch_classifier(monkeypatch, label: str = "permits_and_licensing"):
    def fake_complete(system, user, **_kwargs):
        return json.dumps({"department": label, "confidence": 0.9})
    monkeypatch.setattr(classify_module, "_get_complete", lambda fn=fake_complete: fn)


def test_triage_emits_classify_then_lookup_for_permit_question(
    monkeypatch, stub_client_factory, stub_block, stub_response
):
    _patch_classifier(monkeypatch, "permits_and_licensing")
    client = stub_client_factory([
        stub_response(
            content=[stub_block(
                type="tool_use", id="t1", name="classify_message",
                input={"message": "What is the status of permit P-2026-00101?"},
            )],
            stop_reason="tool_use",
        ),
        stub_response(
            content=[stub_block(
                type="tool_use", id="t2", name="lookup_permit_by_id",
                input={"permit_id": "P-2026-00101"},
            )],
            stop_reason="tool_use",
        ),
        stub_response(
            content=[stub_block(
                type="text", text="Your permit is approved.",
            )],
            stop_reason="end_turn",
        ),
    ])
    result = run_triage(
        "What is the status of permit P-2026-00101?",
        client=client, max_iterations=4,
    )
    tools_used = [entry.tool for entry in result.trace]
    assert tools_used == ["classify_message", "lookup_permit_by_id"]
    assert result.iterations == 3
    assert result.stopped_reason == "end_turn"
    # The lookup tool returned the real permit record.
    lookup_entry = result.trace[1]
    assert lookup_entry.result["status"] == "approved"


def test_triage_escalates_when_message_is_ambiguous(
    monkeypatch, stub_client_factory, stub_block, stub_response
):
    _patch_classifier(monkeypatch, "general_info")
    client = stub_client_factory([
        stub_response(
            content=[stub_block(
                type="tool_use", id="t1", name="classify_message",
                input={"message": "the thing is broken"},
            )],
            stop_reason="tool_use",
        ),
        stub_response(
            content=[stub_block(
                type="tool_use", id="t2", name="escalate_to_human",
                input={"reason": "ambiguous request"},
            )],
            stop_reason="tool_use",
        ),
        stub_response(
            content=[stub_block(
                type="text", text="A human will follow up.",
            )],
            stop_reason="end_turn",
        ),
    ])
    result = run_triage("the thing is broken", client=client, max_iterations=4)
    tools_used = [entry.tool for entry in result.trace]
    assert "escalate_to_human" in tools_used


def test_triage_stops_at_max_iterations(
    monkeypatch, stub_client_factory, stub_block, stub_response
):
    _patch_classifier(monkeypatch, "permits_and_licensing")
    looping = [
        stub_response(
            content=[stub_block(
                type="tool_use", id=f"t{i}", name="classify_message",
                input={"message": "loop"},
            )],
            stop_reason="tool_use",
        )
        for i in range(10)
    ]
    client = stub_client_factory(looping)
    result = run_triage("loop", client=client, max_iterations=2)
    assert result.stopped_reason == "max_iterations"
    assert result.iterations == 2

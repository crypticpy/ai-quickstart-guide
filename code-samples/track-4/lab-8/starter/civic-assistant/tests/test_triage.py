"""Tool-call trace tests for /triage.

Each test asserts on the trace shape, not on the wording of the final answer.
A test that asserts "the answer contains the word approved" is fragile against
prompt tweaks; a trace assertion is not.
"""

from __future__ import annotations

from civic_assistant.triage import run_triage


def test_triage_emits_classify_then_lookup_for_permit_question(
    stub_client_factory, stub_block, stub_response
):
    """Model classifies, then looks up the permit, then answers."""
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
    # TODO: implement run_triage, then this test should pass.
    result = run_triage(
        "What is the status of permit P-2026-00101?",
        client=client, max_iterations=4,
    )
    tools_used = [entry.tool for entry in result.trace]
    assert tools_used == ["classify_message", "lookup_permit_by_id"]
    assert result.iterations == 3
    assert result.stopped_reason == "end_turn"


def test_triage_escalates_when_message_is_ambiguous(
    stub_client_factory, stub_block, stub_response
):
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
    stub_client_factory, stub_block, stub_response
):
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

"""Triage agent loop."""

from __future__ import annotations

import json
import time
from dataclasses import dataclass, field

from civic_assistant._vendored.permits import (
    run_tool as run_permit_tool,
    tool_schemas as permit_tool_schemas,
)
from civic_assistant.classify import classify_message


SYSTEM_PROMPT = (
    "You triage constituent messages for a city services agency. "
    "First call classify_message to identify the department. "
    "If the classification is permits_and_licensing and the message contains "
    "a permit id (form P-YYYY-NNNNN), call lookup_permit_by_id. "
    "If the question is ambiguous or the data is missing, call escalate_to_human. "
    "After the tools have returned, reply in plain English."
)


@dataclass
class TriageTraceEntry:
    tool: str
    arguments: dict
    result: dict
    latency_ms: int


@dataclass
class TriageResult:
    answer: str
    trace: list[TriageTraceEntry] = field(default_factory=list)
    iterations: int = 0
    stopped_reason: str = "end_turn"


def _tool_schemas() -> list[dict]:
    schemas = list(permit_tool_schemas())
    schemas.insert(0, {
        "name": "classify_message",
        "description": (
            "Classify a constituent message into a department. "
            "Always call this first."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string",
                    "description": "The constituent message text.",
                }
            },
            "required": ["message"],
        },
    })
    return schemas


def _run_tool(name: str, arguments: dict) -> dict:
    if name == "classify_message":
        result = classify_message(arguments.get("message", ""))
        return {
            "department": result.department,
            "confidence": result.confidence,
        }
    return run_permit_tool(name, arguments)


def _stringify(value) -> str:
    try:
        return json.dumps(value)
    except (TypeError, ValueError):
        return str(value)


def run_triage(message: str, *, client, model: str = "claude-sonnet-4-5",
               max_iterations: int = 6) -> TriageResult:
    schemas = _tool_schemas()
    messages: list[dict] = [{"role": "user", "content": message}]
    trace: list[TriageTraceEntry] = []

    for iteration in range(1, max_iterations + 1):
        response = client.messages.create(
            model=model,
            max_tokens=600,
            system=SYSTEM_PROMPT,
            tools=schemas,
            messages=messages,
        )

        text_blocks = [b for b in response.content if b.type == "text"]
        tool_blocks = [b for b in response.content if b.type == "tool_use"]

        if not tool_blocks:
            answer_text = "".join((b.text or "") for b in text_blocks).strip()
            return TriageResult(
                answer=answer_text,
                trace=trace,
                iterations=iteration,
                stopped_reason="end_turn",
            )

        messages.append({
            "role": "assistant",
            "content": [
                {"type": "tool_use", "id": b.id, "name": b.name, "input": b.input or {}}
                for b in tool_blocks
            ],
        })

        tool_results = []
        for tool_block in tool_blocks:
            start = time.perf_counter()
            result = _run_tool(tool_block.name, tool_block.input or {})
            latency_ms = int((time.perf_counter() - start) * 1000)
            trace.append(TriageTraceEntry(
                tool=tool_block.name,
                arguments=dict(tool_block.input or {}),
                result=result,
                latency_ms=latency_ms,
            ))
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_block.id,
                "content": _stringify(result),
            })
        messages.append({"role": "user", "content": tool_results})

    return TriageResult(
        answer="I could not finish triage. A human reviewer will follow up.",
        trace=trace,
        iterations=max_iterations,
        stopped_reason="max_iterations",
    )

"""Triage agent loop.

The triage endpoint exposes three tools to the model:

- classify_message  (the Lab 4.7 classifier exposed as a tool call)
- lookup_permit_by_id  (vendored from Lab 4.4)
- escalate_to_human  (vendored from Lab 4.4)

The loop is the same shape as Lab 4.4: send the conversation, run any tool
the model picks, append the tool result, repeat up to max_iterations.

TODO for the learner:

- Build the tool schema list from classify + the vendored permit tools.
- Implement `run_triage(message, *, client, max_iterations)`.
- Capture every tool call into a TriageTrace entry the test suite asserts on.
"""

from __future__ import annotations

from dataclasses import dataclass, field


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


def run_triage(message: str, *, client, max_iterations: int = 6) -> TriageResult:
    """TODO: implement the agent loop.

    Use the vendored Lab 4.4 patterns. The classify tool dispatches to
    `classify.classify_message`. The permit tools dispatch to the vendored
    Lab 4.4 `run_tool`. Stop at max_iterations to prevent runaway loops.
    """
    raise NotImplementedError("Implement run_triage.")

"""Lab 4.4 starter: the agent loop.

The agent loop is small. It is the single most important pattern in this lab.

    1. Send the conversation (with the user's message) and the tool list to the model.
    2. If the model returns a final text response, we are done.
    3. If the model returns a tool_use block, run the tool, append the result
       as a tool_result block, and go back to step 1.
    4. Stop after `max_iterations` to prevent runaway loops.

Fill in the TODOs. The tests in test_agent.py drive the work.
"""

from __future__ import annotations

import os
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

# Make `llm_client` from common/ importable when running from this directory.
COMMON_DIR = Path(__file__).resolve().parents[2] / "common"
sys.path.insert(0, str(COMMON_DIR))

from tools import TOOLS, run_tool, tool_schemas  # noqa: E402

SYSTEM_PROMPT = (
    "You are a permit-status assistant for a city permitting office. "
    "You answer constituent questions about their permit applications. "
    "You have three tools. Pick one based on what the constituent gave you:\n"
    "- If they gave a permit id (form P-YYYY-NNNNN), use lookup_permit_by_id.\n"
    "- If they gave an address but no permit id, use list_permits_by_address.\n"
    "- If the question is ambiguous, the data is missing, or the request is "
    "  outside the other two tools, use escalate_to_human.\n"
    "Do not invent permit ids, dates, or statuses. If a tool returns an error "
    "or no records, escalate or ask for clarification. Reply in plain English."
)

MAX_ITERATIONS = 6


@dataclass
class TraceEntry:
    tool: str
    arguments: dict
    result: dict
    latency_ms: int


@dataclass
class AgentResult:
    answer: str
    trace: list[TraceEntry] = field(default_factory=list)
    iterations: int = 0
    stopped_reason: str = "end_turn"


def run_agent(user_message: str, *, client, model: str = "claude-sonnet-4-5",
              max_iterations: int = MAX_ITERATIONS) -> AgentResult:
    """TODO: implement the agent loop.

    `client` is an Anthropic client (or a stub with the same .messages.create surface).
    Use `tool_schemas()` for the tool definitions you pass to the model.
    Use `run_tool(name, arguments)` to execute any tool the model picks.

    Return an AgentResult with the final text answer and the full trace.
    """
    raise NotImplementedError("Implement run_agent")

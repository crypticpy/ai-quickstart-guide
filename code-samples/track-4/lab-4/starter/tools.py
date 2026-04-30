"""Lab 4.4 starter: tool definitions for the permit-status agent.

Each tool has two pieces:

1. A JSON schema that the model sees. The schema names the tool, describes when
   to use it, and lists its arguments.
2. A Python function that runs when the agent decides to call the tool.

Fill in the TODOs. The tests in test_agent.py drive the work.
"""

from __future__ import annotations

import json
import re
import secrets
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

DATA_PATH = Path(__file__).resolve().parent / "data" / "permits.json"


def _load_permits() -> list[dict]:
    payload = json.loads(DATA_PATH.read_text())
    return payload["permits"]


# ---------------------------------------------------------------------------
# Guardrail helpers
# ---------------------------------------------------------------------------

PERMIT_ID_PATTERN = re.compile(r"^P-\d{4}-\d{5}$")
ADDRESS_DENY_PATTERNS = [
    re.compile(r"<\s*script", re.IGNORECASE),
    re.compile(r"ignore (all )?previous instructions", re.IGNORECASE),
    re.compile(r"system:\s", re.IGNORECASE),
]


def _looks_like_injection(text: str) -> bool:
    return any(p.search(text) for p in ADDRESS_DENY_PATTERNS)


# ---------------------------------------------------------------------------
# Tool 1: lookup_permit_by_id
# ---------------------------------------------------------------------------


def lookup_permit_by_id(permit_id: str) -> dict:
    """TODO: validate the permit_id format with PERMIT_ID_PATTERN.
    Return the matching permit record, or {"error": "not_found"} if missing.
    On a malformed id, return {"error": "invalid_permit_id"}.
    """
    raise NotImplementedError("Implement lookup_permit_by_id")


# ---------------------------------------------------------------------------
# Tool 2: list_permits_by_address
# ---------------------------------------------------------------------------


def list_permits_by_address(address: str) -> dict:
    """TODO: reject obvious prompt injection in `address` using
    `_looks_like_injection`. Return {"error": "rejected_input"} if it triggers.
    Otherwise do a case-insensitive substring match against permit['address']
    and return {"permits": [...]} (empty list if no matches).
    """
    raise NotImplementedError("Implement list_permits_by_address")


# ---------------------------------------------------------------------------
# Tool 3: escalate_to_human
# ---------------------------------------------------------------------------


def escalate_to_human(reason: str) -> dict:
    """TODO: produce a synthetic ticket id like "ESC-<8 hex chars>" and
    return {"ticket_id": ..., "reason": reason}. Truncate `reason` to 500 chars.
    """
    raise NotImplementedError("Implement escalate_to_human")


# ---------------------------------------------------------------------------
# Tool registry: dispatch table + JSON schemas the model sees
# ---------------------------------------------------------------------------


@dataclass
class Tool:
    name: str
    description: str
    input_schema: dict[str, Any]
    handler: Callable[..., dict]


TOOLS: dict[str, Tool] = {
    "lookup_permit_by_id": Tool(
        name="lookup_permit_by_id",
        description=(
            "Look up a single permit by its identifier. "
            "Use this when the constituent gives you a permit id like P-2026-00101."
        ),
        input_schema={
            "type": "object",
            "properties": {
                "permit_id": {
                    "type": "string",
                    "description": "Permit identifier in the form P-YYYY-NNNNN.",
                }
            },
            "required": ["permit_id"],
        },
        handler=lookup_permit_by_id,
    ),
    "list_permits_by_address": Tool(
        name="list_permits_by_address",
        description=(
            "List all permits filed at a street address. "
            "Use this when the constituent gives an address but no permit id."
        ),
        input_schema={
            "type": "object",
            "properties": {
                "address": {
                    "type": "string",
                    "description": "Street address as the constituent typed it.",
                }
            },
            "required": ["address"],
        },
        handler=list_permits_by_address,
    ),
    "escalate_to_human": Tool(
        name="escalate_to_human",
        description=(
            "Open a ticket for a human reviewer. "
            "Use this when the question is ambiguous, the data is missing, "
            "or the constituent asks for something the other tools cannot do."
        ),
        input_schema={
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Short summary of why a human is needed.",
                }
            },
            "required": ["reason"],
        },
        handler=escalate_to_human,
    ),
}


def tool_schemas() -> list[dict]:
    """Shape the tool registry into the list the Anthropic API expects."""
    return [
        {
            "name": t.name,
            "description": t.description,
            "input_schema": t.input_schema,
        }
        for t in TOOLS.values()
    ]


def run_tool(name: str, arguments: dict) -> dict:
    """Dispatch a tool by name. Unknown tools return a structured error."""
    tool = TOOLS.get(name)
    if tool is None:
        return {"error": "unknown_tool", "tool": name}
    try:
        return tool.handler(**arguments)
    except TypeError as exc:
        return {"error": "bad_arguments", "detail": str(exc)}

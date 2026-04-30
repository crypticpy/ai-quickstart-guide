"""Lab 4.4 solution: tool definitions for the permit-status agent.

Each tool has:
- a JSON schema the model sees
- a Python handler that runs when the agent calls the tool
- input validation that rejects bad data before it reaches the handler

The TOOLS registry is the single dispatch point. The agent loop never calls
handlers directly. It calls run_tool(name, arguments).
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
    if not isinstance(permit_id, str) or not PERMIT_ID_PATTERN.match(permit_id):
        return {"error": "invalid_permit_id"}
    for permit in _load_permits():
        if permit["permit_id"] == permit_id:
            return dict(permit)
    return {"error": "not_found"}


# ---------------------------------------------------------------------------
# Tool 2: list_permits_by_address
# ---------------------------------------------------------------------------


def list_permits_by_address(address: str) -> dict:
    if not isinstance(address, str) or len(address) > 200:
        return {"error": "invalid_address"}
    if _looks_like_injection(address):
        return {"error": "rejected_input"}
    needle = address.strip().lower()
    matches = [
        dict(p) for p in _load_permits() if needle in p["address"].lower()
    ]
    return {"permits": matches}


# ---------------------------------------------------------------------------
# Tool 3: escalate_to_human
# ---------------------------------------------------------------------------


def escalate_to_human(reason: str) -> dict:
    reason = (reason or "")[:500]
    ticket_id = "ESC-" + secrets.token_hex(4).upper()
    return {"ticket_id": ticket_id, "reason": reason}


# ---------------------------------------------------------------------------
# Tool registry
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
    return [
        {
            "name": t.name,
            "description": t.description,
            "input_schema": t.input_schema,
        }
        for t in TOOLS.values()
    ]


def run_tool(name: str, arguments: dict) -> dict:
    tool = TOOLS.get(name)
    if tool is None:
        return {"error": "unknown_tool", "tool": name}
    try:
        return tool.handler(**arguments)
    except TypeError as exc:
        return {"error": "bad_arguments", "detail": str(exc)}

"""Vendored permit tools from Lab 4.4.

The permits.json corpus lives at data/permits/permits.json under the project
root. The settings module is the source of truth for the path; this module
reads it lazily to avoid an import-time circular dependency.
"""

from __future__ import annotations

import json
import re
import secrets
from dataclasses import dataclass
from typing import Any, Callable


PERMIT_ID_PATTERN = re.compile(r"^P-\d{4}-\d{5}$")
ADDRESS_DENY_PATTERNS = [
    re.compile(r"<\s*script", re.IGNORECASE),
    re.compile(r"ignore (all )?previous instructions", re.IGNORECASE),
    re.compile(r"system:\s", re.IGNORECASE),
]


_PERMITS_CACHE: list[dict] | None = None


def _load_permits() -> list[dict]:
    global _PERMITS_CACHE
    if _PERMITS_CACHE is None:
        from civic_assistant.settings import get_settings

        path = get_settings().permits_path
        payload = json.loads(path.read_text())
        _PERMITS_CACHE = payload["permits"]
    return _PERMITS_CACHE


def _looks_like_injection(text: str) -> bool:
    return any(p.search(text) for p in ADDRESS_DENY_PATTERNS)


def lookup_permit_by_id(permit_id: str) -> dict:
    if not PERMIT_ID_PATTERN.match(permit_id or ""):
        return {"error": "invalid_permit_id"}
    for record in _load_permits():
        if record["permit_id"] == permit_id:
            return record
    return {"error": "not_found"}


def list_permits_by_address(address: str) -> dict:
    if _looks_like_injection(address or ""):
        return {"error": "rejected_input"}
    needle = (address or "").lower().strip()
    if not needle:
        return {"permits": []}
    matches = [
        r for r in _load_permits() if needle in r["address"].lower()
    ]
    return {"permits": matches}


def escalate_to_human(reason: str) -> dict:
    truncated = (reason or "")[:500]
    return {
        "ticket_id": f"ESC-{secrets.token_hex(4)}",
        "reason": truncated,
    }


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
            "Use when the constituent gives a permit id like P-2026-00101."
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
            "List permits filed at a street address. "
            "Use when the constituent gives an address but no permit id."
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
            "Use when the question is ambiguous, the data is missing, or "
            "the constituent asks for something the other tools cannot do."
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

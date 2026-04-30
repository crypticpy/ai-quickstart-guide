"""Lab 4.4 solution: structured trace logger.

The point of an observability layer is that you can answer the question
"what did the agent actually do?" hours after the request finished. The
log has to be structured, machine-readable, and never include secrets.

This module turns an AgentResult into a JSON line you can ship to a log
aggregator or an audit trail.
"""

from __future__ import annotations

import json
import logging
import time
import uuid
from typing import Any

from agent import AgentResult, TraceEntry

logger = logging.getLogger("aqg.lab4.agent")


def trace_to_dict(entry: TraceEntry) -> dict[str, Any]:
    return {
        "tool": entry.tool,
        "arguments": entry.arguments,
        "result": entry.result,
        "latency_ms": entry.latency_ms,
    }


def log_agent_run(user_message: str, result: AgentResult, *, request_id: str | None = None) -> dict:
    """Emit a single structured log line. Return the same dict for tests."""
    payload = {
        "ts": int(time.time() * 1000),
        "request_id": request_id or str(uuid.uuid4()),
        "user_message_chars": len(user_message),
        "iterations": result.iterations,
        "stopped_reason": result.stopped_reason,
        "trace": [trace_to_dict(t) for t in result.trace],
        "answer_chars": len(result.answer),
    }
    logger.info(json.dumps(payload))
    return payload

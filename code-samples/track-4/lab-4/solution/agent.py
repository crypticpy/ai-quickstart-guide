"""Lab 4.4 solution: the agent loop for the permit-status agent.

The loop is small on purpose. Read it twice. Every line earns its place.

    while iterations < max_iterations:
        response = client.messages.create(...)
        if response.stop_reason != "tool_use":
            return final_text(response)
        for tool_use_block in tool_use_blocks(response):
            result = run_tool(tool_use_block.name, tool_use_block.input)
            messages.append(...tool_result block...)
        iterations += 1
    return AgentResult(stopped_reason="max_iterations", ...)

The loop appends to `messages` so the model sees the full history each turn.
That is how it remembers what it has already called.
"""

from __future__ import annotations

import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

COMMON_DIR = Path(__file__).resolve().parents[2] / "common"
sys.path.insert(0, str(COMMON_DIR))

from tools import run_tool, tool_schemas  # noqa: E402

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
DEFAULT_MODEL = "claude-sonnet-4-20250514"

RETRY_ATTEMPTS = 3
RETRY_BACKOFF_SECONDS = (1.0, 2.0, 4.0)


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


def _block_attr(block: Any, name: str, default: Any = None) -> Any:
    """Read an attribute on either a real Anthropic SDK block or a stub dataclass."""
    if hasattr(block, name):
        return getattr(block, name)
    if isinstance(block, dict):
        return block.get(name, default)
    return default


def _final_text(response: Any) -> str:
    parts: list[str] = []
    for block in response.content:
        if _block_attr(block, "type") == "text":
            parts.append(_block_attr(block, "text") or "")
    return "".join(parts).strip()


def _is_transient_api_error(exc: BaseException) -> bool:
    """Return True for rate limits and 5xx, which are worth retrying."""
    name = type(exc).__name__
    if name in {"RateLimitError", "APITimeoutError", "APIConnectionError", "InternalServerError"}:
        return True
    status = getattr(exc, "status_code", None)
    return status == 429 or (isinstance(status, int) and 500 <= status < 600)


def _create_with_retry(client: Any, **kwargs: Any) -> Any:
    """Call client.messages.create with bounded backoff on rate limits and 5xx."""
    last_exc: BaseException | None = None
    for attempt in range(RETRY_ATTEMPTS):
        try:
            return client.messages.create(**kwargs)
        except Exception as exc:  # noqa: BLE001 — narrow via _is_transient_api_error
            if not _is_transient_api_error(exc) or attempt == RETRY_ATTEMPTS - 1:
                raise
            last_exc = exc
            time.sleep(RETRY_BACKOFF_SECONDS[attempt])
    # Unreachable: the loop either returns or raises.
    raise RuntimeError("retry loop exited without result") from last_exc


def run_agent(
    user_message: str,
    *,
    client: Any,
    model: str = DEFAULT_MODEL,
    max_iterations: int = MAX_ITERATIONS,
) -> AgentResult:
    """Run the agent loop until the model emits a final answer or we hit max_iterations."""
    messages: list[dict] = [{"role": "user", "content": user_message}]
    trace: list[TraceEntry] = []

    for iteration in range(1, max_iterations + 1):
        response = _create_with_retry(
            client,
            model=model,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=tool_schemas(),
            messages=messages,
        )

        stop_reason = _block_attr(response, "stop_reason")
        if stop_reason != "tool_use":
            return AgentResult(
                answer=_final_text(response) or "(no response)",
                trace=trace,
                iterations=iteration,
                stopped_reason=stop_reason or "end_turn",
            )

        # The model wants to call one or more tools. Append its turn first.
        assistant_blocks = []
        for block in response.content:
            btype = _block_attr(block, "type")
            if btype == "text":
                assistant_blocks.append({"type": "text", "text": _block_attr(block, "text") or ""})
            elif btype == "tool_use":
                assistant_blocks.append({
                    "type": "tool_use",
                    "id": _block_attr(block, "id"),
                    "name": _block_attr(block, "name"),
                    "input": _block_attr(block, "input") or {},
                })
        messages.append({"role": "assistant", "content": assistant_blocks})

        # Run each tool and collect a tool_result block per tool_use.
        tool_results: list[dict] = []
        for block in response.content:
            if _block_attr(block, "type") != "tool_use":
                continue
            tool_name = _block_attr(block, "name") or ""
            arguments = _block_attr(block, "input") or {}
            tool_use_id = _block_attr(block, "id") or ""

            start = time.perf_counter()
            result = run_tool(tool_name, arguments if isinstance(arguments, dict) else {})
            latency_ms = int((time.perf_counter() - start) * 1000)

            trace.append(TraceEntry(
                tool=tool_name,
                arguments=arguments if isinstance(arguments, dict) else {},
                result=result,
                latency_ms=latency_ms,
            ))
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_use_id,
                "content": _serialize_result(result),
            })

        messages.append({"role": "user", "content": tool_results})

    return AgentResult(
        answer="The agent stopped after the iteration limit. A human will follow up.",
        trace=trace,
        iterations=max_iterations,
        stopped_reason="max_iterations",
    )


def _serialize_result(result: dict) -> str:
    """Tool results must be strings in the Anthropic API. JSON is the safe shape."""
    import json as _json
    return _json.dumps(result, default=str)

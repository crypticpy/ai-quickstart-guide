"""FastAPI service for lab 4.4 (solution).

Run with:

    uvicorn main:app --reload

Then POST to /agent:

    curl -X POST http://127.0.0.1:8000/agent \
        -H "Content-Type: application/json" \
        -d '{"message": "What is the status of permit P-2026-00101?"}'
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

COMMON_DIR = Path(__file__).resolve().parents[2] / "common"
sys.path.insert(0, str(COMMON_DIR))

from agent import run_agent  # noqa: E402
from observability import log_agent_run, trace_to_dict  # noqa: E402

app = FastAPI(title="Permit Status Agent", version="0.1.0")


class AgentRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class AgentResponse(BaseModel):
    answer: str
    trace: list[dict]
    iterations: int
    stopped_reason: str


def _get_anthropic_client():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY is not set")
    import anthropic
    return anthropic.Anthropic()


@app.post("/agent", response_model=AgentResponse)
def agent_endpoint(req: AgentRequest) -> AgentResponse:
    client = _get_anthropic_client()
    result = run_agent(req.message, client=client)
    log_agent_run(req.message, result)
    return AgentResponse(
        answer=result.answer,
        trace=[trace_to_dict(t) for t in result.trace],
        iterations=result.iterations,
        stopped_reason=result.stopped_reason,
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

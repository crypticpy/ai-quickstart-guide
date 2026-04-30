"""FastAPI scaffold for lab 4.4.

Run with:

    uvicorn main:app --reload

Then POST to /agent:

    curl -X POST http://127.0.0.1:8000/agent \
        -H "Content-Type: application/json" \
        -d '{"message": "What is the status of permit P-2026-00101?"}'
"""

from __future__ import annotations

import os

from fastapi import FastAPI
from pydantic import BaseModel, Field

# TODO: import your agent runner once it is implemented.
# from agent import run_agent

app = FastAPI(title="Permit Status Agent", version="0.1.0")


class AgentRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class AgentResponse(BaseModel):
    answer: str
    trace: list[dict]
    iterations: int


@app.post("/agent", response_model=AgentResponse)
def agent_endpoint(req: AgentRequest) -> AgentResponse:
    # TODO: build an Anthropic client, call run_agent(req.message, client=...),
    # and return the answer and trace.
    raise NotImplementedError("Wire up run_agent and return its result.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

"""FastAPI app for civic-assistant.

Three endpoints, one /health, structured logs, env-var config.

TODO for the learner:

- Wire each endpoint to the matching module.
- Configure observability before any other import logs anything.
- Build the Anthropic client once at startup; share it across requests.
"""

from __future__ import annotations

import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from civic_assistant.observability import configure_logging
from civic_assistant.settings import get_settings


settings = get_settings()
configure_logging(settings.log_level)


app = FastAPI(title="civic-assistant", version="0.1.0")


def _flag_enabled(name: str) -> bool:
    return name in {f.strip() for f in settings.feature_flags.split(",") if f.strip()}


_origins = [o.strip() for o in settings.cors_allow_origins.split(",") if o.strip()]
if _origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_origins,
        allow_methods=["POST", "GET"],
        allow_headers=["Content-Type"],
    )


class ClassifyRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class ClassifyResponse(BaseModel):
    department: str
    confidence: float
    raw: str


class AnswerRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)


class AnswerResponse(BaseModel):
    answer: str
    citations: list[str]


class TriageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class TriageResponse(BaseModel):
    answer: str
    trace: list[dict]
    iterations: int


@app.post("/classify", response_model=ClassifyResponse)
def classify_endpoint(req: ClassifyRequest) -> ClassifyResponse:
    if not _flag_enabled("classify_enabled"):
        raise HTTPException(status_code=503, detail="classify endpoint disabled")
    # TODO: import classify_message and call it inside log_request.
    raise NotImplementedError("Wire classify_message.")


@app.post("/answer", response_model=AnswerResponse)
def answer_endpoint(req: AnswerRequest) -> AnswerResponse:
    if not _flag_enabled("answer_enabled"):
        raise HTTPException(status_code=503, detail="answer endpoint disabled")
    # TODO: import answer.answer and call it inside log_request.
    raise NotImplementedError("Wire answer.")


@app.post("/triage", response_model=TriageResponse)
def triage_endpoint(req: TriageRequest) -> TriageResponse:
    if not _flag_enabled("triage_enabled"):
        raise HTTPException(status_code=503, detail="triage endpoint disabled")
    # TODO: build the Anthropic client once at startup, then call run_triage.
    raise NotImplementedError("Wire run_triage.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "civic-assistant", "version": "0.1.0"}


def _new_request_id() -> str:
    return uuid.uuid4().hex

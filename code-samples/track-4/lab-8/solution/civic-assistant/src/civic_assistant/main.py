"""FastAPI app for civic-assistant (solution)."""

from __future__ import annotations

import os
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from civic_assistant.observability import configure_logging, log_request
from civic_assistant.settings import get_settings


settings = get_settings()
configure_logging(settings.log_level)


app = FastAPI(title="civic-assistant", version="0.1.0")


def _flag_enabled(name: str) -> bool:
    return name in {f.strip() for f in settings.feature_flags.split(",") if f.strip()}


_origins = [o.strip() for o in settings.cors_allow_origins.split(",") if o.strip()]
if "*" in _origins:
    raise RuntimeError(
        "CORS_ALLOW_ORIGINS=* is rejected. List explicit origins; the public "
        "endpoints in this service should not allow arbitrary cross-origin POSTs."
    )
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


def _new_request_id() -> str:
    return uuid.uuid4().hex


_anthropic_client = None


def _get_anthropic_client():
    global _anthropic_client
    if _anthropic_client is None:
        import anthropic
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set in the environment.")
        _anthropic_client = anthropic.Anthropic(api_key=api_key)
    return _anthropic_client


@app.post("/classify", response_model=ClassifyResponse)
def classify_endpoint(req: ClassifyRequest) -> ClassifyResponse:
    if not _flag_enabled("classify_enabled"):
        raise HTTPException(status_code=503, detail="classify endpoint disabled")
    from civic_assistant.classify import classify_message

    request_id = _new_request_id()
    with log_request("classify", request_id) as record:
        result = classify_message(req.message)
        record["outcome"] = "ok"
        return ClassifyResponse(
            department=result.department,
            confidence=result.confidence,
            raw=result.raw,
        )


@app.post("/answer", response_model=AnswerResponse)
def answer_endpoint(req: AnswerRequest) -> AnswerResponse:
    if not _flag_enabled("answer_enabled"):
        raise HTTPException(status_code=503, detail="answer endpoint disabled")
    from civic_assistant.answer import answer as run_answer

    request_id = _new_request_id()
    with log_request("answer", request_id) as record:
        result = run_answer(req.question)
        record["outcome"] = "ok"
        return AnswerResponse(answer=result.answer, citations=result.citations)


@app.post("/triage", response_model=TriageResponse)
def triage_endpoint(req: TriageRequest) -> TriageResponse:
    if not _flag_enabled("triage_enabled"):
        raise HTTPException(status_code=503, detail="triage endpoint disabled")
    from civic_assistant.triage import run_triage

    request_id = _new_request_id()
    with log_request("triage", request_id) as record:
        result = run_triage(
            req.message,
            client=_get_anthropic_client(),
            model=settings.llm_model,
            max_iterations=settings.triage_max_iterations,
        )
        record["outcome"] = "ok" if result.stopped_reason == "end_turn" else "degraded"
        return TriageResponse(
            answer=result.answer,
            trace=[
                {
                    "tool": e.tool,
                    "arguments": e.arguments,
                    "result": e.result,
                    "latency_ms": e.latency_ms,
                }
                for e in result.trace
            ],
            iterations=result.iterations,
        )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "civic-assistant", "version": "0.1.0"}

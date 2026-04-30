"""FastAPI service for lab 4.3 (solution)."""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field

from rag import answer

app = FastAPI(title="Policy Q&A (RAG)", version="0.1.0")


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    k: int = Field(default=3, ge=1, le=10)


class Citation(BaseModel):
    doc_id: str
    title: str


class AskResponse(BaseModel):
    answer: str
    citations: list[Citation]


@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest) -> AskResponse:
    result = answer(req.question, k=req.k)
    return AskResponse(
        answer=result.text,
        citations=[Citation(**c) for c in result.citations],
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

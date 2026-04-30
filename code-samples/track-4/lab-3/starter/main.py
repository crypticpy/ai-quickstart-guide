"""FastAPI scaffold for lab 4.3.

Run:

    uvicorn main:app --reload

Then POST a question:

    curl -X POST http://127.0.0.1:8000/ask \
        -H "Content-Type: application/json" \
        -d '{"question": "What is the agency policy on remote work?"}'
"""

from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field

# TODO: import your answer() function once rag.py is implemented.
# from rag import answer

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
    # TODO: call answer(req.question, k=req.k) and return AskResponse.
    raise NotImplementedError("Wire up rag.answer() and return its result.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

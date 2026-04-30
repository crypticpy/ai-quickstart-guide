"""FastAPI service for lab 4.1 (solution)."""

from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field

COMMON_DIR = Path(__file__).resolve().parents[2] / "common"
sys.path.insert(0, str(COMMON_DIR))

from llm_client import get_client  # noqa: E402

from classifier import classify_structured  # noqa: E402

app = FastAPI(title="Constituent Intake Classifier", version="0.1.0")
_complete = get_client(provider="anthropic")


class ClassifyRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class ClassifyResponse(BaseModel):
    department: str
    raw: str


@app.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest) -> ClassifyResponse:
    pred = classify_structured(req.message, _complete)
    return ClassifyResponse(department=pred.label, raw=pred.raw)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

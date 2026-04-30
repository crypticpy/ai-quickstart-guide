"""FastAPI scaffold for lab 4.1.

Run with:

    uvicorn main:app --reload

Then POST to /classify:

    curl -X POST http://127.0.0.1:8000/classify \
        -H "Content-Type: application/json" \
        -d '{"message": "There is a pothole on Maple Street."}'
"""

from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field

# Make `llm_client` importable.
COMMON_DIR = Path(__file__).resolve().parents[2] / "common"
sys.path.insert(0, str(COMMON_DIR))

from llm_client import get_client  # noqa: E402

# TODO: import your best-performing classifier from classifier.py here.
# from classifier import classify_structured

app = FastAPI(title="Constituent Intake Classifier", version="0.1.0")
_complete = get_client(provider="anthropic")


class ClassifyRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class ClassifyResponse(BaseModel):
    department: str
    raw: str


@app.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest) -> ClassifyResponse:
    # TODO: call your classifier here and return the prediction.
    raise NotImplementedError("Wire up your best classifier and return its result.")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

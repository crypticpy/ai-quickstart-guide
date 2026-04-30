"""FastAPI consumer of the policy_classifier module.

This file demonstrates the point of the refactor. The endpoint logic
depends on the Classifier port and the make_classifier factory. It does
not import anthropic. It does not know which strategy is wired in. The
strategy is chosen by config at startup. Swap the strategy, swap the
provider, the endpoint code does not change.
"""

from __future__ import annotations

import os
from functools import lru_cache

from fastapi import Depends, FastAPI
from pydantic import BaseModel, Field

from policy_classifier import Classifier, make_classifier

app = FastAPI(title="Policy Classifier Consumer")


class ClassifyRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class ClassifyResponse(BaseModel):
    department: str
    confidence: float


@lru_cache(maxsize=1)
def _get_classifier() -> Classifier:
    """Build the classifier once per process, using config from env."""
    strategy = os.environ.get("CLASSIFIER_STRATEGY", "structured")
    return make_classifier(strategy=strategy)


def get_classifier() -> Classifier:
    """FastAPI dependency. Indirection here lets tests override it."""
    return _get_classifier()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/classify", response_model=ClassifyResponse)
def classify(
    body: ClassifyRequest,
    classifier: Classifier = Depends(get_classifier),
) -> ClassifyResponse:
    result = classifier.classify(body.message)
    return ClassifyResponse(department=result.label, confidence=result.confidence)

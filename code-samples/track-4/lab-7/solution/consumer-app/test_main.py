"""Endpoint tests that prove the consumer depends on the port, not an adapter.

A fake classifier is injected via FastAPI's dependency override. No API key
required to run these.
"""

from __future__ import annotations

from fastapi.testclient import TestClient

from policy_classifier import Classifier, ClassificationResult

from main import app, get_classifier


class FakeClassifier(Classifier):
    def classify(self, message: str) -> ClassificationResult:
        self.validate_message(message)
        return ClassificationResult(label="public_works", confidence=0.92, raw="fake")


def _override() -> Classifier:
    return FakeClassifier()


app.dependency_overrides[get_classifier] = _override
client = TestClient(app)


def test_health():
    rsp = client.get("/health")
    assert rsp.status_code == 200
    assert rsp.json() == {"status": "ok"}


def test_classify_uses_injected_classifier():
    rsp = client.post("/classify", json={"message": "There is a pothole."})
    assert rsp.status_code == 200
    body = rsp.json()
    assert body["department"] == "public_works"
    assert body["confidence"] == 0.92


def test_classify_rejects_empty_payload():
    rsp = client.post("/classify", json={"message": ""})
    assert rsp.status_code == 422

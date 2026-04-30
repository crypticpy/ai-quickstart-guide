"""Golden-case tests for the /classify endpoint.

These do not call the live API. They patch the classifier with a fake `complete`
function. The point is to lock the wiring (env-var config -> module import ->
endpoint -> response shape), not to benchmark the model.
"""

from __future__ import annotations

import json

from fastapi.testclient import TestClient

from civic_assistant.main import app


GOLDEN_CASES = [
    ("There is a pothole on Maple Street.", "public_works"),
    ("My utility bill is wrong.", "utilities_billing"),
    ("There is a stray dog in my yard.", "animal_services"),
]


def _fake_complete_factory(label: str):
    def complete(system, user, **_kwargs):
        return json.dumps({"department": label, "confidence": 0.9})
    return complete


def test_classify_endpoint_returns_expected_label(monkeypatch):
    # TODO: monkeypatch the LLM client used in classify.py with a fake
    # complete that returns the structured JSON for each golden case.
    # Then call TestClient(app).post("/classify", ...) and assert.
    raise NotImplementedError("Wire the golden-case classifier test.")


def test_classify_endpoint_rejects_empty_message():
    client = TestClient(app)
    rsp = client.post("/classify", json={"message": ""})
    assert rsp.status_code == 422

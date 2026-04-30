"""Golden-case tests for the /classify endpoint (solution)."""

from __future__ import annotations

import json

from fastapi.testclient import TestClient

from civic_assistant import classify as classify_module
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
    for message, expected in GOLDEN_CASES:
        fake = _fake_complete_factory(expected)
        monkeypatch.setattr(classify_module, "_get_complete", lambda fn=fake: fn)
        client = TestClient(app)
        rsp = client.post("/classify", json={"message": message})
        assert rsp.status_code == 200, rsp.text
        body = rsp.json()
        assert body["department"] == expected
        assert body["confidence"] == 0.9


def test_classify_endpoint_rejects_empty_message():
    client = TestClient(app)
    rsp = client.post("/classify", json={"message": ""})
    assert rsp.status_code == 422

"""Structured-output Claude adapter (solution)."""

from __future__ import annotations

import json
import os
import re

from ..ports import DEPARTMENTS, Classifier, ClassificationResult

STRUCTURED_SYSTEM = (
    "You route constituent messages to the right department. "
    "Reply with a single JSON object and nothing else, in this exact shape:\n"
    '{"department": "<one of the labels>", "confidence": <float between 0 and 1>}\n'
    "Allowed labels:\n"
    + "\n".join(f"- {d}" for d in DEPARTMENTS)
)


class StructuredOutputClaudeAdapter(Classifier):
    def __init__(self, model: str = "provider-model-slug", api_key: str | None = None):
        import anthropic

        key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set in the environment.")
        self._client = anthropic.Anthropic(api_key=key)
        self._model = model

    def classify(self, message: str) -> ClassificationResult:
        cleaned = self.validate_message(message)
        msg = self._client.messages.create(
            model=self._model,
            max_tokens=80,
            temperature=0.0,
            system=STRUCTURED_SYSTEM,
            messages=[{"role": "user", "content": f"Message:\n{cleaned}"}],
        )
        raw = "".join(block.text for block in msg.content if block.type == "text")
        return self._parse(raw)

    def _parse(self, raw: str) -> ClassificationResult:
        try:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            payload = json.loads(match.group(0)) if match else {}
        except (json.JSONDecodeError, AttributeError, ValueError):
            return ClassificationResult(label="general_info", confidence=0.0, raw=raw)

        dept = str(payload.get("department", "")).strip().lower()
        if dept not in DEPARTMENTS:
            return ClassificationResult(label="general_info", confidence=0.0, raw=raw)

        try:
            confidence = float(payload.get("confidence", 0.0))
        except (TypeError, ValueError):
            confidence = 0.0
        if not (0.0 <= confidence <= 1.0):
            confidence = 0.0

        return ClassificationResult(label=dept, confidence=confidence, raw=raw)

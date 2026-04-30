"""Structured-output Claude adapter.

Asks Claude to reply with a JSON object. Self-reports a confidence score.
"""

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
    """Adapter: JSON-output prompt against Anthropic Claude."""

    def __init__(self, model: str = "claude-sonnet-4-20250514", api_key: str | None = None):
        import anthropic

        key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set in the environment.")
        self._client = anthropic.Anthropic(api_key=key)
        self._model = model

    def classify(self, message: str) -> ClassificationResult:
        # TODO:
        # 1. Validate the message.
        # 2. Send the message to Claude with STRUCTURED_SYSTEM as system,
        #    max_tokens=80, temperature=0.0.
        # 3. Pull the first {...} block out of the response with a regex.
        #    Parse it with json.loads. Treat parse failures as a fallback
        #    to label='general_info' with confidence=0.0.
        # 4. Validate `department` is in DEPARTMENTS. If not, fall back.
        # 5. Coerce `confidence` to a float in [0.0, 1.0]; default to 0.0
        #    if missing or out of range.
        raise NotImplementedError("Implement StructuredOutputClaudeAdapter.classify")

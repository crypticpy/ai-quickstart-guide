"""Zero-shot Claude adapter (solution)."""

from __future__ import annotations

import os

from ..ports import DEPARTMENTS, Classifier, ClassificationResult

ZERO_SHOT_SYSTEM = (
    "You route constituent messages to the right department. "
    "Reply with exactly one of these labels and nothing else:\n"
    + "\n".join(f"- {d}" for d in DEPARTMENTS)
)


class ZeroShotClaudeAdapter(Classifier):
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
            max_tokens=20,
            temperature=0.0,
            system=ZERO_SHOT_SYSTEM,
            messages=[
                {"role": "user", "content": f"Message:\n{cleaned}\n\nLabel:"}
            ],
        )
        raw = "".join(block.text for block in msg.content if block.type == "text")
        return ClassificationResult(
            label=self.normalize_label(raw),
            confidence=1.0,
            raw=raw,
        )

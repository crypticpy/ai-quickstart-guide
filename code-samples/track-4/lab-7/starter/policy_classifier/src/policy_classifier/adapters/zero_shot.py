"""Zero-shot Claude adapter.

Sends the message to Claude with a system prompt that lists the labels.
No labeled examples in the prompt.
"""

from __future__ import annotations

import os

from ..ports import DEPARTMENTS, Classifier, ClassificationResult

ZERO_SHOT_SYSTEM = (
    "You route constituent messages to the right department. "
    "Reply with exactly one of these labels and nothing else:\n"
    + "\n".join(f"- {d}" for d in DEPARTMENTS)
)


class ZeroShotClaudeAdapter(Classifier):
    """Adapter: zero-shot prompt against Anthropic Claude."""

    def __init__(self, model: str = "claude-sonnet-4-20250514", api_key: str | None = None):
        # Imported here so the package can be imported in environments
        # that have not installed the anthropic SDK yet (e.g., test runs
        # that only use a fake adapter).
        import anthropic

        key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set in the environment.")
        self._client = anthropic.Anthropic(api_key=key)
        self._model = model

    def classify(self, message: str) -> ClassificationResult:
        # TODO:
        # 1. Call self.validate_message(message) to reject empty input.
        # 2. Call self._client.messages.create(...) with model=self._model,
        #    system=ZERO_SHOT_SYSTEM, a single user message containing the
        #    text, max_tokens=20, temperature=0.0.
        # 3. Pull the text out of the response (Anthropic returns content
        #    blocks). Pass it to self.normalize_label(...).
        # 4. Return ClassificationResult(label=..., confidence=1.0, raw=...).
        raise NotImplementedError("Implement ZeroShotClaudeAdapter.classify")

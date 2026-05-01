"""Few-shot Claude adapter (solution)."""

from __future__ import annotations

import os

from ..ports import DEPARTMENTS, Classifier, ClassificationResult

FEW_SHOT_SYSTEM = (
    "You route constituent messages to the right department. "
    "Reply with exactly one of these labels and nothing else:\n"
    + "\n".join(f"- {d}" for d in DEPARTMENTS)
)

DEFAULT_EXAMPLES: list[dict] = [
    {"text": "There is a pothole on Maple Street.", "label": "public_works"},
    {"text": "A stray dog has been on my porch for two days.", "label": "animal_services"},
    {"text": "My neighbor has not mowed in months and there are rats.", "label": "code_enforcement"},
    {"text": "Trash was not picked up on my street this morning.", "label": "sanitation"},
    {"text": "My water bill tripled and I can't reach billing.", "label": "utilities_billing"},
]


def _format_examples(examples: list[dict]) -> str:
    return "\n\n".join(
        f"Message: {ex['text']}\nLabel: {ex['label']}" for ex in examples
    )


class FewShotClaudeAdapter(Classifier):
    def __init__(
        self,
        model: str = "provider-model-slug",
        api_key: str | None = None,
        examples: list[dict] | None = None,
    ):
        import anthropic

        key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set in the environment.")
        self._client = anthropic.Anthropic(api_key=key)
        self._model = model
        self._examples = examples or DEFAULT_EXAMPLES

    def classify(self, message: str) -> ClassificationResult:
        cleaned = self.validate_message(message)
        user_prompt = (
            "Here are labeled examples:\n\n"
            + _format_examples(self._examples)
            + f"\n\nNow classify this message. Reply with one label only.\n\n"
            + f"Message: {cleaned}\nLabel:"
        )
        msg = self._client.messages.create(
            model=self._model,
            max_tokens=20,
            temperature=0.0,
            system=FEW_SHOT_SYSTEM,
            messages=[{"role": "user", "content": user_prompt}],
        )
        raw = "".join(block.text for block in msg.content if block.type == "text")
        return ClassificationResult(
            label=self.normalize_label(raw),
            confidence=1.0,
            raw=raw,
        )

"""Few-shot Claude adapter.

Same system prompt as zero-shot, but the user prompt includes a small
set of labeled examples before the message to classify.
"""

from __future__ import annotations

import os

from ..ports import DEPARTMENTS, Classifier, ClassificationResult

FEW_SHOT_SYSTEM = (
    "You route constituent messages to the right department. "
    "Reply with exactly one of these labels and nothing else:\n"
    + "\n".join(f"- {d}" for d in DEPARTMENTS)
)

# Small set of canned examples. In a real agency rollout these come from
# the agency's own intake archive. The lab keeps them inline so the
# adapter is self-contained.
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
    """Adapter: few-shot prompt against Anthropic Claude."""

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
        # TODO:
        # 1. Validate the message.
        # 2. Build the user prompt: format the examples with
        #    `_format_examples(self._examples)`, then append the new message
        #    with `Message: <text>\nLabel:` at the end.
        # 3. Call the Claude API with FEW_SHOT_SYSTEM as the system prompt.
        # 4. Normalize the label and return a ClassificationResult.
        raise NotImplementedError("Implement FewShotClaudeAdapter.classify")

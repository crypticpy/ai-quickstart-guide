"""Ports: the contract every adapter must implement.

This file is the heart of the module. The Classifier abstract base class
defines what the rest of the agency depends on. Adapters live in
adapters/. Business logic lives in consumer-app/. Both depend on this
module; this module depends on neither.

That direction of dependency is what hexagonal architecture buys you. The
LLM provider is a detail. The contract is the asset.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

DEPARTMENTS = [
    "public_works",
    "animal_services",
    "code_enforcement",
    "sanitation",
    "utilities_billing",
    "permits_and_licensing",
    "human_services",
    "general_info",
]


@dataclass(frozen=True)
class ClassificationResult:
    """The shape every adapter must return.

    label:      one of DEPARTMENTS, never anything else.
    confidence: float in [0.0, 1.0]. Adapters that cannot self-report
                confidence should return 1.0 for a confident answer
                and 0.0 for a fallback.
    raw:        the model's raw text output, useful for debugging.
    """

    label: str
    confidence: float
    raw: str


class Classifier(ABC):
    """The port. Every adapter inherits from this.

    TODO: define the abstract method `classify(message: str) -> ClassificationResult`.

    Why an abstract base class instead of a Protocol? Two reasons:
    1. We want a runtime check that adapters cover the contract; ABC raises
       at instantiation time if a method is missing, while Protocol is a
       static-typing aid.
    2. Shared helper methods (input validation, label normalization) can
       live on the base class so every adapter gets them for free.
    """

    # TODO: add the abstract `classify` method here.
    # The signature should be: classify(self, message: str) -> ClassificationResult
    # Mark it with @abstractmethod so subclasses are required to override it.

    # ------------------------------------------------------------------ #
    # Shared helpers. Already implemented; do not change.                 #
    # ------------------------------------------------------------------ #

    @staticmethod
    def normalize_label(text: str) -> str:
        """Pull a known department label out of arbitrary model text.

        Adapters should call this on the model's response before returning
        a ClassificationResult. Treats the model output as untrusted.
        """
        cleaned = text.strip().strip(".").strip().lower()
        if cleaned in DEPARTMENTS:
            return cleaned
        for dept in DEPARTMENTS:
            if dept in cleaned:
                return dept
        return "general_info"

    @staticmethod
    def validate_message(message: str) -> str:
        """Reject empty or non-string input at the boundary."""
        if not isinstance(message, str):
            raise TypeError(f"message must be str, got {type(message).__name__}")
        stripped = message.strip()
        if not stripped:
            raise ValueError("message is empty")
        return stripped

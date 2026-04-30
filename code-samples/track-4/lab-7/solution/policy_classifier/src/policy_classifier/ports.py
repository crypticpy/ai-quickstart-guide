"""Ports: the contract every adapter must implement."""

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
    label: str
    confidence: float
    raw: str


class Classifier(ABC):
    """The port. Every adapter inherits from this."""

    @abstractmethod
    def classify(self, message: str) -> ClassificationResult:
        """Classify a constituent message into a department label.

        Implementations must:
        - validate the message (use self.validate_message)
        - return a ClassificationResult with label in DEPARTMENTS
        - return a confidence in [0.0, 1.0]
        - never raise on a valid non-empty string
        """

    @staticmethod
    def normalize_label(text: str) -> str:
        cleaned = text.strip().strip(".").strip().lower()
        if cleaned in DEPARTMENTS:
            return cleaned
        for dept in DEPARTMENTS:
            if dept in cleaned:
                return dept
        return "general_info"

    @staticmethod
    def validate_message(message: str) -> str:
        if not isinstance(message, str):
            raise TypeError(f"message must be str, got {type(message).__name__}")
        stripped = message.strip()
        if not stripped:
            raise ValueError("message is empty")
        return stripped

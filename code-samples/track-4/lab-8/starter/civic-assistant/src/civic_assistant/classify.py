"""Department classifier wrapper.

The Lab 4.7 classifier module is vendored under _vendored/classifier/. This
file is the thin adapter the FastAPI endpoint calls.

TODO for the learner:

- Import the structured-output classifier from the vendored module.
- Construct the LLM client once at import time using settings.
- Implement `classify_message(message)` returning a `ClassifyResult`.
- Validate the department against the known label set before returning.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ClassifyResult:
    department: str
    confidence: float
    raw: str


def classify_message(message: str) -> ClassifyResult:
    """TODO: call the vendored Lab 4.7 classifier and return the result.

    The vendored classifier returns a Prediction with .label and .raw.
    This adapter must also report a confidence score; if the classifier
    does not provide one, default to 0.0 and let the caller decide.
    """
    raise NotImplementedError("Implement classify_message.")

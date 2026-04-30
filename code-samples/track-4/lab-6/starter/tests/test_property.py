"""Property-based tests using Hypothesis.

Generate plausible inputs, then check structural properties of the
output rather than specific values.
"""

from __future__ import annotations

import re

import pytest
from hypothesis import HealthCheck, given, settings, strategies as st

from classifier import DEPARTMENTS, classify_structured

PII_PATTERNS = [
    re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),       # SSN-shaped
    re.compile(r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b"),  # phone-shaped
    re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b"),       # email-shaped
]


# Plausible-but-random message bodies. Hypothesis will minimize any
# failing case for you.
plausible_messages = st.builds(
    lambda noun, verb: f"My {noun} is {verb}. Please advise.",
    noun=st.sampled_from(["water bill", "trash bin", "stray cat", "neighbor", "sidewalk"]),
    verb=st.sampled_from(["broken", "missing", "loud", "leaking", "blocked"]),
)


@pytest.mark.property
@given(message=plausible_messages)
@settings(max_examples=10, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_output_label_is_in_allowed_set(cassette_complete, message):
    """TODO: call the classifier. Assert pred.label is in DEPARTMENTS.
    The classifier already falls back to general_info on bad JSON, so
    this is checking the contract holds for arbitrary plausible inputs.
    """
    raise NotImplementedError("Implement test_output_label_is_in_allowed_set")


@pytest.mark.property
@given(message=plausible_messages)
@settings(max_examples=5, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_no_pii_leaks_in_raw_output(cassette_complete, message):
    """TODO: call the classifier. Assert that none of the PII_PATTERNS
    match `pred.raw`. The model should not be inventing phone numbers or
    SSNs in its reply.
    """
    raise NotImplementedError("Implement test_no_pii_leaks_in_raw_output")

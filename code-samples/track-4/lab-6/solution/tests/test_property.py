"""Property-based tests (solution)."""

from __future__ import annotations

import re

import pytest
from hypothesis import HealthCheck, given, settings, strategies as st

from classifier import DEPARTMENTS, classify_structured

PII_PATTERNS = [
    re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    re.compile(r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b"),
    re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b"),
]


plausible_messages = st.builds(
    lambda noun, verb: f"My {noun} is {verb}. Please advise.",
    noun=st.sampled_from(["water bill", "trash bin", "stray cat", "neighbor", "sidewalk"]),
    verb=st.sampled_from(["broken", "missing", "loud", "leaking", "blocked"]),
)


@pytest.mark.property
@given(message=plausible_messages)
@settings(max_examples=10, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_output_label_is_in_allowed_set(cassette_complete, message):
    pred = classify_structured(message, cassette_complete)
    assert pred.label in DEPARTMENTS, f"unknown label {pred.label!r}"


@pytest.mark.property
@given(message=plausible_messages)
@settings(max_examples=5, deadline=None, suppress_health_check=[HealthCheck.function_scoped_fixture])
def test_no_pii_leaks_in_raw_output(cassette_complete, message):
    pred = classify_structured(message, cassette_complete)
    for pattern in PII_PATTERNS:
        assert not pattern.search(pred.raw), (
            f"PII-shaped string in model output: {pattern.pattern!r}"
        )

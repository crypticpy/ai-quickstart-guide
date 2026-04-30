"""Factory tests: make_classifier returns the right adapter for a given name."""

from __future__ import annotations

import os

import pytest

from policy_classifier import Classifier, make_classifier
from policy_classifier.adapters import (
    FewShotClaudeAdapter,
    StructuredOutputClaudeAdapter,
    ZeroShotClaudeAdapter,
)


# These tests construct real adapter classes, which requires an API key
# even though they never make a network call. Skip if the key is missing.
pytestmark = pytest.mark.skipif(
    not os.environ.get("ANTHROPIC_API_KEY"),
    reason="ANTHROPIC_API_KEY not set; factory wires real adapters.",
)


def test_zero_shot_strategy_returns_zero_shot_adapter():
    classifier = make_classifier(strategy="zero_shot")
    assert isinstance(classifier, ZeroShotClaudeAdapter)
    assert isinstance(classifier, Classifier)


def test_few_shot_strategy_returns_few_shot_adapter():
    classifier = make_classifier(strategy="few_shot")
    assert isinstance(classifier, FewShotClaudeAdapter)


def test_structured_strategy_returns_structured_adapter():
    classifier = make_classifier(strategy="structured")
    assert isinstance(classifier, StructuredOutputClaudeAdapter)


def test_default_strategy_is_structured():
    classifier = make_classifier()
    assert isinstance(classifier, StructuredOutputClaudeAdapter)


def test_unknown_strategy_raises():
    with pytest.raises(ValueError):
        make_classifier(strategy="rainbows")

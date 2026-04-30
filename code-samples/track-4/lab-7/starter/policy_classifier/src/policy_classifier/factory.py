"""Factory: pick an adapter by config string.

Consumer code does:

    classifier = make_classifier(strategy="structured")

and gets back something that satisfies the Classifier port. The consumer
never imports an adapter directly. That keeps the adapter set swappable.
"""

from __future__ import annotations

from .adapters import (
    FewShotClaudeAdapter,
    StructuredOutputClaudeAdapter,
    ZeroShotClaudeAdapter,
)
from .ports import Classifier


def make_classifier(strategy: str = "structured", **kwargs) -> Classifier:
    """Return a Classifier instance for the named strategy.

    Strategies:
      - "zero_shot":  ZeroShotClaudeAdapter
      - "few_shot":   FewShotClaudeAdapter
      - "structured": StructuredOutputClaudeAdapter (default)

    Extra kwargs (model, api_key, examples) pass through to the adapter.
    Unknown strategies raise ValueError so a typo fails loud.
    """
    # TODO: implement the strategy table. A dict of strategy name to
    # adapter class is the cleanest shape. Look up the class, raise
    # ValueError on miss, otherwise return adapter_class(**kwargs).
    raise NotImplementedError("Implement make_classifier")

"""Factory: pick an adapter by config string (solution)."""

from __future__ import annotations

from .adapters import (
    FewShotClaudeAdapter,
    StructuredOutputClaudeAdapter,
    ZeroShotClaudeAdapter,
)
from .ports import Classifier

_STRATEGIES: dict[str, type[Classifier]] = {
    "zero_shot": ZeroShotClaudeAdapter,
    "few_shot": FewShotClaudeAdapter,
    "structured": StructuredOutputClaudeAdapter,
}


def make_classifier(strategy: str = "structured", **kwargs) -> Classifier:
    try:
        adapter_class = _STRATEGIES[strategy]
    except KeyError as exc:
        valid = ", ".join(sorted(_STRATEGIES))
        raise ValueError(
            f"Unknown classifier strategy {strategy!r}. Valid: {valid}"
        ) from exc
    return adapter_class(**kwargs)

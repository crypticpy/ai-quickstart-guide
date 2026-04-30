"""Adapters implement the Classifier port.

Each adapter knows about one provider. The rest of the codebase does not.
"""

from .zero_shot import ZeroShotClaudeAdapter
from .few_shot import FewShotClaudeAdapter
from .structured import StructuredOutputClaudeAdapter

__all__ = [
    "ZeroShotClaudeAdapter",
    "FewShotClaudeAdapter",
    "StructuredOutputClaudeAdapter",
]

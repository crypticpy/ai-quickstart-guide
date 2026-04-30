"""policy_classifier: a reusable constituent message classifier.

Public surface is the `Classifier` port and the `make_classifier` factory.
Application code should depend only on these, never on a specific adapter.
"""

from .ports import Classifier, ClassificationResult, DEPARTMENTS
from .factory import make_classifier

__all__ = [
    "Classifier",
    "ClassificationResult",
    "DEPARTMENTS",
    "make_classifier",
]

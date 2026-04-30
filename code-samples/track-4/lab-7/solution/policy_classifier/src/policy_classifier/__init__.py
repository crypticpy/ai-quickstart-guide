"""policy_classifier: a reusable constituent message classifier."""

from .ports import Classifier, ClassificationResult, DEPARTMENTS
from .factory import make_classifier

__all__ = [
    "Classifier",
    "ClassificationResult",
    "DEPARTMENTS",
    "make_classifier",
]

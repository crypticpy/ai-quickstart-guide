"""Vendored constituent intake classifier from Lab 4.2.

Lab 4.6 treats this module as the system under test. Do not edit the
classifier itself in this lab. Your tests import from here.
"""

from .classifier import (  # noqa: F401
    DEPARTMENTS,
    Prediction,
    accuracy,
    classify_few_shot,
    classify_structured,
    classify_zero_shot,
    evaluate,
    load_dataset,
)

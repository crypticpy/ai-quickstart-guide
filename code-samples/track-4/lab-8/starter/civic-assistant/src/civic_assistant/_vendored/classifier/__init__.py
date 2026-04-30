"""Frozen copy of the Lab 4.7 classifier module.

Do not edit in place. If the upstream module changes, re-vendor and bump the
service version in pyproject.toml.
"""

from .classifier import DEPARTMENTS, Prediction, classify_structured

__all__ = ["DEPARTMENTS", "Prediction", "classify_structured"]

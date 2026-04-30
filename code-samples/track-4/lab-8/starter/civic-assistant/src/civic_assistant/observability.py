"""Structured request logging.

Every request emits one JSON line with cost, latency, and outcome. The handoff
doc in DEPLOYMENT.md depends on this format being stable.

TODO for the learner:

- Implement `configure_logging` so it replaces the root handlers with a
  JSON formatter. The vendored Lab 4.4 code uses `print`; the Lab 4.7 code
  uses `logging.info`. Both must end up in the same line format.
- Implement `log_request` so it emits one record per call with the fields
  listed in the docstring.
"""

from __future__ import annotations

import json
import logging
import time
from contextlib import contextmanager
from typing import Iterator


REQUEST_LOG_FIELDS = ("endpoint", "outcome", "latency_ms", "input_tokens",
                      "output_tokens", "cost_usd", "request_id")


def configure_logging(level: str = "INFO") -> None:
    """Configure the root logger with a JSON formatter.

    TODO: replace existing handlers with one that emits one JSON line per
    record. Set level. Disable propagation chains that double-print.
    """
    raise NotImplementedError("Implement configure_logging.")


@contextmanager
def log_request(endpoint: str, request_id: str) -> Iterator[dict]:
    """Context manager. Yields a mutable dict the endpoint fills in.

    TODO: capture start time, yield a dict the endpoint mutates with
    `outcome`, `input_tokens`, `output_tokens`, `cost_usd`, then on exit
    emit one logger.info call with the request fields. On exception, set
    `outcome="error"` and re-raise.
    """
    raise NotImplementedError("Implement log_request.")

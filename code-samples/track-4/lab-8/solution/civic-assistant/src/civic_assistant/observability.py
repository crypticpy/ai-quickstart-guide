"""Structured request logging.

One JSON line per request. Cost, latency, and outcome on every line.
"""

from __future__ import annotations

import json
import logging
import sys
import time
from contextlib import contextmanager
from typing import Iterator


REQUEST_LOG_FIELDS = ("endpoint", "outcome", "latency_ms", "input_tokens",
                      "output_tokens", "cost_usd", "request_id", "error_type")


_REQUEST_LOGGER = "civic_assistant.request"


class _JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        return record.getMessage()


def configure_logging(level: str = "INFO") -> None:
    """Replace handlers on the root logger with a single JSON handler.

    Idempotent: safe to call more than once. Vendored modules that used
    `print` or their own loggers are reattached to this handler.
    """
    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(_JsonFormatter())

    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(level.upper())

    # Pin the request logger so it does not double-emit through propagation.
    request_logger = logging.getLogger(_REQUEST_LOGGER)
    request_logger.handlers[:] = [handler]
    request_logger.setLevel(level.upper())
    request_logger.propagate = False


@contextmanager
def log_request(endpoint: str, request_id: str) -> Iterator[dict]:
    """Yield a mutable dict the endpoint fills in. Emits one JSON line on exit."""
    record: dict = {
        "endpoint": endpoint,
        "outcome": "ok",
        "input_tokens": 0,
        "output_tokens": 0,
        "cost_usd": 0.0,
        "request_id": request_id,
        "error_type": None,
    }
    start = time.perf_counter()
    try:
        yield record
    except Exception as exc:
        record["outcome"] = "error"
        record["error_type"] = type(exc).__name__
        raise
    finally:
        record["latency_ms"] = int((time.perf_counter() - start) * 1000)
        payload = {k: record.get(k) for k in REQUEST_LOG_FIELDS}
        logging.getLogger(_REQUEST_LOGGER).info(json.dumps(payload))

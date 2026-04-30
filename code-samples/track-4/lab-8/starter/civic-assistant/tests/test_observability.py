"""Observability tests.

A request must produce exactly one structured log line with the documented
fields. The handoff doc depends on this format being stable.
"""

from __future__ import annotations

import json
import logging

from civic_assistant.observability import (
    REQUEST_LOG_FIELDS,
    configure_logging,
    log_request,
)


def test_log_request_emits_one_json_line(caplog):
    configure_logging("INFO")
    with caplog.at_level(logging.INFO):
        with log_request("classify", request_id="req-test") as record:
            record["outcome"] = "ok"
            record["input_tokens"] = 12
            record["output_tokens"] = 6
            record["cost_usd"] = 0.0001

    matching = [r for r in caplog.records if r.name == "civic_assistant.request"]
    assert len(matching) == 1
    payload = json.loads(matching[0].message)
    for field in REQUEST_LOG_FIELDS:
        assert field in payload
    assert payload["endpoint"] == "classify"
    assert payload["outcome"] == "ok"

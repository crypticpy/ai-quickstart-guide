"""Latency and cost budget tests.

Cassette replays are nearly instant, so live-mode is the meaningful run.
The thresholds below assume real API calls. Run with `LIVE=1` for a true
performance check; cassette mode confirms the test wiring works.
"""

from __future__ import annotations

import statistics
import time

import pytest

from classifier import classify_structured

LATENCY_AVG_BUDGET_S = 2.0
LATENCY_P95_BUDGET_S = 5.0
COST_PER_REQUEST_BUDGET_USD = 0.01

# Token-based cost estimate. As of late 2025 Claude Sonnet 4.5 is roughly
# $3 per million input tokens and $15 per million output tokens; a typical
# classifier call is well under 500 input + 50 output. Numbers update as
# pricing changes; check the [Anthropic pricing page](https://www.anthropic.com/pricing).
INPUT_COST_PER_TOKEN_USD = 3.0 / 1_000_000
OUTPUT_COST_PER_TOKEN_USD = 15.0 / 1_000_000
ASSUMED_INPUT_TOKENS = 400
ASSUMED_OUTPUT_TOKENS = 30


@pytest.mark.performance
def test_average_latency_under_budget(cassette_complete, golden_cases):
    """TODO: classify the first 10 golden cases. Record per-call latency.
    Assert mean(latencies) < LATENCY_AVG_BUDGET_S and the 95th percentile
    < LATENCY_P95_BUDGET_S. Print both numbers so a failing run is
    diagnosable.
    """
    raise NotImplementedError("Implement test_average_latency_under_budget")


@pytest.mark.performance
def test_estimated_cost_per_request_under_budget():
    """TODO: compute estimated_cost = ASSUMED_INPUT_TOKENS * input_rate
    + ASSUMED_OUTPUT_TOKENS * output_rate. Assert it is below
    COST_PER_REQUEST_BUDGET_USD. This is a static budget check; it
    will fail loudly if someone bumps the assumed token counts past the
    budget without updating it.
    """
    raise NotImplementedError("Implement test_estimated_cost_per_request_under_budget")

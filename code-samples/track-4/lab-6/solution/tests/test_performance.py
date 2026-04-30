"""Latency and cost budget tests (solution)."""

from __future__ import annotations

import statistics
import time

import pytest

from classifier import classify_structured

LATENCY_AVG_BUDGET_S = 2.0
LATENCY_P95_BUDGET_S = 5.0
COST_PER_REQUEST_BUDGET_USD = 0.01

INPUT_COST_PER_TOKEN_USD = 3.0 / 1_000_000
OUTPUT_COST_PER_TOKEN_USD = 15.0 / 1_000_000
ASSUMED_INPUT_TOKENS = 400
ASSUMED_OUTPUT_TOKENS = 30


def _percentile(values: list[float], pct: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    k = max(0, min(len(ordered) - 1, int(round(pct * (len(ordered) - 1)))))
    return ordered[k]


@pytest.mark.performance
def test_average_latency_under_budget(cassette_complete, golden_cases):
    sample = golden_cases[:10]
    latencies: list[float] = []
    for row in sample:
        start = time.perf_counter()
        classify_structured(row["text"], cassette_complete)
        latencies.append(time.perf_counter() - start)
    mean = statistics.fmean(latencies)
    p95 = _percentile(latencies, 0.95)
    print(f"\nmean latency: {mean:.3f}s  p95: {p95:.3f}s")
    assert mean < LATENCY_AVG_BUDGET_S, f"mean latency {mean:.3f}s exceeds budget"
    assert p95 < LATENCY_P95_BUDGET_S, f"p95 latency {p95:.3f}s exceeds budget"


@pytest.mark.performance
def test_estimated_cost_per_request_under_budget():
    estimated = (
        ASSUMED_INPUT_TOKENS * INPUT_COST_PER_TOKEN_USD
        + ASSUMED_OUTPUT_TOKENS * OUTPUT_COST_PER_TOKEN_USD
    )
    print(f"\nestimated cost per request: ${estimated:.6f}")
    assert estimated < COST_PER_REQUEST_BUDGET_USD, (
        f"estimated cost ${estimated:.6f} above budget ${COST_PER_REQUEST_BUDGET_USD}"
    )

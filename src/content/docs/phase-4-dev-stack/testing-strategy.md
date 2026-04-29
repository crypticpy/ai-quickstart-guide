---
title: Testing Strategy
description: The testing pyramid adapted for AI workloads — unit, integration, contract (Pact), end-to-end, eval, and performance — with what each layer is for, what it costs, and what enforces it.
sidebar:
  order: 6
---

The agency's tests exist for two audiences: the developer who wants fast feedback, and the future engineer (or auditor) who wants to know the system still works the way it was supposed to. AI workloads add a third concern: the model can change behavior between deploys, so tests need to catch quality regressions, not just functional regressions. This page lays out the layered strategy and where each layer pays off.

## The pyramid

The classic Mike Cohn pyramid still applies. Most of the agency's tests are fast unit tests. A smaller layer of integration tests proves the parts compose correctly. A still smaller layer of contract tests verifies the seams between services. A small number of end-to-end tests exercises real user flows. Above that are evaluation and performance layers specific to AI workloads.

```
                    ┌──────────────┐
                    │     Eval     │  ~30 cases per AI feature
                    └──────────────┘
                  ┌──────────────────┐
                  │  Performance     │  small fixed set
                  └──────────────────┘
                ┌──────────────────────┐
                │   End-to-End (UI)    │  10s of scenarios
                └──────────────────────┘
              ┌─────────────────────────┐
              │     Contract Tests      │  per-service-pair
              └─────────────────────────┘
            ┌──────────────────────────────┐
            │      Integration Tests       │  100s
            └──────────────────────────────┘
         ┌────────────────────────────────────┐
         │            Unit Tests              │  1000s, ms each
         └────────────────────────────────────┘
```

Counts are illustrative. The shape — large base, narrow top — is the discipline. Inverted pyramids (mostly E2E) are slow, brittle, and expensive to maintain.

## Unit tests

**Purpose.** Verify a function or class behaves as specified, in isolation, fast.

**Bar.**

- Each test under 50ms; aggregate suite under 60s for a typical service.
- ≥75% line coverage on new code; teams can raise the bar.
- One assertion concept per test, not one assertion line. (A test can have multiple assertions if they all describe the same outcome.)
- No I/O. No real database, no real network. Mocks for the few unavoidable boundaries.
- Test the public API of the module, not its private implementation.

**What to test.**

- Pure functions and classes — full coverage.
- Branching logic — every path.
- Error handling — what does the function do when its inputs are bad.
- Edge cases — empty list, missing field, max value, unicode.

**What NOT to test.**

- The framework. (FastAPI's routing works; don't write tests proving so.)
- Third-party libraries. (Trust the library or replace it.)
- Generated code (Pydantic models, OpenAPI clients).

## Integration tests

**Purpose.** Verify that components compose correctly within one service: HTTP layer + business logic + database, for example.

**Bar.**

- Run against real dependencies where reasonable: a real Postgres in a container, real Redis, real local file system.
- Run against fakes for genuinely external dependencies: LLM, payment, email.
- Per-test runtime under 5 seconds; whole suite under 5 minutes.
- Each test creates and cleans up its own data; tests do not share state.

**Tooling per stack.**

- **Python:** `pytest` + `testcontainers` for ephemeral Postgres / Redis / etc.
- **Java:** Testcontainers (the original; first-class).
- **Node:** `vitest` + `testcontainers-node`.
- **.NET:** `xUnit` + Testcontainers for .NET.
- **Go:** `go test` + Testcontainers for Go.

**What to test.**

- HTTP routes return the expected status codes and shapes.
- Database migrations apply cleanly.
- Authorization rules block unauthorized access.
- Background workers process messages correctly.

## Contract tests

**Purpose.** Verify that two services agree on the messages they exchange — without running both in the same test.

**Why this layer matters.** When the platform has 4-8 services calling each other, integration testing every pair as a full E2E suite scales badly. Contract testing catches "consumer expects field `userId`, producer renamed to `user_id`" before deploy.

**Bar.**

- Every cross-service surface has a contract test.
- Producer-side test: "I produce messages that match this contract."
- Consumer-side test: "I correctly handle messages that match this contract."
- Run on every PR; block merge on failure.

**Tooling.**

- **Pact** is the dominant cross-language tool. Excellent IDE / CI integration; supports HTTP, message queues, gRPC.
- **OpenAPI-driven** alternatives: tools like `schemathesis`, Dredd verify the API matches the spec. Less expressive than Pact for asynchronous flows.
- For internal use, the agency runs a Pact Broker (self-hosted, free) so teams can publish and verify contracts.

**Where it goes wrong.** Contract tests rot when nobody updates them. Make publishing the contract a CI step, not a manual action.

## End-to-end (E2E) tests

**Purpose.** Verify whole-flow user-facing scenarios run correctly across the real frontend, real API, and real (or recorded) backing services.

**Bar.**

- Few of them — 10s to 30s per service area, not hundreds.
- Cover golden-path scenarios and a small set of high-value failure scenarios.
- Run on every deploy to staging; selective on PR (e.g., only when frontend or contract files change).
- Tolerate flake by retrying 1× automatically; flake rate >2% is a quality bug, not a configuration issue.

**Tooling.**

- **Playwright** (recommended). Cross-browser, fast, scriptable in TypeScript/Python/Java/.NET.
- **Cypress** — popular, excellent UX; runs only in Chromium-family.
- **Selenium** — fallback for legacy systems requiring it.

**What E2E tests are good for.**

- "User can sign in via SSO and reach the home page."
- "User submits an inquiry, receives an answer with citations, marks it helpful."
- "User without permission cannot access the admin dashboard."

**What E2E tests are bad for.**

- Edge cases (slow, expensive, unstable). Push these down the pyramid.
- Validation logic (covered better in unit + integration).
- Performance (separate concern).

## Eval tests (AI-specific)

**Purpose.** Verify that the AI workload's outputs continue to meet the quality bar across model and prompt changes.

**This layer doesn't exist in non-AI software.** The model can degrade silently — same code, same data, different (worse) outputs after a vendor model update. Evals catch it.

**Bar.**

- Each AI feature has an eval suite.
- Suite size starts at ~30 cases; grows as failure modes are found.
- Cases include positives (model should answer correctly), refusals (model should decline), and adversarial cases (prompt injection attempts, scope-leakage attempts).
- Each case has a scoring rule — strict match for some, semantic similarity for others, or LLM-as-judge for the genuinely subjective.
- Suite runs on every PR that touches prompts, retrieval, or model config; runs nightly against production traffic samples for drift detection.

**Where to put cases.**

```
api/tests/eval/cases.jsonl
```

Each line:

```json
{
  "id": "snap-cutoff-2026",
  "input": {
    "query": "What is the SNAP gross income cutoff for a family of 3?"
  },
  "scopes": ["public-policy"],
  "expected": {
    "must_cite_chunks": ["c-snap-2026-01"],
    "must_contain_phrase": ["gross income"],
    "must_not_contain_phrase": ["I cannot help"],
    "scoring": "rubric"
  }
}
```

**Scoring strategies.**

| Strategy            | When to use                                | Watch for                                      |
| ------------------- | ------------------------------------------ | ---------------------------------------------- |
| Exact / regex match | Structured outputs (JSON, classifications) | Brittleness across phrasings                   |
| Citation match      | Retrieval-grounded answers                 | False positives if model cites without using   |
| Semantic similarity | Open-ended answers                         | Embedding model drift; calibrate threshold     |
| LLM-as-judge        | Subjective quality (helpfulness, tone)     | Bias of judge model; re-validate quarterly     |
| Human spot-check    | High-stakes Tier-3 cases                   | Slow; reserve for sample of cases each release |

**Where evals run in CI.**

- On PR: a fast subset (10 cases) using a deterministic-mode model call.
- Pre-prod: full suite with the production model.
- Nightly: full suite + production traffic-sampled cases.

**The blocking rule.** A drop of 5% in aggregate score from baseline blocks merge. The number is conservative; agencies will tune it. Never make eval gates advisory — they get ignored.

## Performance tests

**Purpose.** Verify that latency, throughput, and cost stay within budget.

**Bar.**

- Run on a fixed cadence (nightly) and on demand for performance-affecting changes.
- Targets defined as SLOs: p95 latency, p99 latency, throughput, cost per request.
- Synthetic load shape that approximates production.
- Failures generate a Slack/Teams alert and a follow-up ticket; not all are merge-blockers.

**Tooling.**

- **k6** (recommended). Scripted in JS, runs anywhere, integrates with Grafana.
- **JMeter** for legacy or Java-shop teams.
- **Locust** for Python-shop teams.
- **Artillery** for Node-shop teams.

**For AI workloads specifically.** Token cost can spike under load (longer context, more retrieval). Performance tests should track $/request and tokens/request, not just latency.

## Test data

The agency's test data discipline:

- **Synthetic data only** in unit and integration tests. Generate with a fixture library (`factory_boy`, `faker`, etc.) — no real PII anywhere.
- **Sanitized data** in staging and E2E tests. The synthetic dataset approved for sandbox use is the same dataset used for E2E.
- **No production data** ever in tests. If a bug requires production data to reproduce, sanitize first, then add to fixtures.

For AI workloads, the synthetic dataset's structure must match production for evals to be meaningful. The Review Committee approves the synthetic dataset once and re-reviews if the production data shape changes.

## Coverage

Coverage is a guardrail, not a goal.

- Set a floor (75% line coverage) and enforce it.
- Coverage of 95%+ usually means the tests are testing implementation, not behavior. Inspect.
- 100% coverage is a flag — almost certainly testing trivia.
- Branch coverage is more meaningful than line coverage. Track both if the tooling supports it.

## What does NOT belong in the test suite

- **Tests of the framework.** `def test_fastapi_routes_a_get(): ...` — useless.
- **Tests that depend on external state** (a real third-party API, current date without freezing the clock, network conditions). Use mocks or contract tests instead.
- **Snapshot tests of large blobs.** They become "approve the diff" busywork. OK for small structured outputs; not for full HTML pages.
- **Tests that race.** Flaky tests are removed or fixed. Tolerating flake erodes trust in the suite.
- **Tests that only run if a developer remembers.** Tests that aren't in CI don't exist.

## CI integration

The pipeline (covered in [CI/CD](/phase-3-infrastructure/cicd-pipeline/)) runs tests in this order, fast-failing:

1. Lint and format (under 30s).
2. Unit tests (under 60s).
3. Type check (under 60s).
4. Integration tests (under 5 min).
5. Contract tests (under 1 min).
6. Build, scan, sign (under 5 min).
7. Deploy to staging.
8. E2E tests against staging.
9. Eval suite against staging.
10. Manual approval gate.
11. Deploy to production.

Failures at any stage block the pipeline. The order means a typo gets caught in 30 seconds, not 30 minutes.

## Test maintenance

A test suite is a long-term commitment. Discipline:

- **Delete tests that no longer test anything.** The codebase moves on; some tests outlive their purpose. Prune.
- **Refactor tests with the code.** When the function under test changes shape, the tests change with it; don't pile new tests on top of irrelevant old ones.
- **Quarantine flaky tests.** A test that fails 1% of runs is removed from the merge gate, tagged for investigation, and either fixed or deleted within 2 weeks.
- **Track test ownership.** Each suite has a CODEOWNER; an unowned test is an unmaintained test.

## Common testing failures

- **No tests at the seams.** Unit tests cover the implementation; E2E tests cover the user; nothing covers the API surface that other services depend on. Add contract tests.
- **Eval suite doesn't run in CI.** Then it gets out of date and doesn't catch regressions. Run it on every PR that touches AI paths.
- **All tests are E2E.** Slow, brittle, expensive. Push down the pyramid.
- **No performance baseline.** A regression of 50ms p95 lands and nobody notices for a month. Set baseline; alarm on drift.
- **Tests share state.** One test sets up data another test reads. Unstable order = unstable suite. Each test owns its own setup and cleanup.
- **Tests pass with no assertions.** Tooling can detect this (`pytest --strict-markers --warn-no-assert` style). Block merge.

## Related

- [CI/CD Pipeline](/phase-3-infrastructure/cicd-pipeline/) — the gates this strategy runs through
- [Reference Implementation](/phase-4-dev-stack/reference-implementation/) — the repo that exemplifies all six layers
- [Coding Standards](/phase-4-dev-stack/coding-standards/) — the standards CI enforces
- [Track 4 — Developer Upskilling](/phase-2-education/track-4-developers/) — where developers learn the eval discipline specifically

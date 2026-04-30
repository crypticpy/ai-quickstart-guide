---
title: "Lab 4.6: Testing AI Systems"
description: Build a test suite for an AI feature with golden-set comparison, LLM-as-judge, regression tests, property tests, and performance budgets, all runnable in CI.
sidebar:
  order: 7
---

## What you will build

A pytest suite that exercises a non-deterministic AI feature five different ways: golden-set accuracy, LLM-as-judge on open-ended outputs, prompt-version regression, property-based structural checks, and latency plus cost budgets. The system under test is a vendored copy of the Lab 4.2 constituent intake classifier. You write the tests; the classifier is fixed. Every test runs from cassette replays in CI for cents and from the live API for a few dollars when you record.

## Why this matters for government work

An AI feature that worked in last sprint's demo can quietly degrade after a model update, a prompt tweak, or a vendor rate-limit change. Standard unit tests assume a function is deterministic. AI features are not. A test that asks "did the model return exactly this string?" passes once and breaks the next time the model phrases its answer slightly differently. The test discipline in this lab is what separates a one-off pilot from a system you can keep in production. The five categories below match the practice [Anthropic's evaluation cookbook](https://github.com/anthropics/anthropic-cookbook/tree/main/skills/classification) recommends: a labeled set you measure against, an automated rubric for open-ended outputs, regression checks before any prompt change ships, structural invariants that hold for arbitrary inputs, and explicit performance budgets so cost cannot drift past what your annual contract allows.

## Prerequisites

- Python 3.12 ([download](https://www.python.org/downloads/))
- An Anthropic API key ([get one](https://console.anthropic.com/))
- ~$0.50 of API credit for cassette recording. The default flow replays from disk at zero cost. Running with `LIVE=1` against the full suite costs ~$2.
- Estimated time: 90 minutes.
- Lab 4.2 completed, or familiarity with [pytest fixtures](https://docs.pytest.org/en/stable/explanation/fixtures.html).

## Setup

From the repo root:

Using `uv`:

```bash
uv venv
source .venv/bin/activate
uv pip install -e ./code-samples/track-4/common
uv pip install -e ./code-samples/track-4/lab-6/starter
```

Or using `pip`:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ./code-samples/track-4/common
pip install -e ./code-samples/track-4/lab-6/starter
```

Export the API key (only needed when recording or running live):

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Move into the lab starter directory and run the failing tests:

```bash
cd code-samples/track-4/lab-6/starter
pytest -q
```

You will see `NotImplementedError` for each TODO. That is correct. Your job is to make them pass and end up with a green run that reports five categories of tests.

## Walkthrough

### Step 1: Golden-set accuracy

Open `tests/test_golden.py`. The fixture `golden_cases` loads 30 labeled rows from `tests/golden.jsonl`. Loop over each case, call `classify_structured(row["text"], cassette_complete)`, count matches, and assert the accuracy is at least `GOLDEN_ACCURACY_FLOOR` (0.85). Print mismatches so a failing CI run shows you which IDs broke.

A golden set is the easiest AI test to defend in a review. It is a labeled fixture. The pass/fail criterion is one number. The assertion is "the model gets at least 85% right on the cases I curated." When the model vendor releases a new version, this is the test that surfaces a regression in five seconds.

The catch: do not let your golden set grow stale. A model improvement can make accuracy on your old set go to 100%, which means the set no longer discriminates. Refresh hard cases as the system improves.

### Step 2: LLM-as-judge

Open `tests/test_judge.py`. The summarizer prompt asks the model to rewrite a constituent message as a one-sentence summary. There is no single correct summary, so an exact-match test would be wrong here. Instead, a second model call scores the summary against a rubric (faithfulness, coverage, brevity), each 0 to 5. The test passes when every score is at least 3.

Use this technique sparingly. The judge has its own bias; G-Eval-style methods documented in the [LLM-as-judge research summary](https://huggingface.co/learn/cookbook/en/llm_judge) show that scores can correlate with output length or with the judge's training distribution. Reach for it when there is no labeled answer (summaries, rewrites, free-text recommendations) and skip it when a golden set would do. The [Anthropic prompt engineering overview](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview) covers the structured-output pattern this rubric uses.

Implement `_judge` so it parses the JSON the judge returns and falls back to all-zero scores on a parse failure. A bad parse should fail the test, not silently pass.

### Step 3: Regression test for prompt changes

Open `tests/test_regression.py`. Two prompts live in `classifier.py`: `STRUCTURED_SYSTEM_V1` (current production) and `STRUCTURED_SYSTEM_V2` (terser candidate). Run both against the golden set. Assert that V2's accuracy is at least V1's accuracy minus `REGRESSION_DELTA` (0.05). Print both numbers.

This is the test you run before merging any prompt change. A 5-point drop is a stop sign. Three points is a debate. Anything bigger gets the PR sent back. The same shape works for model upgrades: you compare your existing prompt under the old model and the new model, and the candidate has to clear the same delta floor.

### Step 4: Property tests for structural invariants

Open `tests/test_property.py`. Hypothesis generates plausible-but-random message bodies from a small grammar. Two properties matter:

1. The output label is always in the allowed set. The classifier already enforces this with a fallback, so the test is checking the fallback actually fires for arbitrary inputs.
2. The raw model reply contains no PII-shaped strings (SSN, phone, email regexes). A model that hallucinates a phone number into a routing reply is a problem before it is a privacy problem.

The [Hypothesis documentation](https://hypothesis.readthedocs.io/en/latest/quickstart.html) explains the `@given` decorator and shrinking. When a property fails, Hypothesis minimizes the input to the smallest example that still breaks the test, which is exactly what you want when debugging an AI output regression.

### Step 5: Performance budget

Open `tests/test_performance.py`. Two checks:

- Latency: classify the first 10 golden cases, record per-call latency, assert the mean is under 2 seconds and p95 is under 5 seconds.
- Cost: a static check that estimated cost per request stays below $0.01 given the assumed token counts and the published [Anthropic pricing](https://www.anthropic.com/pricing).

Cassette replays are nearly instant, so the latency check is meaningful only in `LIVE=1` mode. The cost check is static and runs in any mode. Together they are the canary for performance regressions: a prompt that doubles in length, a model swap that triples per-token cost, or a retry loop that quadruples requests will all light up here before the bill does.

## Checkpoints

1. `pytest -q` from `code-samples/track-4/lab-6/starter` reports green for all five test files (`test_golden.py`, `test_judge.py`, `test_regression.py`, `test_property.py`, `test_performance.py`).
2. `pytest --collect-only -q` lists tests under all five marker categories: `golden`, `judge`, `regression`, `property`, `performance`.
3. `pytest -m golden -q` runs only the golden tests and they pass.
4. `RECORD_CASSETTES=1 pytest` produces or updates `cassettes/default.json`. The file shows up in `git status`.
5. Running `pytest` a second time without `RECORD_CASSETTES` and without `LIVE` still passes from the cassette without any API calls.

## Exercises

1. **Add a CI workflow.** Create `.github/workflows/ai-tests.yml` that installs the package and runs `pytest` from cassettes on every PR. The reference workflow lives at `code-samples/track-4/lab-6/solution/.github/workflows/ai-tests.yml` if you get stuck. Use `actions/setup-python@v5` with Python 3.12 and cache `~/.cache/pip`.
2. **Add five more golden cases.** Append five new rows to `tests/golden.jsonl` covering edge cases the existing 30 do not (slang, multi-department messages, off-topic spam). Re-run the golden test. Did accuracy stay above the floor?
3. **Add a canary test that runs against prod.** Write `tests/test_canary.py` that pins one specific input/output pair and runs against the deployed `/classify` endpoint instead of the cassette. Schedule it via `cron` in the same workflow on a weekly trigger. The point: surface deploy-time drift even when nobody is shipping code.

Reference solutions live in `code-samples/track-4/lab-6/solution/`.

## Common problems

**Problem:** `RuntimeError: Cassette miss and neither LIVE=1 nor RECORD_CASSETTES=1 is set.`
**Cause:** A test produced a `(system, user)` pair that is not in `cassettes/default.json`. The fixture refuses to make a silent paid API call.
**Fix:** Run once with `RECORD_CASSETTES=1 ANTHROPIC_API_KEY=...` to record the new pair, then commit the updated cassette file.

**Problem:** Golden-set accuracy is unstable, drifting between 83% and 90% on identical input.
**Cause:** Temperature is non-zero, or the model endpoint is non-deterministic at temperature zero (most are not strictly deterministic across runs).
**Fix:** Lock the test to cassette mode for CI. Live mode is for periodic re-recording, not for every PR. Lower the floor by a few points if you keep flake even on cassettes.

**Problem:** LLM-as-judge gives wildly different scores on identical inputs.
**Cause:** The judge prompt is loose, or the rubric overlaps. Faithfulness and coverage are easy to confuse.
**Fix:** Tighten the rubric language, give explicit anchors ("score 5 means every fact in the message appears in the summary"), and average across three judge calls before comparing to the floor.

**Problem:** `ImportError: No module named 'classifier'` when running tests from the lab directory.
**Cause:** The vendored classifier package is not on `sys.path`.
**Fix:** Confirm `pip install -e ./code-samples/track-4/lab-6/starter` ran. The `pyproject.toml` declares the package, and `conftest.py` also adds the directory to `sys.path` as a fallback.

**Problem:** Hypothesis test fails on a strange minimized input.
**Cause:** Hypothesis found an actual edge case. Treat the failure as data, not noise.
**Fix:** Add the minimized example to your golden set if it is a real complaint shape, then either fix the classifier or widen the property to allow the behavior.

**Problem:** `anthropic.APIError: 429 Too Many Requests` while recording cassettes.
**Cause:** The recording pass fires every test in sequence and hits per-minute rate limits on a free tier.
**Fix:** Add `time.sleep(0.2)` in the cassette miss branch of `conftest.py`, or upgrade per the [Anthropic rate limits docs](https://docs.claude.com/en/api/rate-limits).

**Problem:** Cassette file shows up in `git diff` on every run because the JSON key order shifts.
**Cause:** A non-stable serializer.
**Fix:** The shipped `conftest.py` writes with `sort_keys=True`. If you forked it, add that flag to `json.dumps`.

**Problem:** Performance test passes in cassette mode but fails on `LIVE=1`.
**Cause:** Cassette replay is microsecond-fast and hides real latency.
**Fix:** Run live-mode performance tests in a nightly job, not on every PR. Pin the budget to a real distribution measured in your sandbox, not to a number you copied from another team.

## Swap providers

The `cassette_complete` fixture is provider-agnostic. To swap providers, change the provider argument and use a model ID or deployment name approved for your agency:

```python
real_complete = get_client(provider="openai", model="<approved-model-id>")
```

For Azure OpenAI, set `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, and `AZURE_OPENAI_DEPLOYMENT`, then call `get_client(provider="azure-openai")`. For Bedrock, Vertex AI, or another managed provider, follow the provider's current SDK documentation and implement the same `complete(system, user, **kwargs)` adapter shape. Cassette files are keyed on the model string, so a provider swap invalidates the existing cassette and forces a re-record. That is the right behavior; you should re-baseline accuracy whenever the model changes.

## What you learned

- AI tests come in five categories: golden-set, LLM-as-judge, regression, property, and performance. Each catches a different failure mode.
- Cassettes are how you keep CI cheap and deterministic. Real API calls belong in a periodic re-record pass, not in every PR.
- LLM-as-judge is the right tool for open-ended outputs and the wrong tool for anything a labeled set can answer.
- Prompt regression tests are the gate that prevents quiet model drift from reaching production.
- A performance budget makes cost a code-review concern instead of a finance surprise.

## Where to go next

- [Lab 4.7: Reusable Prompt Modules](/phase-2-education/track-4-developers/lab-7-reusable-ai-modules/) packages the patterns from labs 4.1 through 4.6 into reusable modules.
- [Lab 4.8: Capstone Project](/phase-2-education/track-4-developers/lab-8-capstone/) ties the prompts, agents, retrieval, and tests into a single deliverable.
- The [Phase 4 Testing Strategy](/phase-4-dev-stack/testing-strategy/) page covers where AI tests fit alongside unit, integration, and contract tests in the broader pipeline.

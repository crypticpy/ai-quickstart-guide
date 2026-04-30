---
title: "Lab 4.8: Capstone Civic Assistant Service"
description: Combine prior labs into a deployable FastAPI service with classification, RAG-grounded answers, agent triage, integration tests, and a handoff-ready deployment doc.
sidebar:
  order: 9
---

## What you will build

A FastAPI service called `civic-assistant` with three working endpoints. `/classify` routes a constituent message to a department using the Lab 4.7 classifier module. `/answer` returns a policy answer with citations using a small RAG layer. `/triage` runs an agent loop that classifies the message, looks up permit status when relevant, and escalates to a human ticket when the model is uncertain. The service ships with integration tests, structured request logging, a Dockerfile, a Compose file, and a `DEPLOYMENT.md` an agency platform team could action without calling you.

## Why this matters for government work

Track 4 has taught seven techniques in isolation. A working agency feature is never a single technique. A constituent who emails the agency might want a department, an answer to a policy question, or status on a permit they filed last week. The intake system has to figure out which one and respond. The capstone is the smallest realistic shape of that system. It is also the artifact you would hand to a platform team for a real deployment review. The pedagogy point of this lab is that integration is its own engineering skill. Things that worked in isolation break when wired together. Rate limits compound. Log formats clash. Secrets leak into images. You will see each of these and fix them.

## Prerequisites

- Labs 4.1 through 4.7 completed. The capstone reuses the classifier from 4.2 and 4.7, the RAG corpus from 4.3, the permit-lookup tools from 4.4, the eval patterns from 4.6, and the module shape from 4.7. If any of those are unfamiliar, work through the prior lab first.
- Python 3.12 ([download](https://www.python.org/downloads/)).
- An Anthropic API key ([get one](https://console.anthropic.com/)) OR an OpenAI key OR Azure OpenAI access. Examples default to Anthropic. The swap section at the end shows how to flip providers.
- Docker Desktop or another OCI-compatible runtime ([install Docker](https://docs.docker.com/get-docker/)).
- ~$3 to $5 of API credit covers the full integration test pass and the manual smoke checks.
- Estimated time: 4 hours. Block out a half-day. The capstone is harder than the sum of its parts because integration is its own skill.

## Setup

Move into the lab starter and install once:

Using `uv` (recommended; see the [uv install guide](https://docs.astral.sh/uv/getting-started/installation/)):

```bash
cd ai-quickstart-guide
uv venv
source .venv/bin/activate
uv pip install -e ./code-samples/track-4/common
uv pip install -e ./code-samples/track-4/lab-8/starter/civic-assistant
```

Or using `pip`:

```bash
cd ai-quickstart-guide
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ./code-samples/track-4/common
pip install -e ./code-samples/track-4/lab-8/starter/civic-assistant
```

Export your key and run the failing test pass:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
cd code-samples/track-4/lab-8/starter/civic-assistant
pytest -q
```

You will see a column of `NotImplementedError` failures. That is correct. Your job is to make them pass.

## Walkthrough

The walkthrough has four sub-sections. Wire-up assembles the three endpoints. Integration testing covers the test types you need across endpoint boundaries. Containerization moves from `uvicorn` to a Compose stack. Handoff produces the document a platform team needs.

### Step 1: Wire up the three endpoints

Open `src/civic_assistant/main.py`. The FastAPI app is scaffolded. Each endpoint imports a function that does not exist yet. You will fill in three modules.

`classify.py` is the smallest. It imports the classifier you built in Lab 4.7 and exposes one function, `classify_message(message)`. The Lab 4.7 module is a vendored copy under `src/civic_assistant/_vendored/classifier/` so the capstone is self-contained for the docker build. Wire `classify.py` to call the structured-output classifier and return a `(department, confidence, raw)` tuple. Treat the model output as untrusted text. Validate the department against the known label set before returning, the same way you did in Lab 4.2.

`answer.py` is RAG. The corpus from Lab 4.3 is vendored under `data/policy_corpus/`. Read the markdown files at startup, chunk them by header, and store an in-memory list of `(title, chunk_text)` tuples. Implement two functions:

```python
def retrieve(question: str, k: int = 3) -> list[Chunk]: ...
def answer(question: str) -> AnswerResult: ...
```

For retrieval, the simplest path that works on this corpus is keyword overlap with a small stoplist. The Lab 4.3 starter showed the same approach. The capstone is not the place to introduce a vector database for the first time. Once retrieval returns chunks, build the prompt the same way Lab 4.3 did, with the chunks as cited sources, and instruct the model to cite the title of each chunk it used. If the chunks do not contain the answer, the model must say so. The Anthropic guidance on grounded responses covers the prompt shape ([Anthropic system prompts overview](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/system-prompts)).

`triage.py` is the agent loop from Lab 4.4 with one change. The first tool the agent has is `classify_message` itself, exposed as a function call. The remaining tools are `lookup_permit_by_id` and `escalate_to_human`, vendored from Lab 4.4. The triage system prompt tells the model to classify first, then either look up a permit (if the classification is `permits_and_licensing` and the message contains a permit id), answer with the RAG layer (if the classification is policy-shaped), or escalate. The agent loop is the same as Lab 4.4: send the conversation, run any tool the model picks, append the result, repeat up to `max_iterations`.

Run the service from the package root:

```bash
uvicorn civic_assistant.main:app --reload
```

In a second terminal:

```bash
curl -X POST http://127.0.0.1:8000/classify \
    -H "Content-Type: application/json" \
    -d '{"message": "There is a pothole on Maple Street."}'

curl -X POST http://127.0.0.1:8000/answer \
    -H "Content-Type: application/json" \
    -d '{"question": "How many days remote work am I eligible for?"}'

curl -X POST http://127.0.0.1:8000/triage \
    -H "Content-Type: application/json" \
    -d '{"message": "What is the status of permit P-2026-00101?"}'
```

You should get back JSON with the department, the answer with cited titles, and the triage result with a tool-call trace.

### Step 2: Integration testing

The starter ships three test files. `test_classify.py` and `test_answer.py` cover the simpler endpoints. `test_triage.py` exercises the full loop with a stubbed model client so the test does not require API access.

The tests do three things you have not seen together before:

1. **Golden cases.** A handful of fixed `(input, expected_label)` pairs for `/classify`. These are smoke tests, not benchmarks. If a refactor breaks them, the build fails.
2. **LLM-as-judge for `/answer`.** A small set of policy questions with a reference answer, scored by a separate Claude call. The judge prompt comes from Lab 4.6. Cost is measurable; gate the test on a `RUN_JUDGE_TESTS=1` env var so a default `pytest` run does not spend on it.
3. **Tool-call traces for `/triage`.** Each test asserts on the _trace_, not on the wording of the final answer. A triage test that asserts "the answer contains the word approved" is fragile. A test that asserts "the trace contains a `lookup_permit_by_id` call with `permit_id=P-2026-00101`" is not.

Run the regular tests with:

```bash
pytest -q
```

Run the LLM-as-judge tests with:

```bash
RUN_JUDGE_TESTS=1 pytest tests/test_answer_judge.py -q
```

The judge tests cost ~$0.50 to $1 per pass on a small question set.

### Step 3: Containerize

The starter has a `Dockerfile` and a `compose.yaml`. The Dockerfile is two-stage: a builder stage that installs the package and a runtime stage that copies only the venv and the source into a slim image. The Anthropic `httpx` dependency does not need build tools at runtime; the two-stage shape keeps the final image small.

Three things to verify:

1. The image does not contain your API key. Run `docker run --rm civic-assistant env | grep -i anthropic`. Output should be empty. The key is supplied at run time by Compose, not baked in.
2. The container has a `HEALTHCHECK` that hits `/health`. Compose uses it to mark the container ready before downstream services attach.
3. The container shuts down cleanly on `SIGTERM`. FastAPI does this for you when run under `uvicorn` directly. Confirm with `docker compose down` and watch the logs; you should see "Application shutdown complete" before the container exits.

Bring the stack up:

```bash
cd code-samples/track-4/lab-8/starter/civic-assistant
docker compose up --build
```

In a second terminal, run the same three `curl` commands from Step 1 against `http://127.0.0.1:8000/...`. The shape of the responses should be identical to what you saw under `uvicorn --reload`.

### Step 4: Handoff document

Open `DEPLOYMENT.md` in the starter. It is a template, not a finished doc. Fill in:

- The service summary in plain English. One paragraph. What it does, who calls it, what it costs to run.
- The runtime contract. Endpoints, request shapes, expected latency, and the cost per call envelope. Numbers come from the structured logs the service emits during the integration test pass.
- The dependency list. Anthropic API, optional OpenAI API, the policy corpus, the synthetic permit data. For each one, state whether it is in-process or an outbound call, and whether it has a fallback.
- The secrets and configuration table. Every env var, what it is for, and what happens if it is missing.
- The operational runbook stub. Health check URL, log format, the three most likely failures (rate limit, missing key, missing corpus file), and the rollback step (re-deploy the previous image tag). The Phase 6 deployment runbook is the long-form version of this section ([Phase 6 Deployment Runbook](/phase-6-starter-projects/deployment-runbook/)).
- The known limits. Synthetic data, no real auth in front of the endpoints, no rate limiting beyond what FastAPI provides by default.

`DEPLOYMENT.md` is the artifact a platform team reads before they accept the service. If a section is empty when you finish, the platform team will reject the handoff. The Phase 6 production readiness page lists the agency-side checks that follow ([Phase 6 Production Readiness](/phase-6-starter-projects/production-readiness/)).

## Checkpoints

1. `pytest -q` from the `civic-assistant` directory reports all non-judge tests passing.
2. `RUN_JUDGE_TESTS=1 pytest tests/test_answer_judge.py -q` runs and reports a judge score above the configured threshold.
3. `uvicorn civic_assistant.main:app --reload` starts and the three `curl` commands return well-formed JSON for `/classify`, `/answer`, and `/triage`.
4. `docker compose up --build` builds and starts the stack. `curl http://127.0.0.1:8000/health` returns `{"status": "ok"}`. `docker run --rm civic-assistant env | grep -i anthropic` prints nothing.
5. The structured request logs show one line per request with cost, latency, and outcome. Pipe a few requests and confirm with `docker compose logs civic-assistant | tail`.
6. Your service is running in Docker, all three endpoints respond, integration tests pass, and you have a `DEPLOYMENT.md` a platform team could action.

## Exercises

1. **Add a response cache to `/answer`.** Use a small in-process LRU cache keyed on the lowercase, whitespace-collapsed question. Measure the cost difference across the judge test pass with and without the cache. The point is not the cache implementation. The point is the measurement: how much of your bill is duplicate questions?
2. **Add a feature flag system.** Read a `FEATURE_FLAGS` env var as a comma-separated list. Gate `/triage` behind a `triage_enabled` flag so the service can ship without it. Production AI services almost always launch with at least one feature gated; this is the smallest version of that pattern.
3. **Deploy to a free-tier cloud.** Pick one of [Fly.io](https://fly.io/docs/), [Railway](https://docs.railway.com/), or [Google Cloud Run](https://cloud.google.com/run/docs) free tier. Use the Dockerfile you already have. Set the API key as a secret in the platform's UI. The exercise is the deploy step: getting from "it runs in my Docker" to "it has a public URL my supervisor can hit."

Hints and reference answers for each exercise live in `code-samples/track-4/lab-8/solution/`.

## Common problems

**Problem:** `anthropic.APIError: 429 Too Many Requests` during the integration test pass.
**Cause:** The full test pass makes ~30 to 50 model calls in tight sequence. A free-tier rate limit will trip before you finish.
**Fix:** Insert a short `time.sleep(0.2)` in the test fixtures between calls, or move to a paid tier ([Anthropic rate limits docs](https://docs.claude.com/en/api/rate-limits)). The structured log lines will show you the exact call rate.

**Problem:** Log lines from `/classify`, `/answer`, and `/triage` print in three different formats and you cannot grep them together.
**Cause:** Each module set up its own logger. Vendored code from Lab 4.4 used `print`, the Lab 4.7 code used `logging.info`, and the new RAG layer used `logger.info` with a different formatter.
**Fix:** `observability.py` is the single point of truth. Configure a `JsonFormatter` once at app startup and call `logging.getLogger().handlers[:] = [...]` to replace the handlers on every imported module. Do this in `main.py` before any other import emits a log line.

**Problem:** `docker run --rm civic-assistant env` shows `ANTHROPIC_API_KEY=sk-ant-...` in the output.
**Cause:** The key was passed as a build arg, not a runtime env var. `ARG` values are baked into image layers and are recoverable from the registry. This is the most common production AI security incident.
**Fix:** Remove every `ARG ANTHROPIC_API_KEY` from the Dockerfile. Pass the key only via `compose.yaml`'s `environment:` block (which sources it from the host shell) or via the platform secrets manager. The Phase 3 secrets management page covers the agency-side options ([Phase 3 secrets management](/phase-3-infrastructure/secrets-management/)).

**Problem:** `/triage` returns a 200 response with `{"answer": "I cannot help with that.", "trace": []}` for any input.
**Cause:** The triage system prompt is too restrictive and the model refuses every tool call. Or the tools list passed to the model is empty because of an import error.
**Fix:** Print the tool schemas in the `/triage` handler before the agent loop runs. If the list is empty, the import failed silently. If the list is correct, loosen the system prompt to _encourage_ tool use rather than warn against misuse.

**Problem:** `/answer` returns a confident-sounding answer that is not in the corpus.
**Cause:** The retrieval step returned chunks with low overlap. The model fell back to its training data and invented an answer. This is the most common RAG failure mode.
**Fix:** Add a retrieval-confidence floor. If no chunk scores above a threshold, return a fixed response of "I do not have a policy on that. Please contact the relevant department." Do not let the model answer from training when retrieval is empty.

**Problem:** CORS errors from a browser hitting the deployed service.
**Cause:** The default FastAPI app does not enable CORS, and no middleware was added.
**Fix:** Add `fastapi.middleware.cors.CORSMiddleware` with an explicit allowlist of origins in `main.py`. Do not use `allow_origins=["*"]` for an agency service. The OWASP guidance on CORS is the right reference ([OWASP CORS cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#cross-origin-resource-sharing)).

**Problem:** `pytest tests/test_triage.py` hangs for 30 seconds and then times out.
**Cause:** A real Anthropic client was injected instead of the stub. The test is hitting the live API in a tight loop.
**Fix:** The triage tests must inject a `StubClient` from the test module, the same shape as Lab 4.4. Search the test file for `Anthropic(` and replace with the stub.

**Problem:** Integration tests pass locally and fail in the container.
**Cause:** The container has no `ANTHROPIC_API_KEY` because Compose did not pick it up from the host shell.
**Fix:** Confirm with `docker compose config` that the `environment:` block resolves to a non-empty value. Source your shell rc file in the same terminal you run `docker compose` from.

## Swap providers

`settings.py` is the single config surface. Change `LLM_PROVIDER=openai` and `LLM_MODEL=gpt-4o-mini` in the environment, restart the service, and every endpoint flips. The judge inside `test_answer_judge.py` reads the same setting, so the judge swaps with the service. For Azure, set `LLM_PROVIDER=azure-openai` plus `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, and `AZURE_OPENAI_DEPLOYMENT`. For Bedrock, the cleanest path is Anthropic's [Bedrock integration](https://docs.claude.com/en/api/claude-on-amazon-bedrock); set `ANTHROPIC_BEDROCK_BASE_URL` and add `anthropic[bedrock]` to the install. The endpoint surface, the test surface, and `DEPLOYMENT.md` do not change.

## What you learned

- Integration is engineering, not configuration. Wiring three working modules into one service surfaces problems neither module had on its own.
- Production posture has a specific shape: env-var settings, structured logs with cost and latency, secrets passed at runtime, health checks, graceful shutdown, CORS configured explicitly.
- A handoff document is the artifact that determines whether a platform team accepts your service. If `DEPLOYMENT.md` is empty, the deploy never happens.
- Test types stack: unit tests on tools, golden cases on classifiers, LLM-as-judge on free-text answers, trace assertions on agent loops. Each test type catches a different class of bug.

## Where to go next

- The [Phase 5 modular platform overview](/phase-5-platform/) shows where this service sits relative to the modules a platform team owns long-term.
- The [Phase 6 starter projects](/phase-6-starter-projects/) page lists the five archetypes a real first agency project might take. Civic-assistant maps closest to the document intelligence and RAG chatbot archetypes.
- The [Phase 6 production readiness](/phase-6-starter-projects/production-readiness/) checklist is the next gate after this lab. It lists the agency-side reviews (security, accessibility, records retention) the lab does not cover.
- The [Phase 6 deployment runbook](/phase-6-starter-projects/deployment-runbook/) is the long-form version of `DEPLOYMENT.md` and is what a platform team will hand back to you on the first incident.

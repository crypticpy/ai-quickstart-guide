---
title: "Lab 4.7: Hexagonal Architecture for AI Features"
description: Refactor an AI feature into a port plus three adapters, then publish it as an inner-source module another agency app can install.
sidebar:
  order: 8
---

## What you will build

A Python package called `policy_classifier` that wraps the Lab 4.2 classifier behind a single contract. The package exposes one abstract `Classifier` port, three Anthropic Claude adapters (zero-shot, few-shot, structured-output), a factory that picks an adapter from a config string, and a contract test suite that runs against any adapter. A second package, a small FastAPI consumer app, imports the module and proves the point: the endpoint code does not know which strategy is wired in.

## Why this matters for government work

Agencies do not get to lock in a model vendor for a decade. Procurement rules change, prices change, capability gaps change. A classifier that names `anthropic.Anthropic` directly inside the request handler turns every vendor change into a refactor across the codebase. A classifier that depends on a port turns every vendor change into a one-file adapter swap. The Phase 5 platform is built on that pattern for a reason. This lab is where Track 4 developers learn the move on a small surface before they apply it to a shared module.

The same architecture also makes contract testing tractable. One test suite proves the contract; every new adapter is graded against the same suite. That is what lets the platform team accept inner-source contributions from application teams without worrying that a new adapter will quietly break the rest of the agency.

## Prerequisites

- Python 3.12 ([download](https://www.python.org/downloads/))
- An Anthropic API key ([get one](https://console.anthropic.com/)). Lab examples default to Anthropic; the swap section at the end shows OpenAI, Azure, and Bedrock paths.
- ~$0.30 of API credit covers the integration tests.
- Estimated time: 120 minutes. This is a meaty refactor.
- Lab 4.2 completed, or a working understanding of the prompt-strategy pattern.
- Familiarity with Python virtual environments, `pytest`, and `pyproject.toml`.

## Setup

Move into the lab starter directory. The starter holds two packages: the `policy_classifier` module and a `consumer-app` that imports it.

Using `uv`:

```bash
cd ai-quickstart-guide/code-samples/track-4/lab-7/starter
uv venv
source .venv/bin/activate
uv pip install -e ./policy_classifier
uv pip install -e ./consumer-app
uv pip install pytest httpx
```

Or using `pip`:

```bash
cd ai-quickstart-guide/code-samples/track-4/lab-7/starter
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ./policy_classifier
pip install -e ./consumer-app
pip install pytest httpx
```

Export your API key for the integration tests later:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Run the contract tests once. They will fail at the abstract method:

```bash
cd policy_classifier
pytest -q
```

Failure on the first run is correct. Your job is to fill in the port, the adapters, and the factory until the suite passes.

## Walkthrough

### Step 1: Read the layout

Open `policy_classifier/`. The package has a single public surface declared in `__init__.py`: `Classifier`, `ClassificationResult`, `DEPARTMENTS`, and `make_classifier`. Everything else is internal. Consumers import from the package root, never from `adapters` or anywhere deeper. That discipline is what makes the module swappable later.

The two-package layout (`policy_classifier/` next to `consumer-app/`) is deliberate. In a real agency the module would be inner-source-published, the consumer app would install it from an internal index, and neither package could reach into the other's internals. Doing it locally with `pip install -e` mimics the same boundary on a developer laptop.

### Step 2: Implement the port

Open `policy_classifier/src/policy_classifier/ports.py`. The `Classifier` class is an abstract base class. Add the abstract method:

```python
class Classifier(ABC):
    @abstractmethod
    def classify(self, message: str) -> ClassificationResult:
        """Classify a constituent message into a department label."""

    # ... shared helpers (already implemented)
```

Two design choices worth naming. First, `ClassificationResult` is a frozen dataclass. Consumers cannot mutate it after the fact, which prevents a class of bugs where business logic stamps over a model's answer. Second, the validation helpers (`validate_message`, `normalize_label`) live on the base class so every adapter inherits them. An adapter that forgets to validate is the kind of bug that ships once and stays in production for years.

The Cockburn paper introduced this pattern as "ports and adapters" in 2005 and the framing has held up well across two decades of use ([Cockburn on hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture/)). The port is the abstract contract; the adapter is the concrete implementation that knows about a specific external system.

### Step 3: Fill in the zero-shot adapter

Open `adapters/zero_shot.py`. The constructor already wires up the Anthropic SDK and accepts an optional `api_key` for testability. You write the `classify` method:

```python
def classify(self, message: str) -> ClassificationResult:
    cleaned = self.validate_message(message)
    msg = self._client.messages.create(
        model=self._model,
        max_tokens=20,
        temperature=0.0,
        system=ZERO_SHOT_SYSTEM,
        messages=[
            {"role": "user", "content": f"Message:\n{cleaned}\n\nLabel:"}
        ],
    )
    raw = "".join(block.text for block in msg.content if block.type == "text")
    return ClassificationResult(
        label=self.normalize_label(raw),
        confidence=1.0,
        raw=raw,
    )
```

Notice the shape. The adapter knows about Claude. The result it returns does not. Anything downstream (`consumer-app/main.py`, future apps, the test suite) reads a `ClassificationResult` and never touches an Anthropic type. That is the dependency inversion in one method.

The Anthropic Messages API reference covers the parameters in detail ([Anthropic Messages API](https://docs.claude.com/en/api/messages)).

### Step 4: Fill in the few-shot and structured-output adapters

Few-shot is the same shape with a longer user prompt that includes labeled examples. The adapter ships a small `DEFAULT_EXAMPLES` list inline so it can be used without a corpus; in a real agency rollout the examples would come from the agency's intake archive.

Structured output is more interesting. The model is asked to return JSON, and the adapter parses it:

```python
def _parse(self, raw: str) -> ClassificationResult:
    try:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        payload = json.loads(match.group(0)) if match else {}
    except (json.JSONDecodeError, AttributeError, ValueError):
        return ClassificationResult(label="general_info", confidence=0.0, raw=raw)
    # ... validate department + clamp confidence
```

The parse-failure fallback is not optional. The adapter accepts arbitrary text from a remote model; the rest of the codebase trusts the result. If parsing fails, the adapter returns a safe `general_info` label with `confidence=0.0`, and the consumer app can decide whether to surface that as `human_review`. The contract holds either way.

### Step 5: Implement the factory

Open `factory.py`. The factory is a small dispatcher. A dict of strategy name to adapter class is the cleanest shape:

```python
_STRATEGIES: dict[str, type[Classifier]] = {
    "zero_shot": ZeroShotClaudeAdapter,
    "few_shot": FewShotClaudeAdapter,
    "structured": StructuredOutputClaudeAdapter,
}


def make_classifier(strategy: str = "structured", **kwargs) -> Classifier:
    try:
        adapter_class = _STRATEGIES[strategy]
    except KeyError as exc:
        valid = ", ".join(sorted(_STRATEGIES))
        raise ValueError(
            f"Unknown classifier strategy {strategy!r}. Valid: {valid}"
        ) from exc
    return adapter_class(**kwargs)
```

The factory is the only place that knows the full adapter set. Adding a new adapter (Bedrock, OpenAI, on-prem Llama) is one new file in `adapters/` plus one line in `_STRATEGIES`. No other code in the repo changes. That property is what the rest of this lab is in service of.

### Step 6: Run the contract tests

Run the contract suite:

```bash
cd policy_classifier
pytest -q tests/test_contract.py
```

The suite uses a `FakeClassifier` defined in `conftest.py` that maps phrases to labels in memory. It is exactly the same shape as a real adapter, which is the whole point. The same six tests prove the contract on the fake and on every real adapter. If you add a `MockAdapter` later for offline testing, you do not write new tests; the existing suite covers it.

Run the factory tests:

```bash
pytest -q tests/test_factory.py
```

These need an API key set because they construct real adapter instances. Skip them if you do not have one yet.

### Step 7: Wire it into the consumer app

Open `consumer-app/main.py`. The endpoint is already written. The point of this step is to read it carefully:

```python
from policy_classifier import Classifier, make_classifier

@lru_cache(maxsize=1)
def _get_classifier() -> Classifier:
    strategy = os.environ.get("CLASSIFIER_STRATEGY", "structured")
    return make_classifier(strategy=strategy)


@app.post("/classify", response_model=ClassifyResponse)
def classify(
    body: ClassifyRequest,
    classifier: Classifier = Depends(get_classifier),
) -> ClassifyResponse:
    result = classifier.classify(body.message)
    return ClassifyResponse(department=result.label, confidence=result.confidence)
```

This file does not import `anthropic`. It does not import an adapter. It depends on the port and the factory. The strategy is a config knob; the provider is an adapter detail. If procurement moves the agency from Anthropic to Bedrock next year, this file does not change.

Run the consumer's tests:

```bash
cd ../consumer-app
pytest -q
```

These pass without an API key because the test file uses FastAPI's dependency override system to inject a fake classifier ([FastAPI testing dependencies](https://fastapi.tiangolo.com/advanced/testing-dependencies/)). The endpoint never hits the network.

### Step 8: Run integration tests against all three real adapters

With `ANTHROPIC_API_KEY` set, run the integration suite:

```bash
cd ../policy_classifier
pytest -q tests/test_integration.py
```

The fixture is parameterized over `("zero_shot", "few_shot", "structured")`, so the same three tests run nine times total. Each adapter has to satisfy the contract: return a `ClassificationResult`, route the pothole message to `public_works`, reject empty input. If a new adapter ever fails one of these, that is a real contract violation, not a flaky test.

Total spend for the integration suite is around $0.30. The output looks like:

```text
tests/test_integration.py ......... [100%]
9 passed in 6.42s
```

### Step 9: Start the consumer app

```bash
cd ../consumer-app
CLASSIFIER_STRATEGY=structured uvicorn main:app --reload
```

Then in a second terminal:

```bash
curl -X POST http://127.0.0.1:8000/classify \
    -H "Content-Type: application/json" \
    -d '{"message": "There is a pothole on Maple Street."}'
```

You get back `{"department": "public_works", "confidence": 0.95}`. Change `CLASSIFIER_STRATEGY=zero_shot`, restart, and curl again. The endpoint output shape is identical. You just swapped a strategy with a config flag.

## Checkpoints

1. `pip install -e ./policy_classifier` finishes without errors and `python -c "from policy_classifier import make_classifier; print(make_classifier)"` prints the function reference.
2. `pytest -q tests/test_contract.py` from inside `policy_classifier/` reports all contract tests passing against the FakeClassifier.
3. `pytest -q tests/test_factory.py` (with API key set) reports all factory tests passing.
4. `pytest -q tests/test_integration.py` (with API key set) runs the same contract suite against all three real adapters and reports nine passes.
5. `pytest -q` from inside `consumer-app/` reports all endpoint tests passing without hitting the network.
6. `uvicorn main:app --reload` starts cleanly and `curl /classify` returns a valid department for the pothole message.

## Exercises

1. **Add a `MockAdapter`.** Create `adapters/mock.py` that returns a configurable canned response. Register it in the factory under `"mock"`. Run the existing contract test suite against it. No new tests required. This is the test double that lets other apps unit-test their integration with `policy_classifier` without an API key.
2. **Add an `OpenAIAdapter`.** Implement zero-shot against OpenAI's chat completions API. Add `"openai_zero_shot"` to the factory. Run the contract suite against the new adapter. The test that fails first will tell you what part of the contract you missed (often confidence range or label normalization).
3. **Add a circuit breaker at the port level.** Wrap `Classifier` subclasses with a decorator that opens after three consecutive failures and returns a `general_info` fallback for thirty seconds. The decorator should accept any `Classifier` and return something that also satisfies `Classifier`. The contract suite still has to pass; the decorator only changes failure behavior, not happy-path behavior.

Reference answers and worked solutions are in `code-samples/track-4/lab-7/solution/`.

## Common problems

**Problem:** `ModuleNotFoundError: No module named 'policy_classifier'`.
**Cause:** The package is not installed in the active venv, or the venv is not active.
**Fix:** From `lab-7/starter/`, run `source .venv/bin/activate` then `pip install -e ./policy_classifier`. Confirm with `pip show policy-classifier`.

**Problem:** `TypeError: Can't instantiate abstract class ZeroShotClaudeAdapter with abstract method classify`.
**Cause:** The abstract method `classify` was added to the port, but the adapter still has a different signature or is missing the override.
**Fix:** Open the adapter, confirm it defines `def classify(self, message: str) -> ClassificationResult:` exactly. The method name must match the abstract method name verbatim.

**Problem:** `ImportError: attempted relative import with no known parent package`.
**Cause:** A test or script is being run as a loose file rather than through the installed package.
**Fix:** Run `pytest` from inside `policy_classifier/`, not from inside `src/`. The `pyproject.toml` sets `pythonpath = ["src"]` so pytest finds the package.

**Problem:** Contract tests pass for the FakeClassifier but fail for the structured adapter.
**Cause:** This is a real contract violation. The structured adapter is returning a `confidence` value outside `[0.0, 1.0]`, or a label not in `DEPARTMENTS`, when the model gives a malformed reply.
**Fix:** Check the parse-failure path. The adapter must clamp confidence and fall back to `general_info` on any parse error. The contract test is correct; the adapter needs to honor it.

**Problem:** `RuntimeError: ANTHROPIC_API_KEY is not set in the environment.` when running unit tests.
**Cause:** The factory tests construct real adapters, which validate the API key in the constructor.
**Fix:** The factory tests are skipped automatically when the key is missing. If they are not skipping, confirm the `pytestmark = pytest.mark.skipif(...)` line at the top of `test_factory.py` is intact.

**Problem:** Endpoint tests in `consumer-app/test_main.py` try to hit the live API.
**Cause:** The dependency override is not registered before the `TestClient` is constructed, or the override targets a different function than the endpoint depends on.
**Fix:** The override must use the exact function passed to `Depends(...)`. In this lab, the endpoint depends on `get_classifier`; the override must be keyed off that same symbol.

**Problem:** Adding a new adapter and the contract test for it fails on `test_falls_back_for_unknown_message`.
**Cause:** The new adapter is raising on unknown messages instead of returning a `general_info` fallback.
**Fix:** Adapters never raise on a valid non-empty string. The contract is "always return a result, even if low-confidence." Adjust the adapter, not the test.

## Swap providers

To run the same module against OpenAI instead of Anthropic, write a single new adapter file. Copy `adapters/zero_shot.py`, replace the `anthropic.Anthropic` client with `openai.OpenAI`, and register the new class in `factory.py`. The contract tests run unchanged against it. For Azure OpenAI, the OpenAI SDK exposes an `AzureOpenAI` class that takes `azure_endpoint`, `api_key`, and `api_version`; same adapter shape. For Anthropic via Bedrock, install `anthropic[bedrock]` and use the `AnthropicBedrock` client; the rest of the adapter is identical because Bedrock is just a different transport for the same model family ([Claude on Amazon Bedrock](https://docs.claude.com/en/api/claude-on-amazon-bedrock)).

## What you learned

- Hexagonal architecture in one file: a port (the `Classifier` abstract base class) defines the contract; adapters implement it; consumers depend on the port, not the adapters.
- The factory pattern is how a config string becomes a dependency at runtime. Adding a provider is one new file plus one line.
- Contract testing means one test suite that runs against every adapter. New adapters are graded against the same bar without rewriting tests.
- A Python package shipped via `pyproject.toml` and `pip install -e .` is the same packaging shape an agency uses for inner-source distribution. The dual-package layout is the local rehearsal.
- The consumer app does not import `anthropic`. That is the whole point. Vendor changes stay inside the module.

## Where to go next

- [Lab 4.8: Capstone Project](/phase-2-education/track-4-developers/lab-8-capstone/) brings the labs together into a full feature.
- [Phase 5 AI Orchestration Module](/phase-5-platform/ai-orchestration-module/) shows the same pattern at platform scale: ports, adapters, prompt registry, eval harness.
- [Phase 5 Module Taxonomy](/phase-5-platform/module-taxonomy/) covers the broader hexagonal pattern across the seven core modules.
- [Phase 5 Inner Source Contribution Guide](/phase-5-platform/inner-source/) explains how a module like this gets published, contributed to, and maintained across teams.
- [PEP 621](https://peps.python.org/pep-0621/) and the [Python Packaging User Guide](https://packaging.python.org/en/latest/) cover the `pyproject.toml` shape this lab uses.

# Lab 4.7 starter

Two packages live in this directory.

```
starter/
├── policy_classifier/   # the reusable module (port + adapters + tests)
└── consumer-app/        # a FastAPI app that depends on the module
```

That layout is the point of the lab. The module is an artifact other
agency apps can install. The consumer app is what an application team
would ship on top of it.

## Why two packages

In a real agency the module would be inner-source-published and the
consumer app would import it via a versioned package. We mimic that
shape locally with `pip install -e ./policy_classifier`. The module's
tests run inside its own folder. The consumer's tests run inside its
own folder. Neither package can reach into the other's internals.

## What you will fill in

- `policy_classifier/src/policy_classifier/ports.py`. The `Classifier`
  abstract base class. Add the abstract `classify` method.
- `policy_classifier/src/policy_classifier/adapters/zero_shot.py`.
  Finish the Anthropic call.
- `policy_classifier/src/policy_classifier/adapters/few_shot.py`.
  Finish the few-shot prompt.
- `policy_classifier/src/policy_classifier/adapters/structured.py`.
  Finish the JSON-output adapter, including parse-failure fallback.
- `policy_classifier/src/policy_classifier/factory.py`.
  Finish `make_classifier`.

The consumer app and the test suite are already written. You make them
pass.

## How to run

From the `starter` directory:

```bash
# 1. Install the module so the consumer app can import it.
pip install -e ./policy_classifier

# 2. Install the consumer app's test dependencies.
pip install -e ./consumer-app
pip install pytest httpx

# 3. Run the module's contract tests (no API key required).
cd policy_classifier && pytest -q && cd ..

# 4. Run the consumer app's endpoint tests (no API key required).
cd consumer-app && pytest -q && cd ..

# 5. With an API key set, run the integration suite against all three adapters.
export ANTHROPIC_API_KEY=sk-ant-...
cd policy_classifier && pytest -q tests/test_integration.py && cd ..
```

Running the consumer app directly:

```bash
cd consumer-app
uvicorn main:app --reload
```

Then in a second terminal:

```bash
curl -X POST http://127.0.0.1:8000/classify \
    -H "Content-Type: application/json" \
    -d '{"message": "There is a pothole on Maple Street."}'
```

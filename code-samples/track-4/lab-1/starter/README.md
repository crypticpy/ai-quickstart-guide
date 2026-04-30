# Lab 4.1 starter

Skeleton code for the LLM API fundamentals lab. The goal is to build a small provider-neutral wrapper that teaches the common shape every model API call has:

- provider and model ID configuration
- secret lookup from environment variables
- request construction
- token and cost estimates
- retry behavior for transient failures
- request logging without leaking prompts or API keys

The tests are offline. They use stub transport functions instead of calling a live provider.

Run the failing tests first:

```bash
cd code-samples/track-4/lab-1/starter
pytest -q
```

Fill in the TODOs in `llm_wrapper.py`. When all tests pass, compare with `../solution/`.

Provider model IDs change. Treat any model string in this lab as an example slug. Before using a live model in class or production, check the provider's current model/API documentation and the agency's approved tools list.

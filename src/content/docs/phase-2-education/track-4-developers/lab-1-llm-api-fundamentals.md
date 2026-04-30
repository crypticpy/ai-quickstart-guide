---
title: "Lab 4.1: LLM API Fundamentals"
description: Two-hour hands-on lab where developers build a provider-neutral model API wrapper with configuration, token estimates, safe logging, and retry behavior.
sidebar:
  order: 2
---

## What you will build

A small provider-neutral LLM wrapper in Python. It does not call a live model during tests. Instead, it teaches the shape every model integration needs: provider configuration, model ID selection, API-key lookup, request payload construction, token/cost estimates, retry behavior, and log-safe request summaries.

By the end of the lab, developers understand where provider-specific details belong and where they should not leak into application code.

## Audience and prerequisites

- Track 1 (AI Foundations) completed
- Python 3.12 installed.
- Familiarity with HTTP, JSON, and environment-variable secret handling.
- No live API key is required for the default lab. If the instructor adds a live-provider demo, use only agency-approved keys and models.

## Skills covered

- Model IDs, deployment names, and provider slugs.
- API authentication and key lookup from environment variables.
- Token and per-request cost estimation.
- Request payload construction.
- Error handling, retries with backoff, and rate-limit awareness.
- Safe logging that omits prompts, outputs, and secrets.

## Model IDs in plain English

A model ID is the string a provider expects in an API call to identify which model or deployment should answer. Depending on provider, it may be called a model name, model slug, deployment name, endpoint name, or model resource.

Examples in code are placeholders. Providers maintain the current list in their API docs, and agencies often restrict the allowed list through procurement, security review, or approved tools policy. Before a live class or deployment, verify:

- which provider is approved;
- which model IDs or deployment names are approved;
- whether aliases are allowed or snapshot/pinned IDs are required;
- which region or cloud boundary the model runs in;
- whether the SDK method shown in an example is still current.

The lab keeps the model ID in configuration (`LLM_MODEL_ID`, `ANTHROPIC_MODEL_ID`, `OPENAI_MODEL_ID`, or `AZURE_OPENAI_DEPLOYMENT`) so application code does not depend on a hardcoded provider string.

## Setup

Run the starter tests:

```bash
cd code-samples/track-4/lab-1/starter
pytest -q
```

You will see failures for each `NotImplementedError`. Your job is to make them pass. The reference implementation lives in `code-samples/track-4/lab-1/solution/`.

## Walkthrough

### Step 1: Load provider configuration

Open `llm_wrapper.py`. The first TODO is `load_config`. Implement support for `anthropic`, `openai`, and `azure-openai`.

The important lesson is not the specific provider list. The important lesson is that provider, model ID, endpoint, and secret name belong in configuration. Application features should ask for "the approved classifier model" or "the approved drafting model," not scatter literal model strings across the codebase.

### Step 2: Read secrets without logging them

Implement `require_api_key`. It should read the environment variable named by the config and raise a clear error if missing. It should not print, log, or return the key inside any diagnostic structure.

### Step 3: Estimate tokens and cost

Implement `estimate_tokens` and `estimate_cost_usd`. The token estimator is deliberately rough: one token per four characters. Real providers expose tokenizer libraries or usage counts in responses. The quickstart lesson is that every request has a measurable cost and that cost should be visible before production.

### Step 4: Build the request payload

Implement `build_request`. Include provider, model, system prompt, user prompt, max output tokens, and temperature. Include endpoint only when configured.

This is a provider-neutral payload. A real adapter would translate it into the approved SDK or HTTP call shape for the agency's provider.

### Step 5: Log safely

Implement `safe_log_record`. The log should include provider, model ID, input tokens, output tokens, and total tokens. It should not include raw prompts, raw outputs, API keys, or resident data.

### Step 6: Retry transient failures

Implement `complete_with_retry`. It should call `require_api_key`, build the request, call the supplied transport, and retry `TransientProviderError` with simple exponential backoff.

Do not retry every exception. Authentication errors, malformed requests, policy blocks, and validation errors need a fix, not a retry loop.

## Checkpoints

1. `pytest -q` from `code-samples/track-4/lab-1/starter` reports all tests passing.
2. `load_config("azure-openai")` uses `AZURE_OPENAI_DEPLOYMENT` as the model/deployment value.
3. `safe_log_record` contains token counts but no prompt text or output text.
4. `complete_with_retry` retries a transient error once and then succeeds in the provided test.

## Lab output

A provider-neutral wrapper pattern committed to the cohort repo. The shared `code-samples/track-4/common/llm_client.py` module is the version later labs import.

## Success criteria

- Offline tests pass.
- Wrapper keeps model IDs and provider details in configuration.
- No API key, prompt, or raw output appears in the safe log record.
- Retry behavior is limited to transient provider failures.
- Developer can explain what must be checked in provider docs before using a live model.

## What this lab does NOT cover

- Prompt engineering patterns. That is Lab 4.2.
- Retrieval augmentation. That is Lab 4.3.
- Provider-specific production hardening, private networking, managed identity, or cloud landing-zone design. Those belong in Phase 3 and provider documentation.
- Production deployment, CI promotion, and release gating. Those appear later in Track 4 and Phase 6.

## Resources

- Anthropic API documentation
- OpenAI API documentation
- Azure OpenAI / Azure AI Foundry documentation
- AWS Bedrock documentation
- NIST AI RMF Govern function (responsible API use baseline)
- Agency secrets-management runbook from [Phase 3 secrets management](/phase-3-infrastructure/secrets-management/)

# civic-assistant — Deployment Handoff

**Status:** TEMPLATE. Fill in every section before handoff. Empty sections are
the most common reason platform teams reject a deploy.

## 1. Service summary

One paragraph. What the service does. Who calls it. What it costs to run per
day at expected volume.

> TODO: write the summary.

## 2. Runtime contract

| Endpoint    | Method | Request shape       | Expected p95 latency | Cost per call |
| ----------- | ------ | ------------------- | -------------------- | ------------- |
| `/classify` | POST   | `{"message": str}`  | TODO                 | TODO          |
| `/answer`   | POST   | `{"question": str}` | TODO                 | TODO          |
| `/triage`   | POST   | `{"message": str}`  | TODO                 | TODO          |
| `/health`   | GET    | n/a                 | <50 ms               | $0            |

Numbers should come from the structured log lines emitted during the
integration test pass.

## 3. Dependencies

| Dependency                     | Type           | Fallback                         |
| ------------------------------ | -------------- | -------------------------------- |
| Anthropic API                  | outbound HTTPS | TODO: configure OpenAI as a swap |
| Policy corpus (markdown files) | in-process     | bundled in image                 |
| Permits data (JSON)            | in-process     | bundled in image                 |

## 4. Secrets and configuration

| Env var                 | Required                          | Default             | Effect                                                     |
| ----------------------- | --------------------------------- | ------------------- | ---------------------------------------------------------- |
| `ANTHROPIC_API_KEY`     | yes (when LLM_PROVIDER=anthropic) | none                | Service refuses to start.                                  |
| `OPENAI_API_KEY`        | yes (when LLM_PROVIDER=openai)    | none                | Service refuses to start.                                  |
| `LLM_PROVIDER`          | no                                | `anthropic`         | Picks model SDK.                                           |
| `LLM_MODEL`             | no                                | `claude-sonnet-4-5` | Model id passed to the SDK.                                |
| `LOG_LEVEL`             | no                                | `INFO`              | Standard Python log levels.                                |
| `FEATURE_FLAGS`         | no                                | all three enabled   | Comma-separated flag list.                                 |
| `CORS_ALLOW_ORIGINS`    | no                                | empty               | Comma-separated allowlist. Empty disables CORS middleware. |
| `RETRIEVAL_SCORE_FLOOR` | no                                | `0.05`              | Below this, /answer returns the no-policy fallback.        |
| `TRIAGE_MAX_ITERATIONS` | no                                | `6`                 | Cap on agent loop iterations.                              |

## 5. Operational runbook

- **Health check:** `GET /health` returns `{"status": "ok"}`.
- **Log format:** one JSON line per request with fields: endpoint, outcome,
  latency_ms, input_tokens, output_tokens, cost_usd, request_id.
- **Top failures:**
  1. **Rate limit** (Anthropic 429). Mitigation: retry with backoff, or move
     to a higher tier. Track via `outcome=rate_limited` count per minute.
  2. **Missing API key.** Service exits at startup with a clear error. Check
     the platform secret binding.
  3. **Missing policy corpus file.** /answer returns 500. Re-deploy the image
     (the corpus is bundled).
- **Rollback:** redeploy the previous image tag. Configuration is
  backward-compatible across patch versions; major versions get a migration
  note in this section.

## 6. Known limits

- Permits data is synthetic. Do not point at real permit records without a
  privacy review.
- No authentication or rate limiting on the public endpoints. The platform
  team's edge layer is responsible for both.
- LLM-as-judge tests are gated behind `RUN_JUDGE_TESTS=1` and cost ~$1 per
  pass. They are not part of the default CI gate.
- The triage agent will stop at `TRIAGE_MAX_ITERATIONS`. Loops above that
  return `stopped_reason=max_iterations` and a generic answer.

## 7. Sign-off

- [ ] Service summary filled in
- [ ] Runtime contract numbers populated from real logs
- [ ] All required env vars documented and provisioned
- [ ] Health check responding from inside the container
- [ ] Rollback step rehearsed at least once
- [ ] Owning team named in the platform service registry

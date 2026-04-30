---
title: Observability Foundation
description: OpenTelemetry instrumentation, centralized logging, AI invocation telemetry, governed prompt/response capture, AI-specific metrics, and SLO definitions across AWS, Azure, and GCP.
sidebar:
  order: 8
---

You cannot operate, debug, or evaluate what you cannot see. Observability is the layer that turns "the AI is acting weird" into "request 4f3c spent 18 seconds in retrieval, generated 4,200 tokens, hit Bedrock at p99=2.1s, and the user marked the answer wrong." Phase 3's observability foundation should produce useful metadata by default for every AI workload, on every cloud, without each application team building it from scratch. Raw prompt and response capture is more sensitive and should be enabled only when the approved data rules, redaction, retention, and access controls support it.

The center of the strategy is **OpenTelemetry**. It is the only widely-supported, vendor-neutral standard for traces, metrics, and logs. Every cloud accepts OTLP. Every major observability backend accepts OTLP. The platform's instrumentation is OTel; where it goes is a policy decision the agency can revisit without rewriting code.

## The three signals + a fourth

For AI workloads, the standard observability triad gains a fourth signal:

| Signal  | What it captures             | AI-specific additions                                                                       |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------- |
| Traces  | Request flow across services | Spans for retrieval, prompt assembly, model call, tool calls; token counts per span         |
| Metrics | Aggregated time-series       | Tokens-per-second, cost-per-request, eval pass rate, refusal rate, content-filter trip rate |
| Logs    | Discrete event records       | Structured logs with trace IDs; approved redacted prompt/response capture for incident review |
| Evals   | Quality of model outputs     | Continuous eval scoring against the regression suite; per-version score; alert on drift     |

The fourth signal — evals — is the one teams skip and the one they regret. Build it from day one.

## OpenTelemetry instrumentation

The platform standardizes on OTel SDKs in every supported language (Python, TypeScript / Node, Go, Java). Instrumentation has three layers:

1. **Auto-instrumentation** for common libraries: HTTP clients, web frameworks (FastAPI, Express, Spring), database drivers, cloud SDK calls. Comes from the OTel auto-instrumentation packages and runs without code changes.
2. **Platform instrumentation** that the AI orchestration layer (Phase 5) adds for AI-specific spans: `retrieval`, `prompt.assemble`, `model.invoke`, `tool.call`, `eval.run`. Each span carries token counts, model identity, latency breakdown.
3. **Application instrumentation** for use-case-specific spans the team wants. Optional but encouraged.

Spans propagate trace context across service boundaries via W3C Trace Context headers. A user request, the retrieval call, the model invocation, and any downstream tool calls all carry the same trace ID, so a single search in the backend pulls up the entire transaction.

### OTel Collector

A central OpenTelemetry Collector deployment receives OTLP from workloads, applies sampling and redaction, and exports to the chosen backend(s). Run the collector as a sidecar (low scale, high fidelity) or as a deployment per environment (medium scale, with batching and aggregation). The collector's pipeline is where redaction lives — see "Prompt and response capture" below.

## Per-cloud backend options

Every cloud has its own backend, and most agencies will use it for cost reasons. The OTel-first instrumentation makes the choice flexible.

### AWS

- **CloudWatch** for metrics and logs; **AWS X-Ray** for traces.
- Or **Amazon Managed Service for Prometheus + Amazon Managed Grafana** for OSS-shape stack.
- OTel exporters: `otlp` to OpenTelemetry Collector, then to CloudWatch via the ADOT (AWS Distro for OpenTelemetry) collector.
- AI-specific: **Bedrock model invocation logging** to S3 + CloudWatch; capture token counts and latency per call.

### Azure

- **Azure Monitor / Log Analytics / Application Insights** as the integrated stack. Application Insights now natively accepts OTLP.
- **Azure Managed Grafana** as a visualization layer if Grafana is preferred.
- AI-specific: **Azure OpenAI diagnostic settings** stream request/response metadata to Log Analytics; **Content Filter** events captured by default.

### Google Cloud

- **Cloud Operations** (formerly Stackdriver): Cloud Logging, Cloud Monitoring, Cloud Trace.
- **Google Managed Prometheus** + **Managed Grafana** for OSS-shape.
- AI-specific: **Vertex AI request/response logging** with sampling; per-request prediction metadata.

### Cross-cloud / vendor-neutral

If the agency wants a single pane of glass across clouds:

- **Grafana Cloud** (free tier generous for early use) accepts OTLP from anywhere.
- **Honeycomb** is strong for trace analytics and is OTLP-native.
- **Datadog / New Relic / Dynatrace** for full-stack APM if the budget supports.
- **Self-hosted Grafana + Loki + Tempo + Mimir** if the team has operations capacity.

The trap to avoid: getting locked into a backend's proprietary SDK. OTel-first instrumentation means the backend is replaceable.

## Centralized logging

All workloads ship structured logs (JSON) to a central log sink owned by security, not the application team. The pattern:

- **Schema.** Every log carries `timestamp`, `service`, `env`, `tier`, `trace_id`, `span_id`, `user_id` (where appropriate), `level`, `message`. Use a logging library that produces this automatically (`structlog` in Python; `pino` in Node).
- **Retention.** Per [security baseline](/phase-3-infrastructure/security-baseline/) tier mapping: 30 days standard, 90 days for Tier-2, ≥1 year for Tier-3.
- **Index strategy.** Recent logs in a hot index for query, older logs in cold storage with full-text search at higher latency.
- **Access.** Application teams have read access to their service's logs in non-prod and read-only / audited access in prod. Security has read access everywhere.

## AI invocation telemetry

The most important AI-specific telemetry starts metadata-first. Capture every model invocation's operational facts:

- Model identity and version.
- Token counts (input, output, cached).
- Latency breakdown (queue, generation, post-processing).
- Tool calls invoked, status, and result classification.
- Cost in dollars (computed from token counts).
- Retrieval source IDs or document references, without raw source text unless approved.
- Safety/DLP events and policy decisions.

For Tier-1 internal productivity tools, this metadata may be enough. For Tier-2/3 use cases, the agency may also need redacted prompt/response capture to support incident review, contestation, records, and evaluation. Treat that as a governed setting, not a default for every workload.

### Prompt and response capture

When approved by the data rules and review path, capture:

- The system prompt + user prompt after upstream redaction.
- The response after output leakage checks.
- Tool-call inputs and outputs only when they do not contain prohibited data, or after redaction.

Why it matters: the difference between "the AI got it wrong" and "the AI got it wrong because retrieval returned the wrong document on this prompt at this version" is often in the prompt/response/retrieval trail.

### Redaction

The capture pipeline applies redaction before the data lands:

- PII / Confidential / Restricted spans of text are replaced with placeholder tokens.
- The DLP service (covered in [security baseline](/phase-3-infrastructure/security-baseline/)) runs upstream of prompt assembly when possible, and at the OTel collector only as a defense-in-depth control.
- Redaction is logged so an authorized investigator can follow a documented process if unredacted material is legally and operationally available.

### Storage and access

- Stored encrypted with a CMK or equivalent approved key control in the appropriate environment's log storage.
- Access limited to named roles such as AI program lead, application team lead, security incident response, records, and audit, with production access logged.
- Constituent right-to-access or records requests may include AI-generated content; design per-user retrieval when the approved use case requires it.
- Tier-3 capture, when approved, supports the contestation pathway by preserving the evidence needed to review the decision.

## AI-specific metrics

Beyond standard service metrics (RPS, latency, error rate), AI workloads track:

- **Tokens per second** (input + output, separately).
- **Cost per request** and **cost per user-session**.
- **Cache hit rate** for prompt caching, retrieval cache.
- **Eval score** against the regression suite, per deploy.
- **Refusal rate** — the fraction of prompts the model declines to answer.
- **Content filter trip rate** — how often safety filters fire and on what.
- **Tool-use rate** — fraction of requests where a tool was invoked.
- **Tool-call success rate** — when tools are invoked, do they succeed.
- **User-feedback rate** — fraction of responses where the user gave thumbs-up or thumbs-down.
- **Time-to-first-token** vs. **time-to-completion** for streaming workloads.

Build a dashboard per use case. Every Tier-2 use case should have a dashboard reviewed weekly; every Tier-3 use case should have a dashboard reviewed through the standing review path.

## Service Level Objectives (SLOs)

SLOs put numbers on what "good" means. The Phase 3 starter targets below should be calibrated by workload class, user impact, staffing, and procurement constraints:

| SLO                                        | Target                                 | Window     |
| ------------------------------------------ | -------------------------------------- | ---------- |
| Service availability                       | 99.5% (Tier-1) / 99.9% (Tier-2/3)      | 30 days    |
| End-to-end latency p95                     | <3s for chat; <15s for retrieval-heavy | 7 days     |
| Error rate (5xx + transient client errors) | <1%                                    | 7 days     |
| Eval regression                            | Score within 5% of baseline            | per deploy |
| Cost per request                           | Within 20% of budget                   | 30 days    |

Each SLO has an associated error budget, alarm thresholds, and an owner. For production Tier-2/3 services, SLO violations may pause promotion by default; resuming should require explicit approval. For small agencies and Tier-1 pilots, start with alerts and a review note, then make the gate stricter as the process matures.

## Anomaly detection

Static thresholds work for most things; some signals need anomaly detection:

- Sudden cost spikes (a runaway agent loop can produce a 100× spike in minutes).
- Refusal rate or content-filter rate jumping (could indicate prompt injection attacks or upstream model change).
- Eval score regression on a deploy that should not have changed model behavior.
- Egress traffic to unexpected destinations (ties into [security baseline](/phase-3-infrastructure/security-baseline/) controls).

Cloud-native anomaly detection (CloudWatch Anomaly Detection, Azure Monitor anomaly metrics, Cloud Monitoring forecasting) handles the basics. For more, integrate with the SIEM (Sentinel, Security Command Center, GuardDuty + custom).

## Cost attribution

Each AI request carries:

- The model called (provider and model slug from the provider's current API documentation).
- The use case it served.
- The user (where appropriate) or workload identity.
- Tokens in / out / cached.
- Computed dollar cost.

Aggregate by use case daily and weekly. Per-use-case cost is what managers and the review path need; per-token cost is for engineers tuning prompts and retrieval.

## Incident review and replay

Every Tier-2/3 incident gets a post-incident review. The observability foundation supports this with:

- Time-anchored trace lookup (find every request between T-30s and T+30s of an event).
- Replay tooling: re-run a captured prompt against the current model and current retrieval to verify the fix.
- Diff view: compare the captured response to a re-run response side-by-side.

## Common observability failures

- **Logs without trace context.** Every log line should carry `trace_id`. Without it, correlation is grep work.
- **Sampling that drops the interesting traces.** Tail sampling that keeps errors and slow requests is far better than random sampling.
- **No AI invocation telemetry.** When the model hallucinates and the user complains, the team has to reproduce the issue blind. Capture metadata from day one, and add redacted prompt/response capture when the approved data rules allow it.
- **No eval continuity.** Evals run in CI but not in prod. The first signal of model drift then comes from users.
- **Cost dashboards behind a paywall.** Engineers and managers should see cost as casually as they see latency. Free up access.
- **One backend, no portability.** Backends are fashionable; agencies last decades. Keep instrumentation OTel-first so you can change minds.

## Related

- [Identity & Access](/phase-3-infrastructure/identity-access/) — workloads' identity carried in trace and log context
- [Container Orchestration](/phase-3-infrastructure/container-orchestration/) — where the OTel collectors run
- [Security Baseline](/phase-3-infrastructure/security-baseline/) — the redaction and retention policies this page implements
- [Phase 5 — Modular Platform](/phase-5-platform/) — the orchestration layer that emits AI-specific telemetry
- [Track 4 — Developer Upskilling](/phase-2-education/track-4-developers/) — Lab 4.5 trains developers on this instrumentation

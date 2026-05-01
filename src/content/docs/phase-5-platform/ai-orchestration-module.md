---
title: AI Orchestration Module
description: Model adapters, prompt management, retrieval, evaluation, cost tracking, and guardrails for AI features.
sidebar:
  order: 9
---

The AI Orchestration module is one of the highest-leverage pieces of the platform. It is where the agency's investment in AI either compounds (new features get a consistent model path, retrieval, eval, and guardrails) or fragments (each app reinvents prompt-handling, picks a different provider, runs unevaluated, and logs sensitive data inconsistently). The pattern is the same as for the other modules — small public surface, clean ports-and-adapters seams — but the stakes are higher.

This module is what lets the agency say _yes_ to "let's add a summarization feature" in days instead of months. It is also what lets the agency say _no_ confidently to features that don't pass eval or budget gates. Both capabilities matter equally.

> **Last reviewed: April 30, 2026.** Provider model lists, SDK methods, pricing, rate limits, and government-cloud availability change quickly. Treat model IDs, provider names, and code snippets here as examples of the adapter pattern; verify current provider documentation and agency approval before deployment.

## What this module owns

- **Model adapters.** Provider-neutral access to approved foundation models, whether through direct model APIs, cloud model platforms, managed gateways, or self-hosted endpoints.
- **Prompt management.** Versioned prompts with metadata, tested separately from code.
- **Retrieval.** RAG plumbing — chunking, embedding, vector store, retrieval, reranking.
- **Tool / function calling.** Structured tool invocation with schema validation.
- **Streaming.** Server-sent events and WebSocket adapters for long-form output.
- **Evaluation.** Harness for offline eval; CI integration; gate thresholds.
- **Cost tracking.** Token counting, cost attribution per app / per user / per feature.
- **Guardrails.** Input/output scanning, PII detection, prompt injection defense.
- **Observability.** Per-call traces with metadata by default and redacted prompt/response content only where policy allows it.

## What this module does NOT own

- **Specific application prompts.** A "summarize this case file" prompt belongs to the case-management app's prompt directory, not this module. The module hosts the registry; apps write the prompts.
- **Foundation model training.** The agency is a consumer, not a trainer.
- **Domain-specific evaluation suites.** Eval harness lives here; the actual eval cases for "case-summary quality" live with the app.
- **End-user UI for AI features.** Chat UI, suggestion components, etc. are app or design-system concerns.

## Public surface

```python
# modules/ai_orchestration/src/ai_orchestration/public/client.py
from typing import Protocol, AsyncIterator
from .types import (
    LLMRequest, LLMResponse, ChatMessage, Tool, ToolCall,
    PromptRef, RetrievalRequest, RetrievalResult, EvalResult, ModelChoice
)

class AIClient(Protocol):
    async def complete(self, request: LLMRequest) -> LLMResponse:
        """Single completion. Returns full response."""

    async def stream(self, request: LLMRequest) -> AsyncIterator[str]:
        """Streamed completion. Yields tokens."""

    async def call(self, prompt_id: str, version: str | None,
                   inputs: dict, model: ModelChoice = ...) -> LLMResponse:
        """Looked-up prompt with inputs. Resolves prompt + invokes LLM."""

    async def retrieve(self, request: RetrievalRequest) -> RetrievalResult:
        """Retrieve relevant chunks given a query."""

    async def evaluate(self, prompt_id: str, version: str,
                       suite: str) -> EvalResult:
        """Run an eval suite against a prompt."""
```

The public types are intentionally thin. Apps building AI features call `ai.call("case-summary", inputs={...})` and usually do not care which approved model or provider served it; the prompt registry's metadata declares the binding.

## The vendor-neutral adapter pattern

Every LLM is reached through the same `LLMProvider` port:

```python
class LLMProvider(Protocol):
    async def complete(self, request: ProviderRequest) -> ProviderResponse: ...
    async def stream(self, request: ProviderRequest) -> AsyncIterator[ProviderEvent]: ...
    @property
    def model_name(self) -> str: ...
    @property
    def context_window(self) -> int: ...
```

Production adapters usually fall into these categories:

| Provider route | Adapter | Notes |
| --- | --- | --- |
| Direct model API | `direct_provider` | Provider-hosted model endpoint |
| Cloud model platform | `cloud_model_provider` | Cloud billing, networking, and data-plane controls |
| Model gateway / broker | `gateway_provider` | Central routing, policy, caching, and observability |
| Self-hosted endpoint | `local_provider` | Open-weight or privately hosted model for specific data/control needs |

Switching providers should be a bounded platform change, not an app-by-app rewrite. The module's request/response types translate to and from provider-specific shapes, but provider changes still require eval runs, safety review, cost review, procurement review, and sometimes prompt, schema, or tool-calling updates.

The adapter pattern is one defense against vendor lock-in. If procurement moves the agency to a different approved provider route, the platform absorbs most of the integration work in the adapter and prompt registry. If a new model becomes available, add or update an adapter and evaluate existing prompts against it before production use.

### Model IDs and provider catalogs

Providers identify models with **model IDs** or **slugs**: short strings used in API calls and deployment configuration, such as `provider-model-family-version` or a cloud deployment name. These IDs change as providers release new model versions, retire old ones, or expose the same model through different cloud platforms.

This guide intentionally avoids a fixed list of current model IDs. For implementation, use the provider's current model catalog and API reference, then record the selected model ID, version/date, region or deployment name, and fallback in the prompt registry or model-routing config. Good starting points are:

- OpenAI API model documentation: `https://platform.openai.com/docs/models`
- Azure OpenAI model documentation: `https://learn.microsoft.com/azure/ai-services/openai/concepts/models`
- AWS Bedrock model provider documentation: `https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html`
- Google Vertex AI model documentation: `https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models`
- Anthropic model documentation: `https://docs.anthropic.com/en/docs/about-claude/models`

## Choosing models

Three model tiers, mapped to use cases (per the [agency's procurement guardrails](/phase-1-governance/procurement-guardrails/)):

| Tier             | Description                                  | Use cases                                                       |
| ---------------- | -------------------------------------------- | --------------------------------------------------------------- |
| **Flagship**     | Highest-capability models in the approved catalog | Long-context reasoning; high-stakes summaries; complex tool use |
| **Mid**          | Balanced cost/quality models                 | Most production features                                        |
| **Light / fast** | Smaller or specialized low-latency models    | Classification, retrieval rerank, structured extraction         |

The prompt registry binds each prompt to a default tier; the model within the tier is configurable per-environment. Cost-sensitive paths use the lightest tier that passes eval.

## Prompt registry

Prompts are first-class artifacts — versioned, tested, deployed alongside (but not inside) application code.

```
prompts/
├── case-summary/
│   ├── prompt.yaml             # metadata, version, model, schema
│   ├── system.md               # the system prompt
│   ├── user-template.md        # the user message template (Jinja2)
│   ├── tests/
│   │   ├── golden.yaml         # input → expected-output pairs
│   │   └── eval-suite.yaml     # eval cases (more on these below)
│   └── README.md
├── case-classification/
│   ├── ...
└── case-followup-letter/
    └── ...
```

The metadata file:

```yaml
id: case-summary
description: Summarize a case file in 200 words or fewer for supervisor review.
version: 2.0.4
model: tier-mid
input_schema:
  type: object
  required: [case_id, narrative, decisions]
output_schema:
  type: string
  max_length: 1500
classification: tier-2 # informs guardrail policy
tags: [summarization, case-management]
owners: [case-platform-team]
```

When an app calls `ai.call("case-summary", inputs={...})`:

1. The registry resolves the prompt by id + version (latest if version omitted).
2. Inputs are validated against the prompt's input schema.
3. The user-template is rendered with inputs.
4. The system prompt + rendered user prompt + any tools are sent to the model.
5. The output is validated against the output schema.
6. The whole call's metadata is logged; input/output content is redacted, sampled, or omitted according to classification and audit policy.

Prompt changes go through code review like any other change. Major version bumps (incompatible schema, materially different behavior) require an eval-pass-rate floor before deployment.

### Registry fields that matter in operations

The registry is not only a developer convenience. It is the agency's operational record for what AI behavior is approved to run.

At minimum, every production prompt or model route should record:

| Field | Why it matters |
| --- | --- |
| Prompt id and version | Lets teams reproduce, audit, and roll back behavior. |
| Owner | Names who approves changes and reviews drift. |
| Risk tier and data classification | Selects guardrails, logging, retention, and approval path. |
| Provider route and model tier | Keeps model selection visible without hard-coding provider-specific IDs everywhere. |
| Current provider model ID, deployment name, region, or route | Records the actual runtime binding used in API calls or managed deployments. |
| Fallback route | Defines what happens when the preferred model is unavailable or retired. |
| Eval suite and threshold | Ties behavior change to measurable evidence. |
| Logging and retention setting | Prevents prompt/response capture from becoming an accidental records repository. |
| Last reviewed date | Makes stale prompts visible before they surprise operations. |

Small teams can maintain this as metadata files in the repository. Larger teams may expose it through the admin dashboard or an internal developer portal. Either way, a production incident review should be able to answer: which prompt, which model route, which retrieval index, which tool permissions, which eval result, and which rollback path were active at the time?

## Retrieval-augmented generation (RAG)

Most government AI features are retrieval-grounded — the LLM works against agency policy, prior cases, regulations, FAQ. The module's RAG pipeline:

```
            ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
ingest →    │  Chunker    │ →  │  Embedder    │ →  │  Vector Store │
            └─────────────┘    └──────────────┘    └──────────────┘
                                                          ↑
            ┌─────────────┐    ┌──────────────┐          │
query  →    │  Embedder   │ →  │  Retriever   │ ─────────┘
            └─────────────┘    └──────────────┘
                                       ↓
                                 ┌──────────────┐
                                 │  Reranker    │
                                 └──────────────┘
                                       ↓
                                 ┌──────────────┐
                                 │  Prompt build │
                                 └──────────────┘
```

Each stage is a port. Adapters exist for:

- **Chunker.** Document-aware (markdown, PDF, DOCX, HTML) with overlapping windows. Default chunk size: 512 tokens with 50-token overlap.
- **Embedder.** Provider or self-hosted embedding adapters. Embedding choice is configurable per index and recorded with the index metadata.
- **Vector store.** Existing Postgres with vector extension, managed search/vector services, dedicated vector databases, or self-hosted vector stores.
- **Retriever.** Top-K with metadata filters; supports hybrid search (vector + keyword).
- **Reranker.** A cross-encoder or rerank model over the top-K to improve precision.

Reasonable defaults: start with the database/search service the agency already operates when the corpus is modest; switch to a dedicated vector/search backend when corpus size, query latency, isolation, or operational ownership justifies it.

### Embedding model selection

Embedding choice has three knobs:

- **Quality** vs. corpus type — domain-tuned embeddings (e.g., legal-corpus tuned) outperform general-purpose ones on domain tasks.
- **Latency** — small embedding models run on-device (sub-10ms), cloud embeddings are ~50–200ms per call.
- **Privacy** — sending text to a cloud embedder is a data flow that needs to be classified just like generation.

Default: agency picks one embedding model per index and records it. Mixing embedding models in a single index generally does not work because the vectors live in different spaces; migration usually means re-embedding.

### Chunk metadata

Every chunk carries metadata that becomes available at retrieval:

```json
{
  "id": "doc-uuid::chunk-7",
  "vector": [0.12, ...],
  "text": "...",
  "doc_id": "doc-uuid",
  "doc_title": "Eligibility Guidelines 2026",
  "section": "5.2 Income Calculation",
  "tier": "tier-1",
  "tenant": "default",
  "ingested_at": "2026-04-15"
}
```

Filter examples:

- `tier <= user.allowed_tier`
- `tenant == user.tenant`
- `doc_id in [allowed-doc-ids]`

The retrieval port enforces metadata filters at the store layer; bypassing filters at the application layer is a bug class the module makes hard to write.

### Citations

Every RAG response includes citation metadata: which chunks were retrieved, which were used. Prompts are written to instruct the model to cite. The output post-processor extracts citations and returns them as structured data alongside the response. The UI renders them; users can click to the source document.

For RAG answers that inform decisions, citations should be treated as the default. A response that does not surface its sources is harder to trust and review in a government context. For non-RAG tasks, such as format conversion or classification, document the evidence/output requirements separately.

## Tool / function calling

Many features are not "summarize" but "do the right thing using these tools." The module supports vendor-neutral tool calling:

```python
case_lookup = Tool(
    name="lookup_case",
    description="Look up a case by ID. Returns case status, owner, and last-update.",
    parameters_schema={...},
    handler=case_service.get_case,
)

response = await ai.complete(LLMRequest(
    messages=[ChatMessage(role="user", content="What's the status of C-2026-0432?")],
    tools=[case_lookup],
))
```

The module:

- Translates the tool definitions to the provider's format; tool/function schemas differ across APIs.
- Receives the model's tool-call request.
- Validates the tool call against the schema.
- Invokes the tool handler with appropriate authz context.
- Feeds the result back into the conversation.
- Limits tool-call iterations (default 5) to prevent runaway loops.

Tool handlers run inside the agency's RBAC. A tool the user doesn't have permission to invoke is not exposed to the model in the first place — the module filters the tool list per request user.

## Streaming

Long-form output streams to clients via SSE (Server-Sent Events). The module's SSE adapter integrates with the [API framework](/phase-5-platform/api-framework-module/), exposing a typed streaming endpoint. WebSocket support is available for bidirectional flows (interactive chat).

Streaming responses still emit telemetry, including time-to-first-token and time-to-completion metrics. Full output reconstruction should happen only when classification, records policy, and privacy review allow it; otherwise log metadata, redacted excerpts, hashes, and request IDs.

## Evaluation

This is the part of the module that earns the most of its keep over time. Without eval, every prompt change is a vibe check; with eval, prompt changes have a measurable quality signal.

### Eval suite shape

```yaml
# prompts/case-summary/eval-suite.yaml
suite_id: case-summary-baseline
description: Baseline quality regression for the case summarization prompt.
cases:
  - id: clean-case-1
    inputs:
      case_id: C-2026-0001
      narrative: "..."
      decisions: [...]
    assertions:
      - type: rubric_score
        rubric: case-summary-rubric
        min_score: 4.0
      - type: contains
        value: "C-2026-0001"
      - type: token_length_max
        value: 250
  - id: edge-case-no-narrative
    inputs: { ... }
    assertions:
      - type: error_message
        contains: "narrative is empty"
```

Assertion types:

- **`contains` / `not_contains` / `matches_regex`** — string-level.
- **`token_length_min` / `token_length_max`** — output-shape constraints.
- **`json_schema`** — structured output validation.
- **`rubric_score`** — model-as-judge against a stored rubric, threshold required.
- **`embedding_similarity`** — similarity to a reference output, threshold required.
- **`tool_called`** — for tool-use prompts, asserts the right tool was selected.
- **`pii_redaction`** — output passes through PII detector; must be clean.

### Running evals

- **Locally.** A developer runs `ai-eval run case-summary --suite baseline` while iterating on a prompt.
- **CI.** The PR pipeline runs eval suites for every changed prompt. Below the threshold blocks the merge.
- **Scheduled.** Nightly runs against production prompts surface drift (e.g., when an upstream model is silently updated by the vendor).
- **Pre-deploy gate.** Major version prompt changes require a passing eval at the new version before merge.

### Eval thresholds

Each eval suite declares its threshold (e.g., "85% of cases must pass" or "average rubric score ≥ 4.0"). Thresholds are stored in the suite metadata and tightened over time as confidence grows. A regression below the threshold should block production prompt changes; lowering a threshold requires explicit justification in the PR.

### Human eval

Model-as-judge has limits. For high-stakes prompts, a small set of human-graded examples is mixed into the suite quarterly. Disagreement between human and automated judge signals that the rubric or judge needs work.

## Cost tracking

Every LLM call records:

- `prompt_id`, `prompt_version`, `model`, `provider`.
- Input tokens, output tokens, cached tokens.
- Computed cost using the provider's current pricing/configuration, kept current outside code.
- App, user, feature, request_id (for attribution).
- Latency, time-to-first-token.

Aggregations the module exposes:

- **Cost by app** — which feature is consuming the budget.
- **Cost by user** (with privacy redaction) — anomaly detection on a runaway user.
- **Cost by prompt** — which prompts are expensive; opportunities to optimize.
- **Cost by model** — distribution across tiers.

The [admin dashboard](/phase-5-platform/admin-dashboard-module/) surfaces these. Per-app monthly budgets can trigger alerts at warning and critical thresholds; hard caps can optionally hard-stop a feature after policy approval.

Provider-side or gateway-side cache hits should be tracked and credited in the cost view where the selected provider exposes that data.

## Guardrails

Two layers, selected by prompt classification and data sensitivity. Metadata, cost tracking, and eval hooks are baseline for production AI features; DLP, safety filters, prompt-injection checks, and human review gates are added by risk tier.

### Input guardrails

Run on the inputs before sending to the model:

- **Prompt injection detection** — heuristics + a small classifier looking for instructions that try to subvert the system prompt.
- **PII detection** — open-source, cloud-native, or enterprise DLP tools on inputs that are not supposed to carry PII.
- **Classification check** — if the prompt is `tier-1` and the inputs are flagged tier-3, reject before sending.

### Output guardrails

Run on the model's output before returning it:

- **PII detection / redaction** — same engines.
- **Toxicity / unsafe content** — provider moderation API, local classifier, or approved content-safety service.
- **Schema validation** — already covered by output_schema; more strict types of validation can be layered.
- **Citation check** — outputs from RAG prompts must include at least one citation; missing citations downgrade the response or trigger a regeneration.

Guardrails are themselves logged. A blocked output is a security event in the audit log.

## Observability

Every AI call emits a trace span with:

- Input metadata and, where approved, redacted inputs.
- Resolved prompt id + version.
- Model + provider.
- Tools available + tools called.
- Retrieval queries + retrieved chunk IDs.
- Output metadata and, where approved, redacted or truncated output.
- Token counts, cost, latency.
- Guardrail outcomes.

Traces flow into the standard observability backend (Phase 3). Raw prompts, retrieved text, and model outputs should not become a shadow content repository unless records, privacy, and security policy explicitly require it. The module's reference dashboards include:

- Quality score (rolling eval pass rate).
- Cost per day / week / month.
- Latency p50/p95/p99 by prompt.
- Provider error rate.
- Guardrail trigger rate.

## Composition with other modules

The orchestration module is wired into the platform stack:

- The [API framework](/phase-5-platform/api-framework-module/) exposes streaming endpoints.
- The [auth module](/phase-5-platform/auth-module/) provides the user identity that's logged with each call.
- The [RBAC module](/phase-5-platform/rbac-module/) filters tools per user.
- The [data grid module](/phase-5-platform/data-grid-module/) can include AI-powered search if pgvector is the vector store.
- The [document rendering module](/phase-5-platform/document-rendering-module/) consumes orchestration outputs to fill templates.
- The [admin dashboard](/phase-5-platform/admin-dashboard-module/) surfaces cost, eval results, prompt registry, guardrail incidents.

This is what makes the platform compound. A new AI feature should mostly be "register a prompt, wire the app-specific inputs, and run the evals"; the rest is reusable platform work.

## What "v1" vs "v2" means

The Phase 5 timeline ships AI Orchestration in two waves:

- **v1 (Month 4).** Model adapters + retrieval + prompt registry + cost tracking + basic guardrails. Enough to ship a useful feature.
- **v2 (Month 5).** Full eval harness + CI integration + advanced guardrails + multi-provider failover + per-app budgets. Enough to operate at Tier-2.

Tier-3 features should wait until v2-level evaluation, logging, DLP, approval, and incident-response paths are in place.

## Common AI orchestration failures

- **Each app with its own model client.** The point of this module is weakened. Architecture review should push apps toward the orchestration module unless a documented exception exists.
- **Prompts as inline strings in code.** Untestable, unversioned. Move them to the registry on day one.
- **No eval.** Prompt changes go to production unmeasured; quality drifts; nobody notices until a stakeholder complains. Eval should be required for production AI features, scaled to risk.
- **Cost surprise.** Long-context models used everywhere "because they're better." Cost dashboard plus tier-routing prevents the bill spike.
- **PII in prompts.** Prompt logs become a PII repository. Redact before logging; store full prompts only in the encrypted, classified path.
- **Provider-specific features in provider-agnostic prompts.** A prompt uses syntax or tool behavior from one provider while the registry says it is portable. The eval suite catches this when run against a different provider.
- **Tool authorization bypass.** A tool fetches data the calling user shouldn't see because the tool runs as the service. Tool handlers must use the calling user's authz, not the service's.

## Plain-English Guide to AI Orchestration Terms

- **LLM (Large Language Model).** A foundation model that generates text. The agency is usually a consumer of these via APIs, managed cloud platforms, gateways, or self-hosting.
- **RAG (Retrieval-Augmented Generation).** Look up relevant documents first, then ask the LLM to answer with that context. Grounds answers in agency content rather than the model's training data.
- **Embedding.** A vector representation of text. Similar texts have nearby vectors. Used for retrieval.
- **Vector store.** A database that indexes embeddings for fast nearest-neighbor search.
- **Reranker.** A second-pass model that scores retrieval results for quality, applied after the vector search.
- **Tool / function calling.** The LLM, instead of just generating text, calls a typed function the agency exposes. The function runs and the result is fed back to the LLM.
- **Prompt registry.** A versioned, tested catalog of prompts — the equivalent of source code for the AI features.
- **Eval suite.** A set of test cases for a prompt. Each case has expected properties of the output. Eval measures quality regression.
- **Model-as-judge.** Using a model to grade another model's output against a rubric. A common eval technique, but not a substitute for human review on high-stakes prompts.
- **Guardrail.** A check applied to inputs before they go to the LLM, or to outputs before they return to the user — PII detection, prompt-injection detection, content filtering.

## Related

- [Procurement Guardrails (Phase 1)](/phase-1-governance/procurement-guardrails/) — the contract terms that make this module's vendor-neutrality real
- [Risk Classification Policy (Phase 1)](/phase-1-governance/risk-classification/) — informs which prompts get which guardrails
- [Reference Implementation (Phase 4)](/phase-4-dev-stack/reference-implementation/) — first concrete consumer of this module
- [Operations Lifecycle & Resilience (Phase 3)](/phase-3-infrastructure/operations-lifecycle/) — provider change, drift review, cost controls, and decommissioning practices that use this module's records
- [Module Taxonomy](/phase-5-platform/module-taxonomy/) — the hexagonal pattern this module exemplifies most fully
- [API Framework](/phase-5-platform/api-framework-module/) — exposes streaming endpoints over the orchestration module

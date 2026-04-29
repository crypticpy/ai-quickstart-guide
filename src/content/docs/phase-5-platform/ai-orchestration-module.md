---
title: AI Orchestration Module
description: LLM adapters, prompt management, retrieval, evaluation, cost tracking, and guardrails — the heart of the platform.
sidebar:
  order: 9
---

The AI Orchestration module is the single most consequential piece of the platform. It is where the agency's investment in AI either compounds (every new feature gets the right model, retrieval, eval, and guardrails by default) or fragments (each app reinvents prompt-handling, picks a different vendor, runs unevaluated, leaks PII to whatever endpoint it likes). The pattern is the same as for the other modules — small public surface, clean ports-and-adapters seams — but the stakes are higher.

This module is what lets the agency say _yes_ to "let's add a summarization feature" in days instead of months. It is also what lets the agency say _no_ confidently to features that don't pass eval or budget gates. Both capabilities matter equally.

## What this module owns

- **LLM adapters.** Vendor-neutral access to foundation models (Anthropic Claude, OpenAI GPT, Azure OpenAI, AWS Bedrock, GCP Vertex AI, on-prem Llama).
- **Prompt management.** Versioned prompts with metadata, tested separately from code.
- **Retrieval.** RAG plumbing — chunking, embedding, vector store, retrieval, reranking.
- **Tool / function calling.** Structured tool invocation with schema validation.
- **Streaming.** Server-sent events and WebSocket adapters for long-form output.
- **Evaluation.** Harness for offline eval; CI integration; gate thresholds.
- **Cost tracking.** Token counting, cost attribution per app / per user / per feature.
- **Guardrails.** Input/output scanning, PII detection, prompt injection defense.
- **Observability.** Per-call traces with prompt + response + metadata.

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

The public types are intentionally thin. Apps building AI features call `ai.call("case-summary", inputs={...})` and don't care which model or vendor served it; the prompt registry's metadata declares the binding.

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

Production adapters:

| Provider                  | Adapter                      | Notes                                        |
| ------------------------- | ---------------------------- | -------------------------------------------- |
| Anthropic API             | `anthropic_provider`         | Claude Opus / Sonnet / Haiku                 |
| Anthropic via AWS Bedrock | `bedrock_anthropic_provider` | Same Claude family, AWS billing & data plane |
| Anthropic via GCP Vertex  | `vertex_anthropic_provider`  | Same, GCP                                    |
| OpenAI API                | `openai_provider`            | GPT family direct                            |
| Azure OpenAI              | `azure_openai_provider`      | OpenAI models with Azure data residency      |
| Bedrock (other)           | `bedrock_provider`           | Cohere, Mistral, Llama via Bedrock           |
| Vertex AI (other)         | `vertex_provider`            | Google Gemini family                         |
| On-prem (vLLM, Ollama)    | `local_provider`             | Self-hosted models for sensitive workloads   |

Switching providers is a config change; the prompts and the application logic don't change. The module's request/response types are a superset that translates to and from the vendor-specific shapes.

The adapter pattern is **the** primary defense against vendor lock-in. If procurement moves the agency from Anthropic to Bedrock for billing reasons, the platform absorbs the change in one config file. If a new model lands and the agency wants to test it, that's an adapter; existing prompts can be evaluated on it without code changes elsewhere.

## Choosing models

Three model tiers, mapped to use cases (per the [agency's procurement guardrails](/phase-1-governance/procurement-guardrails/)):

| Tier             | Examples                                     | Use cases                                                       |
| ---------------- | -------------------------------------------- | --------------------------------------------------------------- |
| **Flagship**     | Claude Opus, GPT-5, Gemini Ultra-class       | Long-context reasoning; high-stakes summaries; complex tool use |
| **Mid**          | Claude Sonnet, GPT-class mid, Gemini Flash   | Most production features                                        |
| **Light / fast** | Claude Haiku, small open-weight, Gemini Nano | Classification, retrieval rerank, structured extraction         |

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
6. The whole call (with redacted inputs and full metadata) is logged.

Prompt changes go through code review like any other change. Major version bumps (incompatible schema, materially different behavior) require an eval-pass-rate floor before deployment.

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
- **Embedder.** Vendor adapters (OpenAI text-embedding-3, Cohere Embed, Voyage, Vertex, on-prem). Embedding choice is configurable per index.
- **Vector store.** pgvector (default), Pinecone, Weaviate, Azure AI Search, AWS OpenSearch, Vertex Matching Engine.
- **Retriever.** Top-K with metadata filters; supports hybrid search (vector + keyword).
- **Reranker.** Cross-encoder reranker (Cohere Rerank, BGE) over the top-K to improve precision.

Reasonable defaults: pgvector on the existing Postgres for ≤ 1M chunks; switch to dedicated vector DB above that, or earlier if tenant isolation requires it.

### Embedding model selection

Embedding choice has three knobs:

- **Quality** vs. corpus type — domain-tuned embeddings (e.g., legal-corpus tuned) outperform general-purpose ones on domain tasks.
- **Latency** — small embedding models run on-device (sub-10ms), cloud embeddings are ~50–200ms per call.
- **Privacy** — sending text to a cloud embedder is a data flow that needs to be classified just like generation.

Default: agency picks one per index; mixing embedding models in a single index doesn't work (different vector spaces).

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

Citations are not optional. A response that doesn't surface its sources is opaque and untrustworthy in a government context.

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

- Translates the tool definitions to the vendor's format (Anthropic, OpenAI, Vertex use slightly different schemas).
- Receives the model's tool-call request.
- Validates the tool call against the schema.
- Invokes the tool handler with appropriate authz context.
- Feeds the result back into the conversation.
- Limits tool-call iterations (default 5) to prevent runaway loops.

Tool handlers run inside the agency's RBAC. A tool the user doesn't have permission to invoke is not exposed to the model in the first place — the module filters the tool list per request user.

## Streaming

Long-form output streams to clients via SSE (Server-Sent Events). The module's SSE adapter integrates with the [API framework](/phase-5-platform/api-framework-module/), exposing a typed streaming endpoint. WebSocket support is available for bidirectional flows (interactive chat).

Streaming responses are still fully logged (the complete output is reconstructed for the audit record); telemetry includes time-to-first-token and time-to-completion metrics.

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
- **`rubric_score`** — LLM-as-judge against a stored rubric, threshold required.
- **`embedding_similarity`** — cosine similarity to a reference output, threshold required.
- **`tool_called`** — for tool-use prompts, asserts the right tool was selected.
- **`pii_redaction`** — output passes through PII detector; must be clean.

### Running evals

- **Locally.** A developer runs `ai-eval run case-summary --suite baseline` while iterating on a prompt.
- **CI.** The PR pipeline runs eval suites for every changed prompt. Below the threshold blocks the merge.
- **Scheduled.** Nightly runs against production prompts surface drift (e.g., when an upstream model is silently updated by the vendor).
- **Pre-deploy gate.** Major version prompt changes require a passing eval at the new version before merge.

### Eval thresholds

Each eval suite declares its threshold (e.g., "85% of cases must pass" or "average rubric score ≥ 4.0"). Thresholds are stored in the suite metadata and ratcheted upward over time — a regression that drops below the threshold blocks the change. Lowering a threshold requires explicit justification in the PR.

### Human eval

LLM-as-judge has limits. For high-stakes prompts, a small set of human-graded examples is mixed into the suite quarterly. Disagreement between human and LLM-judge signals that the rubric or judge needs work.

## Cost tracking

Every LLM call records:

- `prompt_id`, `prompt_version`, `model`, `provider`.
- Input tokens, output tokens, cached tokens.
- Computed cost (per provider's published pricing, kept current in config).
- App, user, feature, request_id (for attribution).
- Latency, time-to-first-token.

Aggregations the module exposes:

- **Cost by app** — which feature is consuming the budget.
- **Cost by user** (with privacy redaction) — anomaly detection on a runaway user.
- **Cost by prompt** — which prompts are expensive; opportunities to optimize.
- **Cost by model** — distribution across tiers.

The [admin dashboard](/phase-5-platform/admin-dashboard-module/) surfaces these. Per-app monthly budgets trigger alerts at 70% / 90%; hard caps optionally hard-stop a feature.

Cache hits (Anthropic prompt caching, OpenAI cached input pricing) are tracked and credited in the cost view — the savings should be visible.

## Guardrails

Two layers, both off by default unless the prompt's classification triggers them.

### Input guardrails

Run on the inputs before sending to the model:

- **Prompt injection detection** — heuristics + a small classifier looking for instructions that try to subvert the system prompt.
- **PII detection** — Presidio / cloud-native (AWS Comprehend, Azure Language, GCP DLP) on inputs that aren't supposed to carry PII.
- **Classification check** — if the prompt is `tier-1` and the inputs are flagged tier-3, reject before sending.

### Output guardrails

Run on the model's output before returning it:

- **PII detection / redaction** — same engines.
- **Toxicity / unsafe content** — vendor moderation API or a small local classifier.
- **Schema validation** — already covered by output_schema; more strict types of validation can be layered.
- **Citation check** — outputs from RAG prompts must include at least one citation; missing citations downgrade the response or trigger a regeneration.

Guardrails are themselves logged. A blocked output is a security event in the audit log.

## Observability

Every AI call emits a rich trace span with:

- Inputs (with PII redacted per classification).
- Resolved prompt id + version.
- Model + provider.
- Tools available + tools called.
- Retrieval queries + retrieved chunk IDs.
- Output (full or truncated per policy).
- Token counts, cost, latency.
- Guardrail outcomes.

Traces flow into the standard observability backend (Phase 3). The module's reference dashboards include:

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

This is what makes the platform compound. A new AI feature is "register a prompt + write 50 lines of glue code in an existing app"; the rest is already there.

## What "v1" vs "v2" means

The Phase 5 timeline ships AI Orchestration in two waves:

- **v1 (Month 4).** LLM adapters + retrieval + prompt registry + cost tracking + basic guardrails. Enough to ship a useful feature.
- **v2 (Month 5).** Full eval harness + CI integration + advanced guardrails + multi-provider failover + per-app budgets. Enough to operate at Tier-2.

Tier-3 features wait until v2 lands.

## Common AI orchestration failures

- **Each app with its own LLM client.** The whole point of this module is gone. The platform's architecture review must reject any app that imports an LLM SDK directly.
- **Prompts as inline strings in code.** Untestable, unversioned. Move them to the registry on day one.
- **No eval.** Prompt changes go to production unmeasured; quality drifts; nobody notices until a stakeholder complains. Eval is not optional for production prompts.
- **Cost surprise.** Long-context models used everywhere "because they're better." Cost dashboard plus tier-routing prevents the bill spike.
- **PII in prompts.** Prompt logs become a PII repository. Redact before logging; store full prompts only in the encrypted, classified path.
- **Vendor-specific features in prompts.** Anthropic-specific XML tags in a prompt that the registry says is provider-agnostic. The eval suite catches this when run against a different provider.
- **Tool authorization bypass.** A tool fetches data the calling user shouldn't see because the tool runs as the service. Tool handlers must use the calling user's authz, not the service's.

## Plain-English Guide to AI Orchestration Terms

- **LLM (Large Language Model).** A foundation model that generates text — Claude, GPT, Gemini, Llama. The agency is a consumer of these via APIs or self-hosting.
- **RAG (Retrieval-Augmented Generation).** Look up relevant documents first, then ask the LLM to answer with that context. Grounds answers in agency content rather than the model's training data.
- **Embedding.** A vector representation of text. Similar texts have nearby vectors. Used for retrieval.
- **Vector store.** A database that indexes embeddings for fast nearest-neighbor search.
- **Reranker.** A second-pass model that scores retrieval results for quality, applied after the vector search.
- **Tool / function calling.** The LLM, instead of just generating text, calls a typed function the agency exposes. The function runs and the result is fed back to the LLM.
- **Prompt registry.** A versioned, tested catalog of prompts — the equivalent of source code for the AI features.
- **Eval suite.** A set of test cases for a prompt. Each case has expected properties of the output. Eval measures quality regression.
- **LLM-as-judge.** Using a (usually larger / better) LLM to grade another LLM's output against a rubric. A common eval technique.
- **Guardrail.** A check applied to inputs before they go to the LLM, or to outputs before they return to the user — PII detection, prompt-injection detection, content filtering.

## Related

- [Procurement Guardrails (Phase 1)](/phase-1-governance/procurement-guardrails/) — the contract terms that make this module's vendor-neutrality real
- [Risk Classification Policy (Phase 1)](/phase-1-governance/risk-classification-policy/) — informs which prompts get which guardrails
- [Reference Implementation (Phase 4)](/phase-4-dev-stack/reference-implementation/) — first concrete consumer of this module
- [Module Taxonomy](/phase-5-platform/module-taxonomy/) — the hexagonal pattern this module exemplifies most fully
- [API Framework](/phase-5-platform/api-framework-module/) — exposes streaming endpoints over the orchestration module

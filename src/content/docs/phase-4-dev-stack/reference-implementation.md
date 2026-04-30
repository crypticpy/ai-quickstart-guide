---
title: Reference Implementation Walkthrough
description: An annotated reference application — Python / FastAPI / React — that exercises retrieval, prompt assembly, evals, and observability against the Phase 3 substrate.
sidebar:
  order: 3
---

The reference implementation is a small, complete, agency-shaped AI application. It is not a demo. It is the artifact every Track 4 lab references, every coding standard is checked against, and every new agency project clones from. The point is to put a working example of every Phase 4 standard in one place so developers do not have to discover them through code review feedback.

This page walks through the reference application's architecture, the choices that were made and why, and the seams where agencies adapt it to their own work.

## The application: a constituent inquiry assistant

The reference is a small internal tool that lets an agency staff member ask a natural-language question about constituent policy ("What are the SNAP eligibility cutoffs in this state?") and receive an answer grounded in the agency's policy documents. It is intentionally low-stakes (Tier-1: internal users only, decision-supporting not decision-making) so it can ship without elaborate governance overhead and still exercise every layer of the platform.

It does five things, and each thing exercises a layer:

1. Authenticates the user via SSO ([identity & access](/phase-3-infrastructure/identity-access/)).
2. Receives a natural-language query through a small React UI.
3. Retrieves relevant chunks from a vector store of agency policy documents.
4. Calls a foundation model with a structured prompt that grounds the answer in retrieved chunks, and returns the answer with citations.
5. Captures AI invocation metadata, retrieval references, and user feedback to the observability backend; captures redacted prompt/response artifacts only when approved by the use case's data rules.

## Stack used

The reference uses the default stack from [stack selection](/phase-4-dev-stack/stack-selection/):

- **Python** on a currently supported version + **FastAPI** for the orchestration service.
- **TypeScript** + a currently supported **React** release + **Vite** + **TanStack Query** for the frontend.
- **PostgreSQL** on a currently supported major version with the **pgvector** extension as the vector store when the agency already operates Postgres (one fewer system to operate vs. a dedicated vector DB).
- **A currently approved foundation model** configured by provider model ID / slug (any vendor with a first-party or compatible SDK can fit the adapter pattern below).
- **OpenTelemetry** instrumentation throughout; OTLP exporter to whichever backend Phase 3 wired in.

Use currently supported runtime, framework, database, and extension versions from official project documentation at implementation time. Track extension security advisories, especially for vector-search components such as pgvector. Every other Phase 4 stack should produce an equivalent reference application. The architecture is the lesson; the language is interchangeable.

## Repository layout

```
inquiry-assistant/
├── README.md
├── ADRs/
│   ├── 0001-stack.md
│   ├── 0002-vector-store.md
│   └── 0003-model-adapter.md
├── api/                       # FastAPI service
│   ├── pyproject.toml
│   ├── src/
│   │   └── inquiry_api/
│   │       ├── main.py        # FastAPI app, OTel setup, route registration
│   │       ├── auth.py        # OIDC / JWT validation
│   │       ├── routes/
│   │       │   └── inquiry.py # POST /inquiry endpoint
│   │       ├── orchestration/
│   │       │   ├── retrieve.py
│   │       │   ├── prompt.py
│   │       │   ├── invoke.py
│   │       │   └── adapter.py # LLM provider abstraction
│   │       ├── eval/
│   │       │   ├── cases.jsonl
│   │       │   └── runner.py
│   │       └── telemetry.py
│   ├── tests/
│   │   ├── unit/
│   │   ├── contract/
│   │   ├── integration/
│   │   └── eval/
│   └── Dockerfile
├── web/                       # React frontend
│   ├── package.json
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/inquiry.ts     # generated from OpenAPI spec
│   │   └── components/
│   ├── tests/
│   └── Dockerfile
├── infra/                     # IaC for staging/prod (Terraform/Bicep)
├── ops/
│   ├── slos.yaml
│   └── dashboards/
└── .github/
    └── workflows/
        ├── ci.yml             # lint, test, build, sign, eval
        └── deploy.yml
```

## Architecture

### Layered orchestration

The orchestration code is split into four named functions, in this order:

```
request → retrieve → prompt.assemble → model.invoke → response
                                            ↓
                                      observability
```

Each function is independently testable, and the seam between them is where evals attach. Mixing them up is the most common reason an AI feature is hard to debug.

```python
# api/src/inquiry_api/routes/inquiry.py
@router.post("/inquiry", response_model=InquiryResponse)
async def post_inquiry(
    payload: InquiryRequest,
    user: AuthenticatedUser = Depends(current_user),
    llm: LLMAdapter = Depends(get_llm_adapter),
    store: VectorStore = Depends(get_vector_store),
) -> InquiryResponse:
    with tracer.start_as_current_span("inquiry") as span:
        span.set_attribute("user.id", user.id)
        chunks = await retrieve(store, payload.query, user.scopes)
        messages = build_prompt(payload.query, chunks)
        result = await llm.invoke(messages, user_id=user.id)
        capture_ai_telemetry(payload, chunks, messages, result, user)
        return InquiryResponse(answer=result.text, citations=cite(chunks))
```

The pattern: each step is a pure-ish function with explicit inputs and outputs. The route reads top-to-bottom. Telemetry, auth, and DI are out of the way.

### LLM adapter (model independence)

The model call goes through an adapter, never to the vendor SDK directly:

```python
# api/src/inquiry_api/orchestration/adapter.py
class LLMAdapter(Protocol):
    async def invoke(
        self, messages: list[Message], *, user_id: str
    ) -> LLMResult: ...

class AnthropicAdapter:
    def __init__(self, client: anthropic.AsyncAnthropic, model: str): ...
    async def invoke(self, messages, *, user_id) -> LLMResult: ...

class AzureOpenAIAdapter:
    ...

class BedrockAdapter:
    ...
```

The application code depends on the protocol, not on a specific vendor. A model ID is the provider-maintained slug used in API calls or tool configuration, such as `<provider-model-id>`. Changing the configured model should be a bounded change, but not a blind one: provider behavior differs in streaming, tool use, structured outputs, safety filters, context windows, rate limits, and authentication. The adapter keeps the change contained; the agency still re-runs evals and reviews provider-specific behavior before promotion.

### Retrieval (RAG) with citations

```python
# api/src/inquiry_api/orchestration/retrieve.py
async def retrieve(
    store: VectorStore, query: str, scopes: list[str], k: int = 6
) -> list[Chunk]:
    embedding = await embed(query)
    chunks = await store.search(
        embedding,
        k=k,
        filter={"scopes": {"$intersects": scopes}},
    )
    return chunks
```

Two things to notice:

1. The `scopes` filter constrains retrieval to documents the user is authorized to see. Retrieval that ignores authorization is a Tier-3 incident waiting to happen.
2. The function returns `Chunk` objects, each with `id`, `text`, `source`, `score`. The `cite(chunks)` helper later turns them into citations the UI renders.

### Prompt assembly (structured)

```python
# api/src/inquiry_api/orchestration/prompt.py
SYSTEM_PROMPT = """You are an assistant for [AGENCY] staff.
Answer using only the provided context. If the answer is not in the context,
say so. Always cite chunk IDs in square brackets like [c-12]."""

def build_prompt(query: str, chunks: list[Chunk]) -> list[Message]:
    context = "\n\n".join(f"[{c.id}] {c.text}" for c in chunks)
    return [
        Message(role="system", content=SYSTEM_PROMPT),
        Message(role="user", content=f"Context:\n{context}\n\nQuestion: {query}"),
    ]
```

The system prompt is short and constrained: answer from context only, refuse otherwise, cite. The eval suite tests this — a prompt that drifts on these rules fails the suite and blocks merge.

### Eval suite

```python
# api/src/inquiry_api/eval/runner.py
async def run_eval_suite(adapter: LLMAdapter, store: VectorStore) -> EvalReport:
    cases = load_cases("cases.jsonl")
    results = []
    for case in cases:
        chunks = await retrieve(store, case.query, scopes=case.scopes)
        messages = build_prompt(case.query, chunks)
        result = await adapter.invoke(messages, user_id="eval")
        results.append(score_case(case, result))
    return EvalReport(results=results)
```

The cases file is small (start with 30; grow over time) and includes:

- Cases the model should answer correctly (with the expected citation IDs).
- Cases where the answer is genuinely not in the corpus (the model should refuse).
- Cases that probe specific failure modes (ambiguous queries, scope-leakage attempts, prompt-injection attempts).

The runner is invoked in CI as a gate once the eval suite is calibrated. A drop of more than the agency's starter threshold, often around 5%, blocks merge for production-bound AI changes.

## Observability instrumentation

Every span carries the right attributes by default:

```python
# api/src/inquiry_api/orchestration/invoke.py
async def invoke(adapter: LLMAdapter, messages: list[Message], *, user_id: str):
    with tracer.start_as_current_span("model.invoke") as span:
        span.set_attribute("ai.model", adapter.model)
        span.set_attribute("ai.user_id", user_id)
        result = await adapter.invoke(messages, user_id=user_id)
        span.set_attribute("ai.tokens.input", result.tokens_in)
        span.set_attribute("ai.tokens.output", result.tokens_out)
        span.set_attribute("ai.cost.dollars", compute_cost(adapter.model, result))
        return result
```

The platform's metrics dashboard then groups by service, by route, by user, by model. Phase 3's [observability foundation](/phase-3-infrastructure/observability/) provides the receiving end.

## Testing pyramid (in this repo)

The reference includes representative tests at every layer of the pyramid:

- **Unit tests** for `prompt.py`, `retrieve.py`, `adapter.py` (mocking the LLM client).
- **Contract tests** between `web/` and `api/` using a Pact verifier.
- **Integration tests** running the FastAPI app + Postgres + a local mock LLM that returns deterministic responses.
- **Eval tests** running against the real model in staging only.
- **End-to-end tests** running the React app + API + LLM against canned scenarios via Playwright.

[Testing strategy](/phase-4-dev-stack/testing-strategy/) explains the rationale for each layer.

## Frontend

The React frontend is small but representative:

- Vite for build (no Webpack lock-in).
- TanStack Query for server state; Zustand for the small amount of UI state.
- Forms via React Hook Form + Zod schemas generated from the OpenAPI spec.
- A11y baseline (semantic HTML, focus management, contrast checks in CI).
- The API client is generated from the API's OpenAPI document — no hand-written request types.

The frontend is intentionally not opinionated about styling — different agencies have design systems they must use, and the reference does not pick one.

## OpenAPI specification

`api/openapi.yaml` is the source of truth for the API surface:

- Generated from FastAPI on every build.
- Validated in CI; the generated spec is committed.
- Used to generate the frontend client and contract tests.
- Published to the agency's API registry on tag.

[API-first design](/phase-4-dev-stack/api-first-design/) covers the broader pattern.

## What this reference is _not_

Be honest about scope. The reference is not:

- Production-grade for a large user base. Auth is fine, scaling is fine, but a production deploy needs Phase 3 + Phase 5 modules.
- A full platform. The platform comes in Phase 5.
- Specific to one agency's data or workflow. It is intentionally generic so each agency can fork and adapt.

## How to use the reference

Three modes:

1. **Read it.** Track 4 Lab 4.1 reads through the orchestration code as the lecture component.
2. **Run it.** Track 4 Lab 4.2 onwards runs the reference locally and modifies it.
3. **Fork it.** New projects fork the reference repo as their starting point. The first commit on the fork is removing the parts that don't apply.

## Adapting to a different stack

If the agency picked .NET, Java, Node, or Go in [stack selection](/phase-4-dev-stack/stack-selection/), the reference for that stack should mirror the structure above:

- Same four orchestration steps (retrieve, prompt, invoke, capture).
- Same adapter pattern for the LLM.
- Same eval suite shape.
- Same observability conventions.

Build the equivalent reference repo before the first Track 4 cohort where possible. If staffing or procurement prevents that, use the guide's reference as a teaching sample and add a short translation note for the agency's chosen stack before the first pilot begins.

## Common reference-implementation pitfalls

- **Reference repo grows into a real platform.** Resist. The reference exists to teach. Phase 5 produces the platform separately.
- **Reference is not maintained.** A reference using a model API that is two years old, or a framework version that is unsupported, is worse than no reference. Pin a maintainer; update on each model major version.
- **Reference uses agency production data.** It should not. Synthetic or sanitized data only. The approved review path approves the synthetic set once.
- **Reference skips evals.** If the reference does not include an eval suite, no team built from it will. Include it.

## Related

- [Stack Selection](/phase-4-dev-stack/stack-selection/) — the choice this reference is built against
- [Coding Standards](/phase-4-dev-stack/coding-standards/) — what this reference exemplifies
- [Testing Strategy](/phase-4-dev-stack/testing-strategy/) — the test pyramid this reference exercises
- [Track 4 — Developer Upskilling](/phase-2-education/track-4-developers/) — the labs that use this reference

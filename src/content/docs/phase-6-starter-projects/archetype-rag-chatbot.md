---
title: Archetype — RAG Chatbot
description: A staff- or public-facing chatbot that answers questions over agency policies, FAQ, regulations, and procedures — the most common and most-traveled starter path.
sidebar:
  order: 3
---

A retrieval-augmented chatbot is a common starter project for a government agency, and for good reason. The shape is well understood, the platform exercise is meaningful, the user value is concrete ("I asked a question and got a useful answer"), and the failure modes are mostly recoverable when the chatbot is allowed to refuse.

This page describes a starter-grade RAG chatbot — narrow audience, narrow corpus, strong refusal behavior, robust eval — built on the platform modules from [Phase 5](/phase-5-platform/). It is _not_ "the agency's chatbot for everything." It is a focused tool for a named audience with a known set of questions.

## What the project ships

A web application where a defined audience types a question and receives:

- **A grounded answer** drawn only from the indexed agency corpus.
- **Citations** to the source documents (clickable, verifiable).
- **A confidence signal** (e.g., the system says "I don't have a confident answer" rather than guessing).
- **A feedback widget** so users can mark answers as helpful, wrong, or unclear.
- **A history of their own conversations** (per user).

Plus the operator-facing surface:

- **Admin dashboard** for monitoring conversations, costs, evals, and feedback.
- **Corpus management** for ingesting and updating documents.
- **A canned-response override** for high-volume questions that need a specific answer.

## Two starter audiences

The agency picks one. The two audiences exercise the same modules but have meaningfully different governance and risk profiles.

### Internal-staff chatbot (recommended starter)

The audience is agency staff in a specific program area asking questions like:

- "What's our policy on out-of-state travel reimbursement?"
- "What's the deadline for Q3 grant compliance reports?"
- "Where do I find the Form 47 template?"
- "What's the difference between a category B and category C inspection?"

Internal-staff chatbots are the safer starter. The audience is bounded; they can be trained and surveyed; they understand they're using a new tool; mistakes are recoverable through normal channels. Tier-1 most of the time.

### Public-facing chatbot (later, not first)

The audience is the public asking questions like:

- "How do I apply for unemployment benefits?"
- "What documents do I need for a building permit?"
- "When is the next hearing for my case?"

Public-facing chatbots can be done — agencies have shipped them — but they are not a good _starter_. The risk profile is materially higher (anybody can ask anything; harmful or sensitive questions land; wrong answers reach citizens; legal review is heavier). Save public-facing for the second project, when the team has a launch under its belt.

## Modules exercised

The RAG chatbot is the platform's "hello world" — it exercises most of the seven modules without straining any of them.

| Module                                                         | How                                                               |
| -------------------------------------------------------------- | ----------------------------------------------------------------- |
| [Auth](/phase-5-platform/auth-module/)                         | SSO sign-in for staff users                                       |
| [RBAC](/phase-5-platform/rbac-module/)                         | Per-program-area access; admin vs. user; corpus-scope permissions |
| [API Framework](/phase-5-platform/api-framework-module/)       | The streaming chat endpoint; rate-limited; Problem Details errors |
| [AI Orchestration](/phase-5-platform/ai-orchestration-module/) | Prompt registry, retrieval, eval, cost — the heart of the project |
| [Admin Dashboard](/phase-5-platform/admin-dashboard-module/)   | Conversation monitoring, eval results, feedback inbox             |
| [Data Grid](/phase-5-platform/data-grid-module/)               | Lists of conversations, feedback, corpus documents                |

The [document rendering module](/phase-5-platform/document-rendering-module/) is not used by this archetype — it's the one module the starter doesn't exercise meaningfully. That's fine; the second project picks it up.

## Architecture sketch

```
                 Browser
                    │
        ┌───────────▼──────────┐
        │     Frontend         │  React app, chat UI, citation panel
        └───────────┬──────────┘
                    │
                    │  HTTP/SSE (streaming)
                    │
        ┌───────────▼──────────┐
        │    API Framework     │  Auth, RBAC, rate limit, audit
        └───────────┬──────────┘
                    │
        ┌───────────▼──────────┐
        │   AI Orchestration   │  Prompt registry → retrieve → invoke → guardrail
        └───┬─────────────┬────┘
            │             │
   ┌────────▼───┐    ┌────▼────┐
   │   Vector   │    │   LLM   │
   │   Store    │    │ Provider│
   └────────────┘    └─────────┘
```

The streaming token loop:

1. User submits a question.
2. API framework authenticates + authorizes; rate-limits; opens an SSE response.
3. Orchestration looks up the prompt by ID; validates inputs.
4. Retrieval module embeds the question, fetches top-K chunks (filtered by user's allowed scopes), reranks.
5. Orchestration constructs the prompt with retrieved context + system prompt + conversation history.
6. The selected model generates streamed response tokens.
7. Output guardrail watches for PII leaks, ungrounded claims; can downgrade or refuse.
8. Citation post-processor extracts which chunks were used; emits with the response.
9. Audit log captures required metadata and any approved redacted conversation content per classification and records policy.

## Corpus

The corpus is the project's most important asset. A 100-document corpus carefully curated outperforms a 10,000-document corpus dumped in.

### Source selection

For an internal-staff chatbot, candidate sources are:

- Policy and procedure manuals.
- Onboarding documents.
- The agency's intranet FAQ.
- Standard operating procedure (SOP) library.
- Specific regulations the staff routinely apply.

What to exclude:

- Anything tier-3 (PII-heavy, attorney-client, personnel files). The starter is not the right place for tier-3.
- Outdated documents. If two policies contradict, the chatbot will surface the contradiction; staff lose trust.
- Documents in formats the platform can't extract reliably (scanned image PDFs, dense Excel, custom XML).

### Curation discipline

The corpus owner — usually the program area's policy team — does three things before ingestion:

1. **Source-of-truth labeling.** Each document is labeled with its authoritative status. "This is the current policy as of 2026-04-01." The chatbot can show the date.
2. **Conflict resolution.** When two documents disagree, the corpus owner decides which one is authoritative. The other is removed or marked superseded.
3. **Sensitive-content review.** PII, security-sensitive details, and information that's only meant for restricted audiences is redacted before ingestion.

Curation is the part of the project that's most likely to be skipped by a team eager to ship. Don't skip it. A clean corpus is the difference between a chatbot users trust and one they don't.

### Ingestion

The platform's [AI orchestration module](/phase-5-platform/ai-orchestration-module/) provides the ingestion pipeline:

- Document parsing (markdown, PDF, DOCX).
- Chunking with overlap.
- Embedding.
- Vector store insertion with metadata (source, section, classification, ingested_at).
- Re-ingestion when source documents change.

Ingestion runs as a background job. For many starters, the corpus is small enough that an existing database/search service with vector support is sufficient; use a dedicated vector/search service when corpus size, latency, isolation, or operations needs justify it.

### Refresh cadence

Documents change. The corpus needs to know:

- **Manual ingestion** for the starter — corpus owner uploads; system ingests.
- **Re-ingestion on change** — when a source document is updated, the chunks for that document are replaced.
- **Audit log** — every ingest / re-ingest / delete is logged with who and why.
- **Stale-content alerts** — documents older than a configurable threshold (e.g., 18 months for fast-moving policy; 5 years for stable regulation) are flagged for review.

A starter chatbot's corpus is small enough that the corpus owner can review it monthly. Plan for that cadence.

## The prompt

A starter-grade RAG chatbot prompt has three parts: system instructions, retrieved context, and the user's message.

### System prompt (illustrative)

```
You are an assistant for staff at <Agency>. You answer questions
about <program area> policies, procedures, and FAQ.

Rules:
- Only use information from the documents below to answer.
- If the documents do not answer the question, say "I don't have
  a confident answer in the current corpus" — do not guess.
- Cite the source documents you used. Use the citation format
  [doc_id:section] inline with your answer.
- Do not give legal advice. Do not give personal advice. Do not
  speculate about cases or individuals.
- Keep answers concise. If the user asks for detail, expand.
- If the question is outside the scope of <program area>, say
  so and redirect to where the user can get help.

User context:
- The user is staff in <user.team>.
- They are logged in as <user.role>.

Documents (top retrievals):
[doc_id:section] <chunk content>
[doc_id:section] <chunk content>
...
```

The system prompt is in the [prompt registry](/phase-5-platform/ai-orchestration-module/), versioned, and tested against an eval suite before deploy.

### Refusal behavior

The single most important behavior of a starter chatbot is _confident refusal_. The prompt instructs the model to refuse rather than guess. The eval suite has explicit "should refuse" cases — questions that the corpus doesn't answer; the system passes the case if it refuses, fails if it confabulates.

Refusal protects the agency more than almost any other single behavior. A chatbot that refuses out-of-scope questions is more useful than one that answers everything but is sometimes wrong.

## Eval suite

A starter's eval suite has at least three groups of cases:

| Group             | Number | Tests                                                          |
| ----------------- | ------ | -------------------------------------------------------------- |
| **Golden Q&A**    | 30–60  | Common questions with known correct answers in the corpus      |
| **Should refuse** | 15–30  | Questions outside the corpus or sensitive; system must refuse  |
| **Adversarial**   | 10–20  | Prompt injection attempts, manipulation, scope-creep questions |

The eval is run:

- On every change to the prompt (CI gate).
- On every change to the corpus (re-ingestion triggers eval).
- Nightly (catches model drift if the vendor silently changes behavior).
- Before any production change (pre-deploy gate).

Starter target: 90% of golden Q&A pass; 95% of should-refuse pass; no known adversarial case produces harmful output. Tune thresholds to corpus size, risk tier, and launch cohort. A failing production-risk eval should block merge and deploy until reviewed.

## Conversation handling

A chatbot is multi-turn. The starter's stance:

- **Short context window.** Last 5 turns kept in conversation history. Older turns are summarized or dropped. The starter does not need infinite memory; it does not need cross-session memory.
- **Retrieval per turn.** Each user message triggers retrieval. Conversation context biases retrieval (the previous question's keywords improve recall) but doesn't replace it.
- **No tool calling in v1.** The starter does not let the model call tools. It only retrieves and answers. Tools come in v2 once the basic flow is solid.
- **Conversation reset.** A "Start a new conversation" button. Reset clears history; the user opts in to the new context.

## Cost ceiling

The starter should operate inside a per-user or per-feature monthly budget. The exact number depends on provider pricing, usage patterns, retrieval size, and selected model tier. To stay predictable:

- **Mid-tier model.** Use the lowest-cost approved model tier that passes eval for the starter's question shape.
- **Prompt/context caching where available.** Cache static system prompt and reusable context through the provider, gateway, or application layer when supported.
- **Compact retrieval.** Top-K = 5 chunks of ~500 tokens each. Not 20 chunks of 1,000 tokens each.
- **Concise output.** The prompt instructs concise answers; eval enforces token-length caps.

The [cost dashboard](/phase-5-platform/ai-orchestration-module/) surfaces per-user, per-feature, per-prompt cost. Anomalies trigger alerts based on the approved budget.

## Guardrails

For a starter:

- **Input PII detection** — the system warns if the user appears to have pasted PII into a question, suggesting they not paste case-specific personal data.
- **Output PII redaction** — outputs are scanned for PII; flagged outputs are downgraded or refused.
- **Prompt injection detection** — adversarial inputs are flagged; the model is instructed to refuse if instructions in the user message contradict the system prompt.
- **Citation requirement** — RAG outputs without citations are rejected, regenerated, or downgraded according to risk and UX policy.

Tier-2 starters layer in additional guardrails (toxicity classifier on outputs, stricter PII rules). Tier-3 starters wait until a later project.

## User feedback loop

The most important non-AI feature of the starter is the feedback widget.

- A simple "thumbs up / thumbs down / not sure" on every assistant reply.
- An optional comment box.
- Feedback is logged per conversation.
- The admin dashboard surfaces a feedback inbox; the corpus owner reviews weekly.
- Patterns in feedback drive corpus updates and prompt iterations.

Feedback is the single best signal of quality during pre-launch and the first months of production. A starter without a feedback mechanism is flying blind.

## Build sprints (Months 7–10)

A reasonable Phase 6 timeline for a RAG chatbot:

| Sprint           | Output                                                                           |
| ---------------- | -------------------------------------------------------------------------------- |
| Month 7 (4 wks)  | Selection memo signed; user research complete; corpus identified                 |
| Month 8 (4 wks)  | Scaffold from IDP; auth wired; first-pass corpus ingested; happy-path chat works |
| Month 9 (4 wks)  | Eval suite at threshold; refusal behavior tested; UAT with test cohort           |
| Month 10 (4 wks) | Production readiness: cost ceiling met; on-call rehearsed; go/no-go              |

Months 11–12 are launch and operate. The retrospective in Month 12 is what feeds the platform team's punch list and informs the second project.

## What launching looks like

Launch is not a public announcement. It's:

- **Day 1:** test cohort starts using the system. Feedback widget is live. On-call is on.
- **Week 1:** monitor cost, latency, error rates, refusal rates, feedback sentiment.
- **Week 2:** address the first wave of feedback (corpus gaps, prompt tweaks, UI fixes).
- **Week 3:** expand to the broader audience for the program area.
- **Month 2:** stable operation; weekly review of feedback and eval results.

Public announcement, if any, comes after a month of stable operation. The agency does not announce a starter project before it has run.

## Common RAG chatbot failures

- **Corpus pollution.** Too many low-quality documents; the chatbot's accuracy drops; trust collapses. Curate ruthlessly.
- **Confabulation.** The prompt isn't strict enough; the model invents answers when retrieval fails. Eval should catch this; ratchet the should-refuse threshold.
- **Citation theater.** The model cites documents that don't actually contain the claim. Run citation-grounded eval (retrieve the cited chunk; verify it supports the claim).
- **Long-tail questions.** The chatbot is great at the most common 50 questions; off the long tail, it falls apart. Track the long tail; add to the corpus or the canned responses.
- **Adoption stagnation.** Launch happens; usage spikes for two weeks; then trails off. The chatbot has to be in users' workflow (linked from the intranet, embedded in the tools they use), not a separate destination.
- **Over-promised scope.** "It's the agency's AI assistant" — and then it disappoints because no AI assistant can answer everything. Keep scope narrow; expand only when the narrow scope is solid.

## Plain-English Guide to RAG Chatbot Terms

- **RAG (Retrieval-Augmented Generation).** Look up relevant documents from the agency's corpus, then ask the model to answer using those documents. Grounds the answer in agency content.
- **Chunk.** A piece of a document — typically a paragraph or two — that gets indexed for retrieval.
- **Top-K retrieval.** Fetching the K most-relevant chunks for a question (typical K = 5).
- **Reranker.** A second-pass model that scores the top-K chunks and reorders them for relevance.
- **Citation.** A reference to the source document that backed up a part of the answer.
- **Confabulation.** When the model invents an answer that sounds plausible but isn't supported by the retrieved documents.
- **Refusal.** The model declining to answer because it doesn't have grounding for a confident response.

## Related

- [Phase 6 overview](/phase-6-starter-projects/) — the five archetypes and the months 7–12 sequence
- [Selection Guide](/phase-6-starter-projects/selection-guide/) — how to pick this archetype
- [AI Orchestration Module](/phase-5-platform/ai-orchestration-module/) — the platform module this archetype most exercises
- [Production Readiness Checklist](/phase-6-starter-projects/production-readiness/) — what "ready to launch" looks like
- [User Testing Protocol](/phase-6-starter-projects/user-testing/) — how to run UAT for the chatbot

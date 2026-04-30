---
title: Archetype — Document Intelligence
description: Read, index, and answer questions about a document corpus — heavier RAG that exercises retrieval, citations, and document rendering.
sidebar:
  order: 5
---

Document intelligence is RAG's grown-up cousin. Where a [chatbot](/phase-6-starter-projects/archetype-rag-chatbot/) answers a quick question over a curated FAQ corpus, document intelligence handles a larger, less-curated set of documents and asks more of the retrieval pipeline. The user is typically a researcher, analyst, or caseworker doing synthesis work — comparing documents, finding precedents, drafting briefs, locating citations.

This archetype exercises RAG depth (better retrieval, hybrid search, reranking, multi-document reasoning) and the [document rendering module](/phase-5-platform/document-rendering-module/) for outputs. It is a meaningful step up from the chatbot in complexity; an agency that's confident about its corpus and its analyst audience can pick this directly. Otherwise, do a chatbot first and a document-intelligence project as the second.

## What the project ships

A web application where an analyst can:

- **Browse the corpus** with metadata filters (date, type, jurisdiction, tag).
- **Search** — hybrid keyword + semantic search across the corpus.
- **Ask questions** — multi-document Q&A with citations.
- **Compare** documents side-by-side or summarize differences.
- **Synthesize** — generate a draft brief, comparison memo, or excerpt list with citations.
- **Export** the synthesized output as PDF or DOCX with citation footnotes.

Plus operator surface:

- Corpus management (ingest, re-ingest, version, retire).
- Per-corpus access controls.
- Eval dashboards.
- Cost and retention tracking.

## When this is the right starter

- The agency has a document corpus the size of "more than analysts can read" — this may be hundreds, thousands, or more depending on document length, complexity, and workflow.
- Analysts already do this work, slowly, by hand. The current process is searching SharePoint and reading PDFs.
- Citations matter — analysts must verify against sources before relying on the output.
- The corpus is mostly textual (PDFs of varying quality, DOCX, HTML). Image-heavy or scan-heavy corpora need OCR pre-processing.
- A wrong answer with a wrong citation is detectable because analysts will check.

## When it's not

- Corpus is tiny (a few hundred documents) — chatbot or just full-text search is sufficient.
- Corpus is mostly tier-3 (privileged, classified, PII-dense). Save for a later project.
- Analysts don't have time to test and validate during build. Document-intelligence projects need analyst pull during the build, not just at launch.

## Modules exercised

| Module                                                             | How                                                                 |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| [Auth](/phase-5-platform/auth-module/)                             | SSO, with possible step-up MFA on sensitive corpora                 |
| [RBAC](/phase-5-platform/rbac-module/)                             | Per-corpus access; per-document classification filtering            |
| [API Framework](/phase-5-platform/api-framework-module/)           | Search, Q&A, export endpoints                                       |
| [Data Grid](/phase-5-platform/data-grid-module/)                   | Document browsing, metadata filtering, search results               |
| [AI Orchestration](/phase-5-platform/ai-orchestration-module/)     | Heavier retrieval pipeline: hybrid search, reranking, multi-doc Q&A |
| [Document Rendering](/phase-5-platform/document-rendering-module/) | Synthesized brief / memo export with citations                      |
| [Admin Dashboard](/phase-5-platform/admin-dashboard-module/)       | Corpus admin, eval, cost                                            |

## Architecture sketch

Same shape as the chatbot, with three additions:

- **Hybrid search.** Keyword search plus vector search, results merged. Works better than vector-only on rare-word queries (case names, statute numbers, agency-specific jargon).
- **Reranker.** A second-pass rerank model scores candidate retrievals; the top results feed the prompt.
- **Multi-step synthesis.** For longer outputs (draft brief, comparison memo), an outliner-then-writer pattern: a planning prompt generates section structure; per-section prompts fill content with citations.

```
                Browser
                   │
       ┌───────────▼──────────┐
       │     Frontend         │
       └───────────┬──────────┘
                   │
       ┌───────────▼──────────┐
       │    API Framework     │
       └───────────┬──────────┘
                   │
       ┌───────────▼──────────┐
       │   AI Orchestration   │
       └───┬───────────┬──────┘
           │           │
   ┌───────▼──┐    ┌───▼─────┐
   │ Hybrid   │ →  │ Reranker │ → LLM
   │ Search   │    │          │
   └──────────┘    └──────────┘
```

## Corpus ingestion at scale

Document intelligence corpora are larger and messier than chatbot corpora. The ingestion pipeline must handle:

- **Heterogeneous formats.** Scanned PDFs (need OCR), born-digital PDFs, DOCX, HTML, plain text, occasionally Excel.
- **Document versioning.** "Policy v3 supersedes v2" — both indexed; the latest is preferred unless the analyst explicitly searches historical.
- **Metadata extraction.** Dates, authors, jurisdictions, tags. Extracted from filenames, headers, or metadata sidecar files.
- **Quality variance.** Some PDFs are clean text; some are 1990s scans where OCR introduces noise.
- **Re-ingestion at scale.** Updating the embedding model means re-embedding everything — plan for it.

OCR options for scanned PDFs include open-source OCR, cloud document-extraction services, and specialty document AI providers. For the starter, pick the option that fits Phase 3 cloud/networking, procurement, data classification, and expected scan quality.

## Hybrid search

Vector-only retrieval misses queries with rare named entities. Hybrid search:

1. Run keyword search (BM25 or `tsvector`); get top-N keyword matches.
2. Run vector search; get top-N semantic matches.
3. Merge using Reciprocal Rank Fusion (RRF).
4. Apply metadata filters (date range, type, jurisdiction, classification).
5. Rerank with cross-encoder.
6. Return top-K to the prompt.

An existing database plus native full-text/vector support may be enough for the starter. Larger or more complex corpora may move to a dedicated search service and vector backend.

## Citation grounding

Citation quality is the project's reputation. Standards:

- **Every claim cited.** The prompt instructs the model to cite the chunk that supports each claim.
- **Citation format.** `[doc_id:section_id]` inline. The UI renders these as clickable links to the source.
- **Citation grounding eval.** A separate eval — given a generated answer with citations, fetch each cited chunk and verify the chunk supports the claim. The evaluator can be model-as-judge with a strict rubric, human review, or both.
- **Refuse if can't cite.** When retrieval doesn't surface evidence for the question, the prompt instructs the model to say so. Confabulated citations are the project's worst failure mode.

The synthesized export (brief, memo) carries footnoted citations; readers can click through to source documents.

## Synthesis prompts

The hard prompts are not the question-answer ones — those are the chatbot's prompts. Document intelligence layers in:

- **Comparison.** "Compare these two policies. List substantive differences with citations."
- **Drafting.** "Draft a memo summarizing the agency's enforcement history on Topic X."
- **Cross-document Q&A.** "Across the 2025 inspection reports, how often did finding type A appear?"

These prompts use multi-step orchestration:

- Step 1: Outline. The model produces a structured outline with required citations per section.
- Step 2: Per-section drafting. For each section, a focused prompt with retrieval scoped to that section's topic.
- Step 3: Citation pass. A final pass verifies each citation grounds.

Each step is in the prompt registry, versioned, and individually evaluable.

## Eval suite

Heavier than the chatbot's:

| Group                  | Tests                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| **Single-doc Q&A**     | 30+ questions with ground-truth answers in known documents         |
| **Multi-doc Q&A**      | 20+ questions requiring synthesis across multiple documents        |
| **Citation grounding** | All cited chunks should support the claim (model-as-judge with rubric and/or human review) |
| **Retrieval recall**   | For known questions, did retrieval surface the right documents?    |
| **Should refuse**      | Questions the corpus doesn't answer; system must refuse            |
| **Comparison**         | Known-difference document pairs; verify the system identifies them |

Starter threshold targets:

- Citation grounding around 95% for launch candidates. Lower means citations are unreliable.
- Retrieval recall@10 around 90% for known-answer questions. Lower means analysts may not trust the system to surface the right documents.
- Should-refuse around 95%. Lower means confabulation risk.

## Output: the brief / memo

Synthesized outputs are not just chat replies. They are documents the analyst will edit, cite back to in their own work, and possibly share with others. The platform's [document rendering module](/phase-5-platform/document-rendering-module/) handles output:

- **Markdown intermediate** with structured sections.
- **Citation footnotes** with hyperlinks to the source documents (in the corpus admin UI).
- **PDF / DOCX export** with the agency's letterhead.
- **Watermarking** for sensitive corpora — the export carries the user, timestamp, query.
- **Version metadata** — which prompt version, corpus version, model ID/tier, and renderer version. Reproducibility matters because analyst outputs may be relied on later.

## Cost ceiling

Document-intelligence costs are higher per query than chatbot costs:

- More retrieved tokens per query (10 chunks of 800 tokens, vs 5 of 500).
- Reranker adds a small cost.
- Synthesis tasks may use a higher-capability approved model tier for quality.
- Multi-step synthesis means multiple model calls per output.

Per-query cost varies widely by provider, model tier, retrieval size, reranking, and output length. Estimate with current pricing, then enforce per-user and per-feature budgets in the cost dashboard.

For the starter, prefer the mid-tier approved model and only escalate to a higher-capability tier for synthesis tasks the user explicitly opts into.

## Build sprints (Months 7–10)

| Sprint           | Output                                                             |
| ---------------- | ------------------------------------------------------------------ |
| Month 7 (4 wks)  | Selection memo, corpus identified, ingestion pilot on a sub-corpus |
| Month 8 (4 wks)  | Hybrid search, reranker, single-doc Q&A working; first eval suite  |
| Month 9 (4 wks)  | Multi-doc synthesis prompts; export; UAT with analyst cohort       |
| Month 10 (4 wks) | Citation grounding hardened; production readiness                  |

## What launching looks like

- Test cohort of 5–10 analysts in Month 9.
- Per-analyst feedback (which queries work, which don't) drives corpus and prompt iterations.
- Launch is to the analyst team that participated in UAT first; expand to peer teams over the following months.

## Common document-intelligence failures

- **Confabulated citations.** Model invents document IDs that don't exist or quotes chunks it didn't actually retrieve. Citation-grounding eval catches this; thresholds enforced.
- **OCR poison.** Noisy OCR introduces nonsense text; retrievals surface garbage chunks; quality drops. Filter chunks by extraction-quality score; re-OCR the worst documents.
- **Stale corpus.** New documents aren't ingested; analysts get answers from outdated content. Establish refresh cadence.
- **Long-form synthesis collapse.** Multi-section memos drift in tone or repeat content. Outliner-then-writer pattern + per-section eval.
- **Analyst velocity not improved.** The system answers; the analyst still has to verify everything. If verification is as much work as the original research, the system isn't saving time. Improve citation precision or shrink scope.
- **Admin overload.** The corpus admin becomes a full-time job nobody has. Plan for 0.25–0.5 FTE on corpus operation; without it, the corpus rots.

## Plain-English Guide to Document Intelligence Terms

- **Hybrid search.** Combining keyword search (good at rare named entities) with semantic search (good at concepts). Results merged.
- **Reranker.** A second-pass model that scores the candidate retrievals more carefully. Improves precision.
- **OCR (Optical Character Recognition).** Converting an image of text into actual text. Required for scanned PDFs.
- **Citation grounding.** The property that every claim in the output is backed by a quote from a real source document.
- **Multi-step synthesis.** Breaking a long output (memo, brief) into sections; using separate prompts for outlining and per-section drafting.
- **Reciprocal Rank Fusion (RRF).** A simple algorithm for merging multiple ranked lists into one.

## Related

- [Phase 6 overview](/phase-6-starter-projects/) — the five archetypes
- [Selection Guide](/phase-6-starter-projects/selection-guide/) — when to pick this archetype
- [AI Orchestration Module](/phase-5-platform/ai-orchestration-module/) — retrieval and synthesis pipelines
- [Document Rendering Module](/phase-5-platform/document-rendering-module/) — output rendering
- [RAG Chatbot](/phase-6-starter-projects/archetype-rag-chatbot/) — the lighter cousin of this archetype

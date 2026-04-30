---
title: Archetype — NL Data Dashboard
description: Natural-language queries over operational data, with charts, exports, and SQL guardrails — when leaders can't get answers from their data.
sidebar:
  order: 7
---

The NL Data Dashboard is the starter for agencies whose recurring complaint is "we have the data; we just can't get answers from it." A mid-level supervisor wants to know "how many cases were opened last month, by region"; a director wants to see the trend across two quarters; a budget officer wants to compare overtime costs across divisions. Today, those questions require either a self-service BI tool that nobody learned, or a ticket to the data team that takes two weeks.

A natural-language interface that produces correct SQL, runs it, and shows the result with a chart can be enormously useful. It also has the most distinctive set of risks of any starter — wrong SQL produces a wrong answer that looks right, and the user may rely on it without spotting the mistake. That risk profile is why the NL data dashboard is the archetype with the most guardrails per query.

## What the project ships

A web application where users can:

- **Ask in plain English** — "how many open cases in Region 4 this quarter?"
- **See the generated SQL** — clearly displayed; not hidden.
- **See the result** as a table.
- **See an auto-generated chart** when the result is chartable (time series, breakdown).
- **Edit the SQL** if they want; re-run.
- **Save and share** queries.
- **Export** the result as CSV/Excel.
- **See data lineage** — which tables, which columns, what filters.

Plus the operator surface:

- Schema management — which tables / columns are exposed for NL queries.
- Eval dashboards.
- Audit log of every query and result.
- Cost and rate-limit tracking.

## When this is the right starter

- Agency data is in queryable systems (data warehouse, operational DB).
- Decision-makers ask aggregate questions of this data routinely.
- The data-team ticket queue is a real bottleneck.
- Wrong answers are recoverable — the user can verify against the underlying numbers, or the answer is for a directional question, not a binding decision.
- The agency has an information-security path for "user X can see tables Y and Z."

## When it's not

- Data is in spreadsheets and files, not a warehouse.
- The questions are mostly free-form analysis (not aggregations).
- A wrong number triggers a binding action without verification.
- Users would not catch a wrong answer (system is not self-checking).
- Tier-3 data dominates the relevant tables.

## Modules exercised

| Module                                                             | How                                                    |
| ------------------------------------------------------------------ | ------------------------------------------------------ |
| [Auth](/phase-5-platform/auth-module/)                             | SSO; per-user identity for row-level security          |
| [RBAC](/phase-5-platform/rbac-module/)                             | Per-table access; row-level filters by tenant / region |
| [API Framework](/phase-5-platform/api-framework-module/)           | Query endpoint with strict timeouts and rate limits    |
| [Data Grid](/phase-5-platform/data-grid-module/)                   | Result tables; saved queries; query history            |
| [AI Orchestration](/phase-5-platform/ai-orchestration-module/)     | NL→SQL prompts, schema retrieval, eval, cost           |
| [Admin Dashboard](/phase-5-platform/admin-dashboard-module/)       | Schema admin, query patterns, audit                    |
| [Document Rendering](/phase-5-platform/document-rendering-module/) | Optional: report exports                               |

## Architecture sketch

```
                Browser
                   │
       ┌───────────▼──────────┐
       │     Frontend         │  Question box, SQL pane, result table, chart
       └───────────┬──────────┘
                   │
       ┌───────────▼──────────┐
       │    API Framework     │
       └───────────┬──────────┘
                   │
       ┌───────────▼──────────┐
       │   AI Orchestration   │  NL → SQL with schema retrieval
       └──┬───────────┬───────┘
          │           │
   ┌──────▼──┐    ┌───▼────────────────┐
   │ Schema  │    │ SQL Validator       │  parse, allowlist, RBAC-rewrite, dry-run
   │ Index   │    └───┬────────────────┘
   └─────────┘        │
                      ▼
                ┌──────────────┐
                │ Read-Only DB │  separate user, statement timeout, row-level security
                └──────────────┘
```

## The NL→SQL pipeline

Generating SQL is the easy part. Generating _safe, correct_ SQL that respects RBAC and doesn't leak the schema is the hard part.

The pipeline:

1. **Schema retrieval.** From the question, retrieve relevant tables and columns. Do not pass the whole schema to the model — pass the most-likely-relevant subset.
2. **Few-shot examples.** Include 3–5 example questions with their correct SQL. Examples are curated by the data team.
3. **Generate SQL.** Mid-tier model with structured output (JSON: `{ sql: "...", explanation: "...", referenced_tables: [...] }`).
4. **Parse and validate.** SQL must parse. It should be SELECT-only (no writes, no DDL), reference only allowlisted tables, and avoid forbidden constructs such as cross-database joins or unsafe UDF calls.
5. **RBAC rewrite.** Inject row-level filters based on the user's identity. (E.g., if the user is scoped to Region 4, every reference to `cases` is rewritten to `(SELECT * FROM cases WHERE region = 4)` via a view or a filter predicate.)
6. **Dry-run / cost estimate.** EXPLAIN the query; estimate cost; reject queries above a threshold.
7. **Execute against read-only DB.** Separate database user with read-only permissions and a statement timeout.
8. **Format result.** Return rows + a chart suggestion if applicable.
9. **Audit log.** Question, generated SQL, RBAC-rewritten SQL, row count, execution time.

Most failures the model can produce — invented columns, wrong join keys, forbidden operations — are caught by the validator before execution.

## SQL guardrails (the unique-to-this-archetype piece)

This archetype's safety is largely SQL guardrails. Specifically:

- **SELECT-only.** Parser rejects anything that isn't a top-level SELECT. No INSERT/UPDATE/DELETE/DDL.
- **Table allowlist.** Only registered tables are queryable. The model can't get to system catalogs or random tables.
- **Column allowlist per table.** Sensitive columns (SSNs, account numbers, raw PII) are blocked at the column level even if the table is allowed.
- **Read-only DB user.** Even if a malicious SQL slipped through, the DB user has no write permissions on anything.
- **Row-level security.** RBAC-derived row filters are enforced at the DB layer (Postgres RLS, or a query-rewriter), not just by trusting the generated SQL.
- **Statement timeout.** Default 30 seconds. Long-running queries are killed.
- **Cost cap.** Queries with extreme estimated cost (cross joins on large tables, queries against unindexed columns) are rejected with a "this query is too expensive" error.
- **Sandbox warehouse.** Queries should run against a read replica or dedicated reporting warehouse, not the production OLTP database.

The validator's defaults are deny. New tables, columns, and constructs are allowlisted explicitly.

## Schema retrieval

The model needs to know the schema, but the schema may have hundreds or thousands of columns. The pipeline:

1. **Schema embeddings.** Each table and column has a description; descriptions are embedded.
2. **Schema retrieval.** From the question, fetch top-K relevant tables / columns.
3. **Schema in prompt.** Include only the retrieved schema chunks plus 1–2 few-shot examples that use them.

Curated descriptions for tables / columns make a huge difference. "patient_records.dx_code" → "Diagnosis code, ICD-10 format. Filled in by the intake clinician." A model with that description writes better SQL than one given just `dx_code: TEXT`.

## Chart auto-generation

When the result has a temporal dimension or a categorical breakdown, the system suggests a chart:

- **Time series** when there's a date column → line chart.
- **Categorical breakdown** with one numeric → bar chart.
- **Two numerics** → scatter.
- **Geographic** when there's a known region column → map (if geo data is loaded).

Charts are an LLM-suggested interpretation; users override with a chart-type picker. The chart suggestion is a small additional prompt over the result schema.

## Eval suite

The eval challenge is unique: the AI's output is SQL, and the ground truth is a query result.

Three levels:

| Level                   | What it checks                                                            |
| ----------------------- | ------------------------------------------------------------------------- |
| **SQL match**           | Generated SQL ≈ reference SQL (syntactically or via semantic equivalence) |
| **Result match**        | Generated SQL produces the same rows as the reference SQL                 |
| **Refusal correctness** | The system refuses queries it shouldn't try to answer                     |

Result match is the gold standard — it doesn't matter if the SQL is differently shaped, as long as the answer is right. The eval suite has 30–50 questions with curated reference SQL; comparison is on row sets.

Starter target: at least 90% result match on the eval suite. Tune the threshold to question complexity and risk; below the local threshold, the model's accuracy does not justify the trust the UX implies.

## Caveats users see

The UI is honest about what the system is:

- **The SQL is shown** — not as decoration but as part of the answer. Users (especially analyst-leaning users) check the SQL.
- **A "verify before relying" reminder** for queries that would feed a binding decision.
- **A confidence indicator** — the system flags low-confidence queries (uncommon question shape, multiple plausible interpretations).
- **A "compare to known dashboard" link** when applicable — for common questions, link to the canonical dashboard so users can sanity-check.

## Saved queries and the canonical-question library

After a few months of operation, the same questions recur. The dashboard captures them:

- **Save a query.** "Open cases by region by month."
- **Promote to canonical.** A saved query can be promoted by the data team to the official answer to a recurring question.
- **Canonical answer reuse.** When users ask a recurring question, the system suggests "you may want this canonical query" before generating fresh SQL.

The canonical library reduces eval pressure (these queries are vetted) and improves trust (users see the same answer when they ask the same question).

## Cost ceiling

NL→SQL costs:

- **Generation:** ~$0.02–$0.10 per query (mid-tier model with retrieved schema).
- **Execution:** depends on query; the cap on estimated cost prevents runaways.
- **Rate limit:** per-user limit (e.g., 50 queries/hour) prevents accidental loops.

Total starter budget is small. The risk is not cost; it is wrong answers reaching decisions.

## Build sprints (Months 7–10)

| Sprint           | Output                                                       |
| ---------------- | ------------------------------------------------------------ |
| Month 7 (4 wks)  | Selection memo; warehouse access; eval-set questions curated |
| Month 8 (4 wks)  | Schema retrieval, NL→SQL prompt, validator, RBAC rewrite     |
| Month 9 (4 wks)  | Chart generation, saved queries, UAT with analyst cohort     |
| Month 10 (4 wks) | Eval threshold met, audit, production readiness              |

## What launching looks like

- Test cohort of 5–10 supervisor-level users in Month 9.
- Per-question feedback (was this SQL right?) drives prompt and schema-description iterations.
- Launch is to one division first; expand based on feedback.

## Common NL data dashboard failures

- **Wrong-but-plausible SQL.** The model writes SQL that runs and returns plausible numbers, but the join is wrong or the filter is off. Result-match eval catches systematic issues; user-facing SQL display catches case-by-case ones.
- **Schema poisoning.** Adding a new table without a description, with a misleading description, or with overlapping naming confuses the model. Schema descriptions are first-class artifacts maintained by the data team.
- **RBAC bypass.** A user gets data they should not because the RBAC rewrite missed a path. Defense-in-depth: enforce row-level security or equivalent controls at the DB/reporting layer wherever possible.
- **Confidence inflation.** The system implies high confidence on shaky answers; users trust it; bad decisions follow. Calibrate confidence; show the SQL.
- **The data is wrong.** The warehouse data has stale ETLs or data-quality issues; the system surfaces wrong answers from correct SQL. Data quality is a precondition, not a feature.
- **The dashboard replaces curation.** Stakeholders abandon their curated dashboards because "the AI can answer it." Curated dashboards are still authoritative; the NL layer complements, doesn't replace.
- **Adversarial queries.** A user tries to get the system to generate SQL that exfiltrates data. Validator + read-only user + RLS/equivalent controls together; do not trust generated SQL alone.

## Plain-English Guide to NL Data Dashboard Terms

- **NL→SQL.** Natural-language to SQL — translating "how many open cases" into the SQL that answers it.
- **Row-level security (RLS).** A database feature where each query is automatically filtered by who's asking. Postgres / SQL Server / Snowflake support it.
- **Schema retrieval.** Looking up which tables / columns are most relevant to the user's question, so the model only sees the relevant subset.
- **Result match.** An eval criterion: the generated SQL produces the same rows as the reference SQL, even if syntactically different.
- **Canonical query.** A vetted, saved query that represents the official answer to a recurring question.
- **Read-only user.** A database user with permission only to SELECT, not to write or change schema.

## Related

- [Phase 6 overview](/phase-6-starter-projects/) — the five archetypes
- [Selection Guide](/phase-6-starter-projects/selection-guide/) — when to pick this archetype
- [AI Orchestration Module](/phase-5-platform/ai-orchestration-module/) — provides NL→SQL pipeline
- [Data Grid Module](/phase-5-platform/data-grid-module/) — result tables and saved queries
- [API Framework](/phase-5-platform/api-framework-module/) — rate limits and timeouts

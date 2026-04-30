---
title: Architecture Decision Records
description: When to write an ADR, the template, the review and ratification workflow, and the agency's seed backlog of foundational ADRs.
sidebar:
  order: 8
---

An Architecture Decision Record (ADR) captures a decision: what was decided, why, what was considered, and what changes if it is reversed. ADRs are the durable institutional memory of the agency's technical choices. They are read most often by engineers two years later who are about to make a change and need to know "why does it work this way" — and by auditors who need to know "who decided this, on what basis, when."

The format originated with Michael Nygard's 2011 essay and has been adapted across many organizations. The version below is the agency's variant, sized for a government engineering team that values brevity over ceremony.

## When to write an ADR

The bar is not "every technical decision." It is "decisions whose reversal would be expensive."

Write an ADR when:

- The decision affects multiple services, teams, or repositories.
- The decision sets a default that subsequent work will follow.
- The decision constrains a procurement, contract, or vendor relationship.
- The decision rejects a credible alternative (so the alternative doesn't keep coming back).
- The decision is hard to reverse (a database choice, a wire protocol, a vendor commitment).

Don't write an ADR for:

- Reversible code-level decisions (function shapes, module organization within a service). These belong in code review.
- Day-to-day prioritization. Use the issue tracker.
- Style decisions (formatter, linter, naming). These belong in [coding standards](/phase-4-dev-stack/coding-standards/).
- Rephrasing of an existing ADR. Edit the existing one or write a superseding ADR.

A useful test: in two years, would an engineer benefit from finding this written down? If yes, ADR. If the answer is "they'd just read the code," skip it.

## The template

The agency template is short on purpose. ADRs over four pages are unread.

```markdown
# ADR-NNNN: <Short, declarative title>

- Status: Proposed | Accepted | Superseded by ADR-XXXX | Deprecated
- Date: YYYY-MM-DD
- Deciders: <names of people responsible>
- Tags: <area, area>

## Context

What problem are we solving? What constraints apply? What did the room
look like before this decision? Two to four short paragraphs.

## Decision

We will <verb> <noun>. State it in one or two sentences.

## Drivers

Why this and not the alternatives? List the three to five reasons that
actually moved the decision. Don't list every consideration that was
mentioned — list the ones that mattered.

## Alternatives considered

For each credible alternative:

- **<Alternative name>.** Short description. Why we rejected it.

The list should include any option that was seriously discussed. If an
option was not seriously discussed, do not pad the list with it.

## Consequences

What changes because of this decision?

- Positive: ...
- Negative: ...
- Neutral but worth noting: ...

What new work does this create? What old work does this make obsolete?
What does this constrain in the future?

## Implementation notes (optional)

Pointers to the code, infra, or doc work that operationalizes the
decision. Owners and target dates.

## Review

This decision will be revisited <when / under what trigger>.
```

A complete ADR is usually 1–2 pages. Anything over 4 pages is a sign that the decision wasn't actually made — break it into multiple ADRs or push it back to the deciders.

## Worked example

```markdown
# ADR-0003: Use OpenTelemetry as the observability instrumentation standard

- Status: Accepted
- Date: 2026-04-15
- Deciders: Platform engineering lead, AI program lead, security architect
- Tags: observability, platform, phase-3

## Context

The agency operates on Azure today and may add AWS workloads in 2027.
Each cloud has its own native instrumentation SDKs (Application Insights,
CloudWatch). Adopting either as the agency-wide standard creates
re-instrumentation cost when we add a second cloud.

## Decision

We will instrument all platform code with OpenTelemetry SDKs and export
via OTLP. Backend choice is environment-specific (Application Insights
in Azure, Managed Grafana / Honeycomb / cloud-native elsewhere).

## Drivers

- Vendor neutrality: OTLP is accepted by every major backend.
- Cross-cloud portability: same code runs in Azure, AWS, GCP without
  re-instrumentation.
- Track 4 lab compatibility: Track 4 teaches OTel; switching to a
  proprietary SDK would split the curriculum.
- Mature SDKs in Python, TypeScript, Java, .NET, Go.

## Alternatives considered

- **Application Insights SDK.** Best Azure integration; rejected because
  it locks us into Azure when the agency may operate multi-cloud later.
- **Datadog SDK.** Rich feature set; rejected because of cost and the
  same vendor-lock concern.
- **Roll our own minimal logging library.** Rejected; reinventing well-
  understood tooling is expensive and worse than the standard.

## Consequences

- Positive: portable instrumentation; Track 4 cohort uses real production
  conventions in labs.
- Negative: some Azure-specific features (Application Map auto-discovery)
  require an extra OTel exporter step.
- Neutral: each new service repo includes the agency's OTel bootstrap
  package; the bootstrap pins SDK versions.

## Implementation notes

- Bootstrap library: `agency-otel-bootstrap` (Python, TS, Java, .NET, Go).
- Reference implementation already uses this library.
- Existing services migrate at next significant work item; no mass
  migration.

## Review

Re-evaluate in 2028 if cloud strategy changes substantially.
```

## ADR storage

ADRs should live close to the code when possible.

- **Agency-wide ADRs** (e.g., stack selection, observability standard): in `agency/architecture-decisions` — a dedicated repo whose only job is to host ADRs. Numbered sequentially; never renumbered.
- **Repo-local ADRs**: in each repo's `ADRs/` directory; numbered locally. Cover decisions specific to that repo (e.g., "this service uses Postgres because of X").
- **Small-agency starter:** a single `ADRs.md` or `architecture-decisions/` folder in the first repo is enough until the program grows.
- **Records-system mirror:** if official records must live in SharePoint, Teams, Confluence, or a document-management system, keep the Markdown ADR in source control and mirror/export it to the official records location.

ADRs are most useful as Markdown, versioned alongside code, with PR review where available. A document system can be the official record, but engineers still need a stable link from the code to the decision.

## The workflow

ADRs go through PR like any other change when the agency has a repo workflow:

1. **Author drafts the ADR** as `ADR-NNNN-short-title.md`. Status: `Proposed`.
2. **PR is opened** with the ADR file. The PR description summarizes the decision in 2 sentences and lists the deciders.
3. **Reviewers read** and comment. Discussion happens in PR comments. The author updates the ADR based on feedback (or argues back).
4. **Deciders ratify** — at least one approval from each named decider.
5. **Status changes to `Accepted`** in the merge commit.
6. **CI/CD picks it up** if the ADR triggers any tooling change (e.g., a new linter rule).

The full cycle should take days, not weeks. ADRs that languish are signals that the decision isn't ready or the deciders aren't engaged. Either fix the ADR or close it. For a small agency, the same workflow can be a short draft, one review meeting, and a dated accepted entry in the ADR log.

## Superseding and deprecating

Decisions get reversed. Two patterns:

- **Superseded by.** ADR-0007 says "use Postgres for the vector store." ADR-0042 says "switch to a dedicated vector DB; ADR-0007 is superseded." ADR-0007's status changes to `Superseded by ADR-0042`. Both stay in the repo.
- **Deprecated.** A decision that no longer applies but has no replacement (e.g., a constraint that was lifted). Mark `Deprecated` and link to the explanation.

Never delete an ADR. The history is the value.

## Foundational ADR backlog

The first 5–8 ADRs every agency writes during Phase 4. The seed list:

| #    | Title                              | Notes                                                            |
| ---- | ---------------------------------- | ---------------------------------------------------------------- |
| 0001 | Primary stack                      | Output of [stack selection](/phase-4-dev-stack/stack-selection/) |
| 0002 | Observability instrumentation      | OTel-first decision                                              |
| 0003 | LLM provider strategy              | Single vendor, multi-vendor, or adapter-only                     |
| 0004 | Vector store choice                | pgvector vs. dedicated DB                                        |
| 0005 | API specification format           | OpenAPI version and code-first or spec-first strategy             |
| 0006 | Authentication scheme              | OIDC + workload identity                                         |
| 0007 | Modular monolith vs. microservices | Default for new platform code                                    |
| 0008 | Eval gate threshold                | What blocks merge                                                |

Each agency's foundational set varies; the list above covers the most common questions an engineer will have in year 2.

## ADR review cadence

A small fraction of ADRs need periodic review:

- ADRs constraining vendor commitments (review at vendor renewal time).
- ADRs setting procurement-relevant defaults (review when procurement landscape shifts).
- ADRs about deprecation timelines (review at sunset).

Add a `Review` line to those ADRs with the cadence. Most ADRs do not need scheduled review — they are revisited when reality changes, not on a schedule.

## ADR culture

The discipline that keeps ADRs useful:

- **One decision per ADR.** Don't smuggle in three.
- **Write in the active voice.** "We will use X" beats "X will be used."
- **State the decision in the title.** "Use OpenTelemetry" beats "Observability."
- **Don't rewrite history.** If a decision was made informally a year ago, write the ADR now to capture the rationale; don't pretend it was a formal decision then.
- **Link from the code.** The relevant module's README references the ADR. The reader who finds the code finds the rationale.
- **Keep them short.** A long ADR is not a more thorough ADR; it is an unread ADR.

## What ADRs are NOT

- A wiki for general design discussion. Use a wiki or a design doc for that.
- A change log. Use the changelog or git history.
- A roadmap. Use the roadmap.
- A meeting record. Use the meeting notes.

ADRs are the narrow durable record of decisions. Everything else has its own home.

## Common ADR failures

- **Too few.** The team makes major decisions in slack messages or hallway conversations and the institutional memory is gone within a year. Write them.
- **Too many.** Every PR generates an ADR; reviewers stop reading. Apply the bar above.
- **Stored where nobody finds them.** Confluence or SharePoint pages buried under three folders. Link them from the repo, or keep Markdown in the repo and mirror to the records system.
- **Decision-by-committee phrasing.** "We considered both X and Y and may use either depending on circumstances." That's not a decision. Decide.
- **No deciders named.** A decision belongs to specific people. Name them.
- **Never updated.** Reality changes; the ADR doesn't. At least mark it superseded or deprecated when the world has moved.

## Related

- [Stack Selection](/phase-4-dev-stack/stack-selection/) — produces ADR-0001
- [Coding Standards](/phase-4-dev-stack/coding-standards/) — defaults; ADRs document deviations
- [API-First Design](/phase-4-dev-stack/api-first-design/) — breaking-change decisions are ADRs
- [Phase 5 — Modular Platform](/phase-5-platform/) — module-level ADRs accumulate as the platform grows

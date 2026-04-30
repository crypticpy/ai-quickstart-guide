---
title: Quarterly Milestone Report Template
description: A fill-in template for executive sponsors. Reports progress vs the 14 milestone gates, ROI vs plan, risks, and asks. One page per quarter; legible in eight minutes.
sidebar:
  order: 13
---

> **What this is.** A pre-formatted quarterly report your sponsor can read in eight minutes. It maps to the 14 milestone gates from the [Gantt and Dependencies page](/resources/gantt-and-dependencies/) and follows the structure that the medium-city and large-state [case studies](/resources/case-studies/) used for sponsor reporting. Copy the markdown below into your reporting cadence and edit in place.

> **Why this format.** Sponsors stop reading status reports that exceed two pages. They also stop trusting reports that omit asks (because every program has asks). This template forces both: a single page per quarter, with an explicit "what we need from you" section that doesn't get edited out at the last minute.

## How to use

1. Copy the markdown block below into a fresh document at the start of each quarter.
2. Fill in the **Headline numbers** first — those drive whether the rest of the report gets read.
3. Update the **Gate progress** table with the most recent gate you cleared and the next one you're working toward.
4. Be specific in **Risks** — vague risks are skimmed and forgotten. The format below forces a probability, an impact, and an owner.
5. Always include at least one **Ask**. If you genuinely have no asks, the report didn't surface enough work. Re-read it.
6. Send it 24 hours before the meeting, not at the meeting.

## The template

```markdown
# {{Agency}} AI Program — Quarterly Report, {{Quarter}}

**Prepared by:** {{Name, role}}
**For:** {{Sponsor name, role — e.g., City Manager / Deputy Commissioner}}
**Period covered:** {{e.g., 2026-Q2 (Apr–Jun 2026)}}
**Reporting cadence:** Quarterly

---

## TL;DR (read this if you read nothing else)

{{Two to four sentences. What's the headline? Did we hit our committed gate? What's the one thing the sponsor needs to know?}}

## Headline numbers

| Metric                     | This quarter  | Last quarter  | Year-to-date | Plan  |
| -------------------------- | ------------- | ------------- | ------------ | ----- |
| Use cases in production    | {{n}}         | {{n}}         | {{n}}        | {{n}} |
| Use cases in review        | {{n}}         | {{n}}         | —            | —     |
| Net annual benefit (est.)  | {{$}}         | {{$}}         | {{$}}        | {{$}} |
| Cumulative spend           | {{$}}         | {{$}}         | {{$}}        | {{$}} |
| Staff trained (cumulative) | {{n}} / {{N}} | {{n}} / {{N}} | —            | {{N}} |
| Policy / equity incidents  | {{n}}         | {{n}}         | {{n}}        | 0     |

## Gate progress

We map progress to the 14 milestone gates from the playbook (G-01 through G-14). See the [Gantt and Dependencies page](/resources/gantt-and-dependencies/) for the full list.

| Gate     | Description                    | Status                  | Note                                |
| -------- | ------------------------------ | ----------------------- | ----------------------------------- |
| G-{{nn}} | {{Most recently cleared gate}} | ✅ Cleared {{date}}     | {{1-line note}}                     |
| G-{{nn}} | {{Currently working toward}}   | 🟡 In progress, {{nn}}% | {{1-line blocker or progress note}} |
| G-{{nn}} | {{Next gate after that}}       | ⏳ Not started          | Targeted {{quarter}}                |

## ROI: estimate vs actuals

(Re-run the [ROI Calculator](/resources/roi-calculator/) against the actuals you have so far.)

- **Estimated payback period at start of program:** {{n.n}} months
- **Estimated payback period as of this quarter, with actuals:** {{n.n}} months
- **Variance commentary:** {{1–2 sentences. If variance is > 25%, this section becomes the lead, not a footnote.}}

## What we shipped this quarter

- {{Bullet — concrete deliverable, e.g., "Approved tools list expanded to 7 entries"}}
- {{Bullet}}
- {{Bullet}}

## What we did not ship this quarter (and why)

- {{Bullet — be honest. The format is "What slipped" + "why" + "new target." Sponsor trust comes from accuracy here, not from clean numbers.}}
- {{Bullet}}

## Risks

Every entry needs a probability (Low / Med / High), impact (Low / Med / High), and an owner.

| Risk       | Probability | Impact | Owner    | Mitigation                                    |
| ---------- | ----------- | ------ | -------- | --------------------------------------------- |
| {{Risk 1}} | M           | H      | {{Name}} | {{One sentence on what we're doing about it}} |
| {{Risk 2}} | L           | M      | {{Name}} | {{One sentence}}                              |
| {{Risk 3}} | H           | M      | {{Name}} | {{One sentence}}                              |

## Asks

Two or three things we need from the sponsor — not the team — to keep moving. If this list is empty, the report missed something.

1. **{{Ask 1}}** — {{One sentence explaining what we need and by when}}
2. **{{Ask 2}}** — {{One sentence}}
3. **{{Ask 3 (optional)}}** — {{One sentence}}

## Use case spotlight (one per quarter)

A single use case in 80–120 words. Rotate which one you spotlight each quarter so the sponsor builds an inventory of the program over time.

**{{Use case name}}** — Tier {{n}}, sponsor: {{name}}.
{{Three to five sentences: what it does, who it serves, status, headline metric, and one specific learning. End with the next milestone date.}}

## Decisions for next quarter

What does the sponsor need to decide between now and the next report?

- {{Decision 1, with proposed default}}
- {{Decision 2, with proposed default}}

## Appendix: methodology notes

(Brief. Most sponsors won't read this; one or two who do will appreciate it.)

- ROI calculation source: [ROI Calculator](/resources/roi-calculator/), inputs as of {{date}}, with {{N}} of N savings drivers backed by measured data.
- Gate definitions: per the playbook's 14 milestone gates ([Gantt and Dependencies](/resources/gantt-and-dependencies/)).
- Compliance posture: per the [legislative tracker](/resources/legislative-tracker/) checklist for {{state / jurisdiction}}; last reviewed {{date}}.
```

## Variants for different sponsors

The template above is calibrated for an executive sponsor (city manager, deputy commissioner, agency head). Two variants worth keeping in your back pocket:

### For a legislative committee or council

Tighten the TL;DR to 100 words. Move the **Asks** section to the bottom and re-label it **Discussion**. Drop the **Decisions for next quarter** section — legislators usually do not want to be asked for decisions in writing. Add a short **Compliance status** section that names every state law you're tracking and the agency's posture against it.

### For an internal IT steering committee

Drop the **TL;DR** and the **Use case spotlight** — the IT audience already has that context. Expand the **Risks** table with a column for technical debt or platform-scaling risks. Add a section on **Module roadmap progress** keyed to the [module taxonomy](/phase-5-platform/module-taxonomy/).

## Common pitfalls

- **Gate inflation.** Reporting "G-08 in progress, 80%" for three quarters running. Either you're not at 80% or the gate was scoped wrong; in either case, name it.
- **ROI variance with no commentary.** If the payback period drifts more than 25%, the variance commentary needs to be more than one sentence — sponsors notice silence here.
- **Asks that are actually status updates.** "Continued support from leadership" is not an ask; it's a deflection. Asks are concrete: a budget reallocation, a hire, a meeting with a specific stakeholder, a decision by a date.
- **No-news reports.** A report that says "everything is on track and there are no risks" is the report that loses sponsor confidence the fastest. Every program has risks; if you can't list three, you haven't looked hard enough.

## See also

- [Gantt and Dependencies](/resources/gantt-and-dependencies/) — the 14 gates referenced above
- [ROI Calculator](/resources/roi-calculator/) — the source of the ROI line in the headline numbers
- [Case Studies](/resources/case-studies/) — examples of agencies using this format

---
title: "Briefing 2.4 — The 12-Month Roadmap: Milestones & ROI"
description: 60-minute briefing walking through the phased plan, setting realistic quarterly expectations, and choosing the first funded starter project.
sidebar:
  order: 4
---

The fourth briefing is the one where the agency commits in writing to a 12-month plan. Earlier briefings produced budget, governance, and the build/buy/partner mix. This one binds them into a calendar with milestones and explicit ROI commitments.

## Audience and prerequisites

Track 2 audience. Briefings 2.1, 2.2, and 2.3 strongly recommended.

## Decision prompt

> **Which starter project do we fund first, and what's the quarterly milestone plan?**

A specific Phase 6 starter project is named, with a sponsor, an approximate budget, a target quarter for first deployment, and three quarterly milestones to track against.

## Pre-read (5 min)

- Decision memos from Briefings 2.1–2.3.
- The current intake-form submissions (top 5–8 candidates from Track 1 cohorts so far).
- The four [Phase 6 starter project archetypes](/phase-6-starter-projects/) with their architecture briefs.

## 30-minute substance

### Topic 1 — The 12-month roadmap in one slide (10 min)

Walk through the phased plan from this guide:

- **Phase 1 — Governance.** Months 1–3. Charter, AUP, tier matrix, procurement addendum, compliance navigator. Output: governance is operational.
- **Phase 2 — Culture & Education.** Months 1–12 (parallel). Tracks 1, 7 land first; Track 4 follows in Months 4–7. Output: shared vocabulary, intake pipeline, manager confidence.
- **Phase 3 — Infrastructure.** Months 3–6. Cloud sandbox, SSO, CI/CD, secrets, observability. Output: the place where AI applications run safely.
- **Phase 4 — Dev Stack.** Months 4–7. Stack selection, coding standards, AI-assisted dev. Output: how applications get built consistently.
- **Phase 5 — Modular Platform.** Months 5–9. Reusable modules (auth, data grid, AI orchestration, RBAC, doc render). Output: 70% of any new application is already written.
- **Phase 6 — Starter Project.** Months 7–12. The first production AI application — uses all five prior phases. Output: visible value, story to tell, basis for Year 2 funding.

The framing point: phases overlap deliberately. Sequential delivery would take two years. Parallel delivery with explicit dependencies takes one.

### Topic 2 — Quarterly milestones (10 min)

Twelve months is too long a horizon for executive review. Quarter-by-quarter:

- **Q1 (Months 1–3).** Governance signed, AI Review Committee chartered, intake pipeline open, first Track 1 cohort completed, infrastructure provisioning begun.
- **Q2 (Months 4–6).** First Tier-2 use case approved and deployed (a quick win from Briefing 2.1). Phase 3 infrastructure live. First developer cohort begins Track 4. Intake pipeline producing 10+ ideas / month.
- **Q3 (Months 7–9).** First starter project in user testing. Two more Tier-2 use cases live. Domain Labs (Track 6) running across at least three departments. Engagement pulse at Month 9.
- **Q4 (Months 10–12).** Starter project in production. Year 2 plan ratified. Month 13 handoff plan signed. Year 1 retrospective.

Each milestone is a check-in, not just a status report. If a milestone slips, the executive team adjusts the plan — not the rhetoric. The most common failure is staying "on track" verbally while material reality drifts.

### Topic 3 — Choosing the first starter project (10 min)

The four archetypes from [Phase 6](/phase-6-starter-projects/):

1. **Document Intelligence.** RAG-style search across an agency corpus, plus document rendering and extraction. High ROI, well-understood pattern, broadly applicable.
2. **Conversational AI.** Role-based chatbot or assistant with tool use. Higher Tier risk; appropriate for some agencies, premature for most.
3. **Workflow Automation.** Document routing, classification, approval chains. Strong ROI in agencies with high-volume forms processing.
4. **Data Dashboard.** NL-to-SQL with visualization. Useful for agencies with mature data warehouses and weak self-service analytics; otherwise premature.

Most agencies should pick **Document Intelligence** as the first starter project. It compounds across departments, ships faster than the alternatives, and the failure mode (a wrong search result) is less consequential than the alternatives.

The decision is informed by the intake submissions: pick the archetype that addresses the largest cluster of submitted use cases. Don't pick by vendor pitch; pick by demonstrated demand.

## 20-minute structured discussion

1. **Walk the milestones.** For each quarter, the room confirms feasibility against staff capacity, holiday schedules, election cycles, and the budget calendar.
2. **Pick the starter project.** Discuss the four archetypes, weighted against the intake-pipeline data. Make the decision.
3. **Name the sponsors.** Each Phase needs a sponsor — typically a director, occasionally a deputy. Naming them now gives the AI program lead someone to call when a phase hits a blocker.

## 10-minute decision close

The chair states the four decisions in writing:

1. The starter project archetype (and specifically: which use case from the intake queue).
2. The Q1–Q4 milestone calendar.
3. The Phase sponsors, by name.
4. The recurring cadence for Track 2 follow-up briefings (typically quarterly, 30 minutes, ahead of each milestone).

The takeaway memo is distributed within 48 hours and becomes the agency's AI program plan-of-record.

## Common questions and how to handle them

- **"Can we ship the starter project in 6 months instead of 12?"** Sometimes. If Phase 1 governance is mature, Phase 3 infrastructure is reusable from prior work, and the use case is genuinely Tier-1, six months is achievable. For most agencies, a serious Phase 6 deployment in less than 9 months exposes the program to risk that wasn't present before.
- **"What if the starter project fails?"** Define "fail" before deploying. Most starter projects are evaluated by adoption (do staff use it?), accuracy (is the output correct enough often enough?), and total cost (is the run rate within projection?). Failure on any one is a signal to iterate, not to stop. Failure on all three is a signal to pivot to a different use case from the queue.
- **"How do we measure ROI?"** A plain-language summary: time saved on a measured workflow, number of intake submissions converted to live deployments, engagement-pulse trend, and (for Tier-2) the cost-per-use compared to the manual baseline. Avoid synthetic ROI calculations the agency cannot defend in a budget hearing.
- **"What if I leave or get reassigned mid-program?"** The Month 13 handoff plan addresses this. The plan-of-record memo from this briefing lives in the AI program inventory and survives executive churn. Successors brief from the memo, not the chair's memory.

## Materials

- Pre-read: prior decision memos + intake queue + Phase 6 archetypes.
- Slide outline (12–15 slides).
- Decision capture template.
- The 12-month milestone calendar template.

## Async fallback

- 12-minute recorded video covering Topics 1–3.
- 1-page brief.
- The four-archetype comparison sheet.
- 30-minute office hour with the AI program lead to make the starter-project decision.

## Related

- [Track 2 overview](/phase-2-education/track-2-leadership/) — the full track context
- [Phase 6 — Starter Projects](/phase-6-starter-projects/) — the archetypes referenced in Topic 3
- [Sustainability Playbook](/phase-2-education/sustainability/) — the Month 13 handoff plan

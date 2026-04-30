---
title: "Case Study: Mid-Size City Public Health"
description: A mid-size city public health department (~280K residents, 8 IT staff) shipped a Tier-2 RAG chatbot in 11 months and a full platform foundation in Year 2.
sidebar:
  order: 10
---

> **Composite case study.** This narrative is built from interviews with two mid-size public health engagements; the agency name is fictional, the numbers are representative.

> **What to copy.** Start with a named business owner, a real document corpus, and evaluation cases reviewed by domain staff before public launch.
>
> **What to avoid.** Do not assume an existing procurement vehicle is "done" until your procurement office has confirmed the exact AI use and contract terms.

## Agency profile

- **Archetype:** City public health department, mid-size Pacific Northwest city
- **Population:** ~280,000 residents
- **IT staff:** 8 (1 director, 2 platform engineers, 2 application developers, 2 desktop / network, 1 cybersecurity analyst)
- **Existing tech:** AWS-hosted constituent-services portal, Okta SSO, Snowflake data warehouse, internal wiki on Confluence
- **Year-1 AI budget:** ~$650,000 (vendor SaaS + cloud + 1.5 dedicated FTE)
- **Trigger:** State law requiring public-facing AI disclosures; an existing back-office automation initiative needed an AI-aware refresh

## Where they started

Pre-engagement readiness scorecard came in at **Level 2 (Walk) overall**. They had cybersecurity baselines, an SSO, and a halfway-respectable CI/CD pipeline. What they didn't have: an AI Review Committee, an AUP that addressed generative AI, or any agreement on how the data team and the application team should share a model. Three internal teams had separate ChatGPT Team subscriptions. None of the spend was tracked.

The opening conversation was, encouragingly, between the IT director and the public health director — not just the IT director and the city manager. The public health director showed up with a specific use case in mind: a chatbot that answers questions about clinic hours, vaccine availability, and benefits eligibility, in English and Spanish, citing source documents.

## What they did

### Phase 1 — Governance (Months 1–3)

- **Stood up an AI Review Committee** with seven members: public health director (chair), IT director, city attorney's representative, equity officer, public information officer, plus two rotating department heads. Bi-weekly during launch quarter, monthly thereafter.
- **Adopted an Acceptable Use Policy** via the [AUP Wizard](/phase-1-governance/acceptable-use-policy/). Notable customization: PII rules incorporated HIPAA verbatim because the public health context made HIPAA load-bearing.
- **Signed a Procurement Addendum** ([template here](/phase-1-governance/procurement-guardrails/)) with their preferred vendor before any production deployment. Sections A and B for the chatbot vendor, plus an extra clause on bias monitoring lifted from Section C because the use case touched benefits eligibility.
- **Classified the chatbot use case as Tier 2** via the [Risk Tier Determination](/phase-1-governance/risk-classification/) — public-facing but advisory only, with humans available via the same chat for any question the bot couldn't answer with high confidence.

### Phase 2 — Education (Months 2–5, overlapping)

- Ran Foundations training for all 312 department staff over six weeks (90-minute sessions, four delivery slots per week).
- Ran the [Leadership Briefing](/phase-2-education/track-2-leadership/) for the City Council and the public health board.
- Ran [Track 4 Developer Upskilling](/phase-2-education/track-4-developers/) for the eight IT staff plus two embedded data analysts. This was the first time the data and application teams had ever been in the same training together.
- Started a Champions cohort: five staff across clinics, the call center, and benefits enrollment. The cohort met monthly and produced the first three use-case intake submissions.

### Phase 3 — Infrastructure (Months 3–6, overlapping)

- Stood up a separate AWS account for AI workloads, segregated from the existing portal account, with a $5K/month budget cap and an alarm at 80%.
- Adopted [observability via OpenTelemetry](/phase-3-infrastructure/observability/) for the chatbot's request path before any production traffic hit it.
- Signed a Bedrock + Pinecone-equivalent stack contract through the state's existing cloud cooperative — saved 7 weeks of procurement vs going direct.

### Phase 4 — Dev Stack (Months 5–7)

- Adopted [hexagonal architecture](/phase-4-dev-stack/api-first-design/) for the chatbot service so the LLM provider was swappable behind a clean interface (this paid off in Month 9 when they switched providers for cost).
- Wrote two ADRs ([template](/phase-4-dev-stack/adr-template/)): one on retrieval strategy (semantic + keyword hybrid) and one on safety (refuse + escalate to human if confidence < 0.7).
- Built an evaluation harness with 240 ground-truth Q&A pairs reviewed by clinic staff before any user testing.

### Phase 5 — Platform modules (Months 6–11)

- Shipped only two modules in Year 1 — [auth](/phase-5-platform/auth-module/) (built on top of existing Okta) and [AI orchestration](/phase-5-platform/ai-orchestration-module/) (the chatbot's runtime). The other five modules were deferred to Year 2.
- Inner-source decision intentionally postponed: they kept the modules in a single repository, owned by the AI platform team, until Year 2 when they had three internal consumers.

### Phase 6 — Starter project (Months 8–11)

- Picked the [RAG chatbot archetype](/phase-6-starter-projects/archetype-rag-chatbot/) — which mapped 1:1 to the use case the public health director arrived with on Day 1.
- Beta tested for 6 weeks with 40 staff before public launch.
- Public launch in Month 11, with a contestation pathway live from Day 1 ("flag this answer" + escalation queue).

## Year-1 outcomes

| Metric                                                 | Result                                                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Readiness score                                        | 14 → 28 (Level 2 → Level 3)                                                                      |
| Tier-2 production apps                                 | 1 (chatbot)                                                                                      |
| Tier-3 production apps                                 | 0 (deferred to Year 2)                                                                           |
| Platform modules live                                  | 2 of 7                                                                                           |
| Champions cohort                                       | 5 → 9 staff                                                                                      |
| Chatbot daily active users (Q4)                        | 880, ~22% of relevant staff caseload                                                             |
| Containment rate (chatbot answered without escalation) | 64% in Month 11; target of 70% set for Month 14                                                  |
| Contested answers                                      | 41 (all reviewed; 3 led to corrections in source documents, 1 led to a chatbot guardrail change) |
| Legal complaints / equity flags                        | 0                                                                                                |

## Where it nearly went sideways

- **The procurement vehicle was the timeline.** The state cloud cooperative saved seven weeks against a direct procurement, but the _application of_ the cooperative was a four-week back-and-forth with their procurement office. They almost slipped the Q3 deadline before the IT director escalated to the deputy city manager.
- **Champion cohort almost stalled in Month 5** when one champion left for the private sector. The Phase 2 [sustainability playbook](/phase-2-education/sustainability/) had specifically called this out as a risk — they replaced the champion within three weeks, but the cohort lost momentum during the gap.
- **Eval harness was almost an afterthought.** They started building it in Month 6 (two months after the chatbot service was scaffolded), and only because the equity officer asked, in a Review Committee meeting, "how are we measuring whether the answers are equally accurate for Spanish-language questions?" That question changed the launch criteria.

## What they would do differently

- **Build the eval harness in Month 1, not Month 6.** Their best lever for Year-2 quality work would be more eval data, and they wish they had started earlier — even with hand-curated examples that they later replaced.
- **Smaller, more frequent ROI re-runs.** They ran the [ROI Calculator](/resources/roi-calculator/) at Month 0 and Month 12 only. Re-running at 3, 6, and 9 months would have caught the Q3 budget over-run earlier (cloud spend was 1.7× the projection in Q3 because of an inefficient retrieval pattern — they fixed it but lost two weeks of payback period).
- **Defer fewer platform modules.** Two of the five deferred modules (admin dashboard, RBAC) ended up being re-built awkwardly inside the chatbot service, then re-extracted in Year 2 at higher cost. Better to ship a thin v1 of all five than a finished v1 of two.

## What Year 2 looks like

Year 2 (currently underway) targets: a second Tier-2 production app (call-center note summarization), four more platform modules in production, inner-source kicked off with two internal consumers, and a public quarterly report on chatbot containment rate + contested-answer trends.

## See also

- [Quarterly milestone report template](/resources/quarterly-report/) — the format used for the public health director's reports to the council
- [Procurement guardrails](/phase-1-governance/procurement-guardrails/) — the addendum used with the chatbot vendor
- [RAG chatbot archetype](/phase-6-starter-projects/archetype-rag-chatbot/) — the starter project this case study completed

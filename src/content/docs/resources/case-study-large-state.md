---
title: "Case Study: State Revenue Department"
description: A state revenue / tax department (~6M residents served, 60+ IT staff) shipped two Tier-2 production apps and four platform modules in Year 1, with inner-source kicked off in Year 2.
sidebar:
  order: 11
---

> **Composite case study.** This narrative is built from interviews with two state revenue / tax engagements and one large state benefits-administration engagement; the agency name is fictional, the numbers are representative.

> **What to copy.** Use quarterly reporting, module ownership, and a visible AI official to turn a political deadline into an operating system.
>
> **What to avoid.** Do not let scale become permission to skip sequencing; this case worked because governance, education, infrastructure, and platform work moved in parallel with explicit owners.

## Agency profile

- **Archetype:** State department of revenue / tax
- **Population served:** ~6,000,000 residents and ~340,000 registered businesses
- **IT staff:** 60+ across application development, platform, security, and data
- **Existing tech:** Multi-cloud (Azure primary, AWS secondary), Active Directory federated to a state-level identity provider, mainframe-of-record for tax filings, separate fraud-detection ML platform from a 2019 vendor engagement
- **Year-1 AI budget:** ~$3.2M (vendor + cloud + 6 dedicated FTE + change management)
- **Trigger:** A state AI Act with a 2027 compliance deadline; a fraud-detection vendor that was about to go end-of-support; legislative pressure to "show progress on AI" with public quarterly reports

## Where they started

Pre-engagement readiness scorecard came in at **Level 2 (Walk) overall**, with strong scores in Infrastructure (5/6) and Security (4/6) but Level 1 in Governance and Education. They had a sophisticated platform team already running shared services, but had no agency-wide AI governance, and the existing fraud ML model was a black box even to the people maintaining it.

The opening conversation was unusually political: the state CIO had committed publicly to a "responsible AI program" with quarterly reports to the legislature, and the department had three months to define what "responsible AI program" meant before the first report.

## What they did

### Phase 1 — Governance (Months 1–3)

- **Stood up an AI Review Committee** with eleven members: deputy commissioner (chair), CIO, chief data officer, equity officer, chief information security officer, the agency's privacy officer, deputy attorney general, plus four rotating subject-matter experts. Weekly during the first quarter, then bi-weekly.
- **Designated an Agency AI Official** per [OMB M-24-10](/resources/frameworks-cited/) before the federal mandate technically applied to a state agency, because the statewide AI Act adopted similar language. M-24-10 has since been superseded by M-25-21 (April 2025); the agency's designation and inventory practices carried over.
- **Adopted a layered classification on top of the playbook's three risk tiers.** The 3-tier risk model used elsewhere in this guide is canonical. The "Tier 4" framing below is the **legal-boundary layer** described in [Phase 1: Large-agency extension](/phase-1-governance/#large-agency-extension-legal-boundary-layer). It is orthogonal to the risk tiers, not a replacement for them. The agency kept Tier 3 as a "high impact" risk band and added a separate "prohibited absent specific legislative authorization" label that any use case can carry alongside its risk tier. Predictive policing, individualized eligibility-denial models, and any model used to assess criminal liability carried that label by default.
- **Inventoried all existing AI/ML systems** (the fraud-detection model + 14 smaller models scattered across the agency) and re-classified each. Two were reclassified up to Tier 3 and required a 30-day remediation plan.
- **Adopted a Procurement Addendum** ([template](/phase-1-governance/procurement-guardrails/)) and made it mandatory for any contract that touched AI, including renewals of pre-AI contracts where the vendor had since added AI features.

### Phase 2 — Education (Months 2–7, overlapping)

- Ran Foundations training for all 1,400 department staff over four months. Async-first delivery (LMS) with quarterly in-person Q&A sessions per regional office.
- Ran [Track 7 Middle Manager Enablement](/phase-2-education/track-7-middle-managers/) for all 78 middle managers; the first track they ran, intentionally, because the middle managers had been the loudest source of "this AI thing is being done _to_ us" sentiment in pre-engagement interviews.
- Ran an executive briefing for the legislative oversight committee. This was politically sensitive and used a heavily redacted version of the Tier-3 use cases.

### Phase 3 — Infrastructure (Months 3–7)

- Established a dedicated AI subscription / account in Azure, with budget controls, network egress restrictions, and a separate identity boundary from production data systems.
- Adopted [SLSA Level 2](/resources/frameworks-cited/) for AI service supply chain, chosen because the legislative oversight wanted explicit supply-chain attestations.
- Built a [secrets management](/phase-3-infrastructure/secrets-management/) pattern for vendor API keys before any vendor key was minted.
- Wired observability with OpenTelemetry traces tagged with use-case ID, so the data team could attribute cloud cost to specific use cases without manual reconciliation.

### Phase 4 — Dev Stack (Months 4–8)

- Standardized on a Python + TypeScript stack ([decision tree](/phase-4-dev-stack/stack-selection/)) over the dissent of one team that wanted Java; documented the dissent in an [ADR](/phase-4-dev-stack/adr-template/) per the playbook.
- Built a shared evaluation harness with 1,200 ground-truth examples per use case, sampled to over-represent edge cases that legal had previously flagged as risk areas.
- Adopted [hexagonal architecture](/phase-4-dev-stack/api-first-design/) as the default for new services. Two existing services were refactored to fit the boundary so they could share AI-orchestration plumbing.

### Phase 5 — Platform modules (Months 5–12)

- Shipped four modules in Year 1: [auth](/phase-5-platform/auth-module/), [AI orchestration](/phase-5-platform/ai-orchestration-module/), [API framework](/phase-5-platform/api-framework-module/), and [admin dashboard](/phase-5-platform/admin-dashboard-module/). RBAC, data-grid, and document-rendering deferred to Year 2.
- Established a platform team distinct from the application teams, with a written charter on contribution boundaries (informed by the [inner-source guide](/phase-5-platform/inner-source/) but not yet open inner-source; that was deferred to Year 2 once the platform team was confident in stability).
- Set up a [module catalog and IDP](/phase-5-platform/idp-and-registry/) using Backstage with a custom plugin for AI-specific metadata (model name, evaluation set version, last fairness assessment date).

### Phase 6 — Starter projects (Months 7–12)

- Shipped two production starter projects:
  1. **A taxpayer-facing FAQ chatbot** ([RAG archetype](/phase-6-starter-projects/archetype-rag-chatbot/)): Tier 2, advisory only, with hand-off to a human agent for any answer the model declined to answer with high confidence. Live in Month 10.
  2. **An internal back-office form-classifier** ([document intelligence archetype](/phase-6-starter-projects/archetype-document-intelligence/)): Tier 2, decision-support for staff sorting incoming filings. Live in Month 11.
- Replaced the legacy fraud-detection model in Month 12 with a re-engineered model running on the new platform: Tier 3 use case, with a contestation pathway, public model card, and quarterly bias re-evaluation built into the production deployment.

## Year-1 outcomes

| Metric                                         | Result                                                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Readiness score                                | 16 → 32 (Level 2 → Level 4 in Governance, Infrastructure, and Platform; Level 3 in Education and Starter Projects) |
| Tier-2 production apps                         | 2 (FAQ chatbot, form classifier)                                                                                   |
| Tier-3 production apps                         | 1 (re-engineered fraud detection)                                                                                  |
| Platform modules live                          | 4 of 7                                                                                                             |
| Staff trained on AI Foundations                | 1,400 / 1,400 (100%)                                                                                               |
| Public quarterly reports filed                 | 4, on time                                                                                                         |
| Legislative inquiries about specific use cases | 11; all answered with the playbook's quarterly report format and no escalation                                     |
| FAQ chatbot containment rate (Q4)              | 71%, beat target by 1 point                                                                                        |
| Form classifier accuracy on held-out set       | 94.2%, with a 96.1% target for Year 2                                                                              |
| Fraud-detection model false-positive rate      | down 31% vs the legacy model on the same evaluation set                                                            |
| Cost vs initial Year-1 estimate                | 109% (came in 9% over because of a Q3 surge in chatbot traffic that required compute headroom)                     |

## Where it nearly went sideways

- **Tier 4 took longer to write than the rest of the policy combined.** Legal and the equity officer disagreed about which use cases belonged in Tier 4 vs Tier 3, and a draft list was leaked to a legislator who ran with a public statement before the policy was final. The Review Committee's first emergency meeting was about Tier 4, not about a use case.
- **Inner-source decision deferred under pressure.** The state CTO wanted public inner-source from Day 1 for political optics. The platform lead pushed back and won the argument, but it cost three weeks and a difficult conversation with the CTO's office. They ended up writing an explicit memo on _why_ inner-source needed to wait; that memo became the basis for the [inner-source guide](/phase-5-platform/inner-source/) section on readiness criteria.
- **Vendor lock-in nearly happened twice.** Once with the chatbot vendor (mitigated by hexagonal architecture and a swap clause in the procurement addendum). Once with the model evaluation tooling (not mitigated quickly enough; they're still in a 30-day notice contract instead of month-to-month).

## What they would do differently

- **Define Tier 4 in writing before any Review Committee meeting.** They tried to define it in committee and got stuck. Pre-writing a Tier 4 policy and bringing it for ratification would have been less politically fragile.
- **Hire the equity officer earlier.** The equity officer was hired in Month 4 and was instrumental, but the first three months would have been smoother with that voice in the room. They now recommend the equity officer hire be a Month 1 deliverable for any large agency engagement.
- **Run the [ROI Calculator](/resources/roi-calculator/) per use case, not in aggregate.** They ran one aggregate ROI in Month 0 and one in Month 12. Per-use-case ROI tracking would have caught the chatbot compute over-run earlier, and would have made the Year 2 budget request to the legislature more defensible (legislators want to see one calculation per appropriation line, not a roll-up).

## What Year 2 looks like

Year 2 targets: three more platform modules live, public inner-source kickoff with at least one external (other state agency) consumer, two more Tier-2 production apps, the first agency-wide AI workforce study (the federal AI Workforce report-out is now mandatory under the agency's adopted policy, originally aligned to M-24-10 and updated when M-25-21 superseded it in April 2025), and a defended Year-3 budget request that ties every dollar to a measurable outcome from the prior 24 months.

## See also

- [Inner-source guide](/phase-5-platform/inner-source/): the readiness-criteria memo from this engagement informs this section
- [OMB M-25-21 in Frameworks Cited](/resources/frameworks-cited/): current memorandum (April 2025; supersedes M-24-10, the version this agency adopted ahead of the original federal mandate)
- [Quarterly milestone report template](/resources/quarterly-report/): the format used for legislative reports

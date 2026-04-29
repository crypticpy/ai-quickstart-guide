---
title: "Case Study: Small County Clerk"
description: A rural county clerk's office (~28K residents, 2 IT staff) ran the playbook's governance phase, then off-ramped at Phase 2 with a complete standalone outcome.
sidebar:
  order: 4
---

> **Composite case study.** This narrative is built from interviews with three small-county engagements; the agency name is fictional, the numbers are representative.

## Agency profile

- **Archetype:** County clerk's office, rural Midwest
- **Population:** ~28,000 residents across 14 townships
- **IT staff:** 2 (one director, one network/desktop generalist)
- **Existing tech:** On-prem records system from 2014, county-licensed Microsoft 365, no public-facing web apps beyond a brochure site
- **Year-1 AI budget:** ~$120,000 (the smallest budget the playbook is calibrated for)
- **Trigger:** Texas-style state law on the horizon, plus a council member who used ChatGPT once and started asking pointed questions at the next meeting

## Where they started

Pre-engagement readiness scorecard came in at **Level 1 (Crawl) overall**, with the lowest scores in Governance (0/6) and Infrastructure (0/6). The director had heard of NIST AI RMF but had never read it. There was no AI use-case intake, no list of approved AI tools, and three departments were already pasting constituent-facing language into a free LLM "to clean it up." Two of them were sending PII without realizing it.

The opening conversation between the IT director and the county administrator wasn't about strategy — it was about whether to ban LLMs outright. They settled on "neither ban nor permit until we have a written policy."

## What they did

### Months 1–3: Governance only

- **Adopted an Acceptable Use Policy** using the [AUP Wizard](/phase-1-governance/acceptable-use-policy/), with one substantive modification: PII / PHI rules were tightened to match their existing records-management policy. Approved by the County Board at the regular monthly meeting after a 20-minute presentation.
- **Stood up an AI Review Committee** with five members: county administrator (chair), IT director, county attorney, HR director, and a rotating department head. Quarterly cadence, with an emergency-meeting clause that was never triggered.
- **Built an approved-tools list** with three Tier-1 entries (Microsoft Copilot for the M365 license they already owned, Grammarly Business, and a transcription tool for the meeting clerk). Everything else was prohibited pending review.
- **Skipped the Tier-2 / Tier-3 pathway entirely** in Year 1. They documented the [Risk Tier Determination](/phase-1-governance/risk-classification/) framework in policy but did not approve any Tier-2 or Tier-3 use cases.

### Months 4–6: Foundations training only

- Ran [Track 1: AI Foundations](/phase-2-education/track-1-foundations/) for all 47 county employees. One in-person session per department, 90 minutes, delivered by the IT director with materials lifted directly from the curriculum map.
- Ran [Track 2: Leadership Briefing](/phase-2-education/track-2-leadership/) for the County Board (one 60-minute session at a regular meeting).
- Ran the [Job-Impact Messaging](/phase-2-education/job-impact-messaging/) script in two departments (clerk's office and assessor's office) where staff were specifically anxious about replacement. Anxiety dropped from 7/10 to 3/10 on a follow-up survey.

### Month 7 (the off-ramp decision)

- Re-ran the [ROI Calculator](/resources/roi-calculator/) with realistic numbers for a single Tier-2 use case (constituent-call summarization). Net annual benefit came in at **$11,400** with a payback period of **18 months** — too thin to justify the procurement and operating overhead for a 2-person IT team that was already running 110% capacity.
- Decision: **off-ramp at Phase 2**. Year 1 ends with governance adopted and staff trained. Phase 3 is deferred to Year 2 _if_ a use case with cleaner ROI emerges.

## Year-1 outcomes

| Metric                                  | Result                                                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Readiness score                         | 6 → 14 (Level 1 → Level 2 in Governance + Education)                                                                                  |
| Tier-2 / Tier-3 production apps         | 0 (intentional)                                                                                                                       |
| Approved-tools list                     | 3 entries, all Tier 1                                                                                                                 |
| Staff trained on AI Foundations         | 47 / 47 (100%)                                                                                                                        |
| Policy violations / shadow-AI incidents | 6 in Q1 → 1 in Q4 (clear downward trend after the AUP rolled out)                                                                     |
| Council confidence rating               | "We don't know what we're doing" → "We have a policy, we know who decides, and we'll come back when we have a use case worth funding" |

## Why the off-ramp was the right call

The thing that nearly broke this engagement was the assumption — held by the council member, not the IT director — that "doing AI" required shipping production AI in Year 1. The off-ramp framing in the PRD gave the IT director a defensible answer to "but where's our chatbot?" The County Board accepted it because they could see, in writing, what they _had_ gotten: a policy, a committee, training, an approved-tools list, and a list of disallowed shadow-AI behaviors that staff were now actively avoiding.

The county is now better positioned for Year 2 than the medium-city case study was at the same point — because they have an intake pipeline waiting for the first defensible use case, instead of a half-built deployment that cost more to maintain than to operate.

## What they would do differently

- **Run the Foundations training before the AUP, not after.** They ran AUP first because they were nervous about ongoing PII leakage, and three departments rolled their eyes through training because they already felt overregulated. Reversing the order would have made the policy land softer.
- **Spend more on the change-management script.** They under-invested in the [Job-Impact Messaging](/phase-2-education/job-impact-messaging/) script and only ran it in the two anxious departments — the assessor's office got it second-hand and the resentment lingered.
- **Pre-write the off-ramp memo.** They drafted the off-ramp justification at the end of Month 6 under time pressure. Pre-writing a "what 'good' looks like at Phase 2" memo at the start of the engagement would have let the County Board pre-commit to off-ramp criteria.

## What the next 12 months look like

The Year 2 plan is conservative: monitor the use-case intake (target: 2 candidate use cases per quarter), re-run readiness assessment annually, attend the state's AI working group, and budget $0 of new AI spend until a Tier-2 use case clears the Review Committee with an ROI better than 12-month payback.

## See also

- [Quarterly milestone report template](/resources/quarterly-report/) — the format the County Board now expects
- [ROI Calculator](/resources/roi-calculator/) — the calculation that justified the off-ramp
- [Off-Ramp framing in the PRD](/resources/frameworks-cited/) — why this kind of deliberate stop is a feature, not a failure

---
title: Completed Examples
description: Filled examples for common AI governance, intake, ROI, reporting, and production readiness artifacts.
sidebar:
  order: 3
---

These examples show the level of specificity reviewers should expect. They are intentionally short. Use them as models, not as legal or procurement approval.

## AUP example

Example excerpt from a completed AI Acceptable Use Policy. Build the actual policy from the [AUP wizard](/phase-1-governance/acceptable-use-policy/).

```markdown
# City of Riverton AI Acceptable Use Policy

Effective date: July 1, 2026
Approving body: City Manager
Policy owner: AI Review Committee
Applies to: Employees, contractors, interns, and vendors handling city data
Applicable law: State AI Accountability Act; public records law; city privacy policy

## Approved use

Staff may use tools on the Approved AI Tools List for drafting, summarization, translation support, code assistance, and policy search when the use matches the listed data class and risk tier.

## Prohibited use

Staff may not use personal AI accounts for city data. Staff may not use AI to make final decisions about benefits, enforcement, permits, employment, eligibility, public safety, or legal rights unless the use has been classified, approved, publicly noticed if required, and assigned a human decision-maker.

## Data rule

Confidential or regulated data may be entered only into approved tools with logging, access control, retention, and contract terms approved for that data class.

## Accountability

The human staff member using AI remains responsible for the final work product. AI output must be reviewed before it is sent, filed, published, or used to support a decision.
```

## Risk tier example

```markdown
# Risk Tier Record

Use case: Permit counter policy search assistant
Sponsor: Development Services Director
Date reviewed: August 12, 2026
Initial tier: Tier 2
Final tier: Tier 2

## Facts

The tool searches adopted permit code, fee schedules, and internal procedure manuals. Counter staff use the answer to respond to applicant questions. It does not approve, deny, or score permits. Staff must cite the source section and can override the answer.

## Tier rationale

This is not Tier 1 because a wrong answer could delay an applicant or create inconsistent service. It is not Tier 3 because it does not make or recommend a final rights, benefits, enforcement, or safety decision.

## Required controls

- Approved tool only.
- Source citations shown with every answer.
- Staff review before sending to applicants.
- Monthly sample review of 30 answers.
- Public-facing disclaimer if answers are emailed externally.

Committee decision: Approved for 90-day pilot.
```

## Intake submission example

```markdown
# AI Use Case Intake

Use case name: Constituent email first-draft responses
Sponsor: Ana Patel, Director of Constituent Services
Department: Mayor's Office
Submitted: June 6, 2026

## Problem

The team receives 450-600 emails per week. About 40% are routine status, referral, or information requests. Staff spend 18-22 hours per week drafting similar first responses.

## Proposed use

Use an approved AI drafting tool to generate first drafts from an email category, approved response snippets, and current referral contacts. Staff will review, edit, and send every response.

## Audience

Public-facing email responses to residents.

## Decision impact

No automated decision. The tool drafts language only. Staff choose the response and remain accountable.

## Data

Resident names, email addresses, and issue descriptions. No SSNs, payment data, health data, benefits records, or law-enforcement data.

Requested outcome: 30% reduction in drafting time with no increase in correction complaints.
Proposed tier: Tier 2.
```

## ROI estimate example

```markdown
# ROI Estimate

Use case: Constituent email first-draft responses
Prepared: June 14, 2026
Period: Year 1

## Costs

- SaaS licenses: $18,000
- Implementation staff time: $24,000
- Training and change management: $8,000
- Legal/procurement review: $5,000
- Ongoing operations: $12,000

Total Year 1 cost: $67,000

## Benefits

- Staff hours saved: 14 hours/week
- Loaded hourly rate: $62
- Annual labor capacity value: $45,136
- Avoided rework/escalation: $9,000
- Throughput value from faster responses: $18,000

Total annual benefit: $72,136

## Result

Net Year 1 benefit: $5,136
Payback period: 11.1 months
Sensitivity case at 50% savings: payback extends beyond Year 1.

Recommendation: Proceed only if the pilot confirms at least 10 hours/week saved for four consecutive weeks.
```

## Quarterly report example

```markdown
# Riverton AI Program - Quarterly Report, 2026 Q3

Prepared by: Maya Chen, AI Program Lead
For: City Manager
Period covered: July 1-September 30, 2026

## TL;DR

The program cleared G-03: Governance Framework Adopted. Training reached 214 staff, the review committee approved two Tier-2 pilots, and no policy incidents were reported. The main risk is procurement delay for the approved drafting tool.

## Headline numbers

| Metric | This quarter | Plan |
| ------ | ------------ | ---- |
| Use cases in production | 0 | 0 |
| Use cases in pilot | 2 | 2 |
| Net annual benefit estimated | $118,000 | $100,000 |
| Cumulative spend | $76,000 | $85,000 |
| Staff trained | 214 / 400 | 200 / 400 |
| Policy incidents | 0 | 0 |

## What shipped

- AUP signed by the City Manager on July 8.
- Approved AI Tools List published with three tools.
- Review Committee met four times and classified six submissions.
- Constituent email and permit search pilots approved for Tier 2.

## Risks

| Risk | Probability | Impact | Owner | Mitigation |
| ---- | ----------- | ------ | ----- | ---------- |
| Procurement delay for drafting tool | Medium | Medium | Procurement Manager | Use existing approved tool for pilot while contract terms are finalized. |
| Manager capacity for coaching | High | Medium | HR Director | Add two Track 7 sessions in October. |

## Asks

1. Approve temporary use of the existing enterprise AI license for the email pilot by October 15.
2. Ask department heads to nominate one champion each by October 20.
```

## Production readiness gate example

```markdown
# Production Readiness Gate

Project: Permit policy search assistant
Risk tier: Tier 2
Business owner: Development Services Director
Technical owner: Platform Lead
Review date: March 18, 2027
Target launch: April 7, 2027

| Criterion | Status | Evidence |
| --------- | ------ | -------- |
| Real users named | Green | 18 permit counter staff listed in launch memo. |
| Eval thresholds enforced | Green | CI blocks deploy below 85% grounded-answer score. |
| On-call tested | Green | Test page acknowledged in 4 minutes on March 12. |
| Cost measured | Yellow | Expected monthly cost is $1,900 against $2,500 budget; alert not yet configured. |
| Audit log reviewed | Green | Records officer approved schema and 1-year retention. |
| Rollback rehearsed | Green | Staging rollback completed in 9 minutes. |
| Feedback monitored | Green | Feedback routes to ServiceNow queue with 2-day SLA. |
| Retirement condition documented | Green | Retire if usage is below 50 weekly searches for two quarters. |

Decision: Conditional go.

Condition: Cost alert at 80% and 100% of monthly budget must be configured before launch. Owner: Platform Lead. Due: March 25, 2027.

Sign-offs:

- Business owner: Luis Romero, March 18, 2027
- Technical lead: Priya Nair, March 18, 2027
- Security/privacy reviewer: Omar Bell, March 19, 2027
- AI Review Committee chair: Elena Torres, March 20, 2027
```

## See also

- [Template Library](/resources/template-library/) - blank versions of these artifacts.
- [ROI Calculator](/resources/roi-calculator/) - interactive ROI estimate export.
- [Production Readiness Checklist](/phase-6-starter-projects/production-readiness/) - full gate criteria.

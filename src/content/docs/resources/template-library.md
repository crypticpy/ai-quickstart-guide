---
title: Template Library
description: Copy-ready AI program artifacts for launch, governance, procurement, manager coaching, budget approval, and production sign-off.
sidebar:
  order: 2
---

Use these templates when you need a practical starting point faster than a blank page. Replace every bracketed placeholder, delete anything that does not apply, and route the final version through your agency's normal legal, HR, procurement, or communications review.

## Leadership commitment letter

Use before Phase 2 training starts. Pair this with the [Job-Impact Messaging Kit](/phase-2-education/job-impact-messaging/).

```markdown
TO: All [Agency] staff
FROM: [Executive sponsor name, title]
DATE: [Month day, year]
SUBJECT: Our commitment to staff during the AI program

[Agency] is starting a 12-month AI program to help staff improve service quality, reduce repetitive work, and manage growing demand. This program is not a headcount-reduction plan.

From [start date] through [end date], no employee will be separated from [Agency] because their work has been automated by AI. If a workflow changes substantially, affected staff will receive training and reassignment support before any role changes are made.

Time saved through approved AI tools will be directed to higher-value work: better public service, faster follow-up, improved quality review, and work staff have not had enough time to do well.

Staff are expected to use only approved AI tools, follow the AI Acceptable Use Policy, report concerns, and help identify workflows where AI could help. We will review program progress every quarter and will pause any use that creates unacceptable privacy, equity, legal, or operational risk.

Questions or concerns may be raised with [program lead], [HR contact], or [confidential reporting contact].

[Signature]
[Name, title]
```

## Approved AI tools list

Publish this as a maintained standard, not inside the policy text. The [Review Committee](/phase-1-governance/review-committee/) owns updates.

```markdown
# Approved AI Tools List

Owner: [AI Review Committee]
Last updated: [date]
Next review: [date]

| Tool | Approved use | Max data allowed | Risk tier | Conditions | Owner |
| ---- | ------------ | ---------------- | --------- | ---------- | ----- |
| [Tool name] | [Drafting, summarization, code assistance, search, etc.] | [Public / internal / confidential / regulated] | [Tier 1/2/3] | [No PII, human review required, logging enabled, etc.] | [Name] |
| [Tool name] | [Approved use] | [Max data class] | [Tier] | [Conditions] | [Name] |

## Rules

- Staff may not enter data above the listed maximum data class.
- Outputs that affect public communication, rights, benefits, safety, money, enforcement, or employment require human review.
- New uses require intake and tier review before launch.
- Personal AI accounts may not be used for agency data unless explicitly listed here.
- Suspected misuse, data leakage, or harmful output must be reported to [contact] within [timeframe].
```

## Workflow audit worksheet

Use in Track 7 or department planning to identify good intake candidates.

```markdown
# Workflow Audit Worksheet

Department/team: [name]
Manager: [name]
Date: [date]

| Workflow | Who does it? | Volume | Time spent | Pain point | Data used | Public impact | AI fit |
| -------- | ------------ | ------ | ---------- | ---------- | --------- | ------------- | ------ |
| [Task] | [Role] | [per week/month] | [hours] | [repetitive, slow, error-prone, backlog, etc.] | [public/internal/confidential/regulated] | [none/internal/public/rights/safety] | [low/medium/high] |
| [Task] | [Role] | [per week/month] | [hours] | [pain point] | [data class] | [impact] | [fit] |

## Best candidate

Workflow: [name]
Why this one: [2-3 sentences]
Current baseline: [volume, cycle time, error/rework rate]
Human review point: [where staff verifies output]
Likely tier: [Tier 1/2/3]
Next step: Submit [use case intake](/phase-2-education/use-case-intake/).
```

## Manager 1:1 coaching card

Use this when staff ask whether AI changes their job.

```markdown
# AI Manager 1:1 Coaching Card

Employee: [name]
Role: [role]
Date: [date]

## Open with

"I want to talk plainly about how AI may affect your work. The agency has committed that this 12-month program is not an AI-driven layoff plan. My job is to help you understand what changes, what stays yours, and where you need support."

## Ask

1. Which parts of your work feel most repetitive or slow?
2. Which parts require your judgment, relationships, or accountability?
3. Where would AI make you nervous if it were used badly?
4. What would you want training or practice on first?

## Name the role shift

- What stays the same: [judgment, accountability, relationship, decision]
- What may get faster: [drafting, summarizing, lookup, routing, formatting]
- What becomes possible: [better follow-up, deeper review, backlog reduction]
- Support needed: [training, approved tool access, workflow redesign, coaching]

## Close with

"You are still accountable for the work. AI can help draft, summarize, or search, but it does not replace your judgment. If a tool gives a bad answer or feels risky, stop and bring it to me."

Follow-up action: [action, owner, due date]
```

## Vendor questionnaire

Use before RFP release or any no-cost pilot that touches agency data. Align final procurement language with [Procurement Guardrails](/phase-1-governance/procurement-guardrails/).

```markdown
# AI Vendor Questionnaire

Vendor: [name]
Product: [name]
Use case: [workflow]
Requested by: [department]
Date sent: [date]
Response due: [date]

1. What AI models do you use, including provider, model name, and version?
2. Is agency data used to train, fine-tune, evaluate, or improve any model? If yes, how can the agency opt out?
3. Where is agency data processed and stored? List all regions, sub-processors, and model providers.
4. What data classes are supported: public, internal, confidential, regulated, CJIS, HIPAA, FERPA, tax, or other?
5. What logs can the agency export, in what format, and on what schedule?
6. How do you measure accuracy, hallucination, and failure modes for this use case?
7. Have you performed bias or disparate-impact testing relevant to this use case? Provide methodology and results.
8. What security certifications apply to this product and environment?
9. What incident notifications, breach timelines, and named escalation contacts are included?
10. Can the agency delete all data and receive written deletion confirmation at contract end?
11. Will you accept the agency AI procurement addendum without material changes?
12. Provide three government references using the product at similar scale.

Reviewer decision: [advance / hold / reject]
Reviewer notes: [summary]
```

## Council or board budget memo

Use when requesting funding, authority to procure, or approval to proceed.

```markdown
# Budget Memo: AI Program Funding Request

To: [Council/Board/Approving body]
From: [Agency head or sponsor]
Date: [date]
Subject: Funding request for [Agency] AI Quickstart Program

## Request

Approve [amount] for [fiscal year/period] to fund [program scope], including governance, staff training, approved tools, vendor review, platform setup, and one starter production use case.

## Why now

[Agency] staff are already encountering AI tools in daily work. Without an approved program, the agency faces unmanaged use, inconsistent data handling, procurement risk, and missed opportunities to improve service delivery.

## What funding buys

- AI governance: acceptable use policy, review committee, risk tiering, procurement guardrails.
- Staff readiness: training for staff, managers, governance reviewers, and technical teams.
- Approved tools: controlled access to tools that meet privacy, security, and records requirements.
- Starter use case: [short description], with human review and production readiness gates.

## Cost and benefit

Estimated one-year cost: [amount]
Estimated annual benefit: [amount]
Estimated payback: [months]
Primary benefit drivers: [hours saved, rework avoided, cycle time reduced, quality improved]

## Risk controls

The program will use the AI Acceptable Use Policy, risk classification, vendor questionnaire, human review requirements, audit logging, and a production readiness sign-off before launch.

## Decision requested

Approve [amount/action] and authorize [role] to proceed with procurement and implementation under the AI governance framework.
```

## Launch announcement

Use when the program is ready for staff awareness, not before governance has an owner.

```markdown
Subject: Launching [Agency]'s AI Quickstart Program

Today [Agency] is launching a 12-month AI Quickstart Program to help staff use approved AI tools safely, legally, and practically.

The program includes:

- A plain-language AI Acceptable Use Policy.
- An Approved AI Tools List.
- A Review Committee for proposed use cases and vendor questions.
- Training for staff, managers, leaders, governance reviewers, and technical teams.
- A simple intake form for AI ideas from any department.

What you should do now:

1. Read the leadership commitment letter and AI Acceptable Use Policy.
2. Use only tools on the Approved AI Tools List for agency work.
3. Do not enter confidential, regulated, or resident data into any unapproved AI tool.
4. Bring useful AI ideas through the intake form, not side channels.
5. Ask questions in [office hours/channel/email].

Program lead: [name, email]
Approved tools list: [link]
Use case intake: [link]
Training schedule: [link]
```

## Facilitator packet checklist

Use this to assemble printable or emailed packets before live sessions.

```markdown
# Facilitator Packet

Session: [Track 1 / Track 7 / Governance sprint / Executive briefing]
Facilitator: [name]
Date: [date]
Audience: [roles]

## Include

- Session agenda with time boxes.
- One-page plain-English objective.
- Required pre-reads.
- Activity worksheet.
- Filled example artifact.
- Link or QR code to the live site page.
- Local contact for policy, HR, IT, and program questions.
- "Stop and escalate" rule for privacy, legal, safety, or employee-impact concerns.

## Session-specific inserts

- Track 1: glossary excerpt, AUP summary, intake form instructions.
- Track 7: manager coaching card, workflow audit worksheet, job-impact talking points.
- Governance sprint: AUP draft, risk-tier matrix, charter draft, procurement addendum.
- Executive briefing: ROI estimate, milestone report, budget memo, top risks.

## After session

- Attendance recorded by [owner].
- Questions captured in [location].
- Follow-ups assigned within 2 business days.
- Any use case ideas submitted through intake.
```

## Production readiness sign-off

Use at the Month 10 gate before a starter project becomes a production service. Pair with the [Production Readiness Checklist](/phase-6-starter-projects/production-readiness/).

```markdown
# Production Readiness Sign-Off

Project: [name]
Use case: [short description]
Risk tier: [Tier 1/2/3]
Business owner: [name]
Technical owner: [name]
Target launch date: [date]

| Criterion | Status | Evidence | Owner |
| --------- | ------ | -------- | ----- |
| Real users are named and ready | [green/yellow/red] | [link or note] | [name] |
| Eval suite runs and thresholds are enforced | [green/yellow/red] | [link or note] | [name] |
| On-call coverage is published and tested | [green/yellow/red] | [link or note] | [name] |
| Cost per query/user is measured and within budget | [green/yellow/red] | [link or note] | [name] |
| Audit logging meets records/privacy requirements | [green/yellow/red] | [link or note] | [name] |
| Rollback plan exists and was rehearsed | [green/yellow/red] | [link or note] | [name] |
| User feedback channel is live and monitored | [green/yellow/red] | [link or note] | [name] |
| Retirement condition is documented | [green/yellow/red] | [link or note] | [name] |

Decision: [go / conditional go / no-go]
Conditions, if any: [specific actions, owners, due dates]

Sign-offs:

- Business owner: [name, date]
- Technical lead: [name, date]
- Security/privacy reviewer: [name, date]
- Platform/on-call owner: [name, date]
- AI Review Committee chair: [name, date]
```

## See also

- [Completed Examples](/resources/completed-examples/) - filled examples of the most common artifacts.
- [Quarterly Milestone Report Template](/resources/quarterly-report/) - sponsor reporting format.
- [AI Use Case Intake Form](/phase-2-education/use-case-intake/) - browser-based intake export.

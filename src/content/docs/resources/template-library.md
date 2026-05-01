---
title: Template Library
description: Copy-ready AI program artifacts for launch, governance, procurement, manager coaching, budget approval, environment operations, and production sign-off.
sidebar:
  order: 3
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

| Tool        | Approved use                                             | Max data allowed                               | Risk tier    | Conditions                                             | Owner  |
| ----------- | -------------------------------------------------------- | ---------------------------------------------- | ------------ | ------------------------------------------------------ | ------ |
| [Tool name] | [Drafting, summarization, code assistance, search, etc.] | [Public / internal / confidential / regulated] | [Tier 1/2/3] | [No PII, human review required, logging enabled, etc.] | [Name] |
| [Tool name] | [Approved use]                                           | [Max data class]                               | [Tier]       | [Conditions]                                           | [Name] |

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

| Workflow | Who does it? | Volume           | Time spent | Pain point                                     | Data used                                | Public impact                        | AI fit            |
| -------- | ------------ | ---------------- | ---------- | ---------------------------------------------- | ---------------------------------------- | ------------------------------------ | ----------------- |
| [Task]   | [Role]       | [per week/month] | [hours]    | [repetitive, slow, error-prone, backlog, etc.] | [public/internal/confidential/regulated] | [none/internal/public/rights/safety] | [low/medium/high] |
| [Task]   | [Role]       | [per week/month] | [hours]    | [pain point]                                   | [data class]                             | [impact]                             | [fit]             |

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

Need a supporting presentation? Use the [Council or Board Budget Request deck source](/deck-sources/program/council-board-budget-request.md) as a starting point. Paste or upload it into your preferred AI presentation tool, then localize, verify, and brand the generated deck before use.

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

Need a supporting staff launch presentation? Use the [Leadership Commitment and Staff Launch deck source](/deck-sources/program/leadership-commitment-staff-launch.md) as a starting point. Paste or upload it into your preferred AI presentation tool, then localize, verify, and brand the generated deck before use.

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

## Environment separation checklist

Use during Phase 3 to document how sandbox, development, staging/test, and production are separated. Pair this with [Environment Strategy & Promotion Path](/phase-3-infrastructure/environment-strategy/).

Need a supporting presentation? Use the [Environment Setup Basics deck source](/deck-sources/phase-3/environment-setup-basics.md) for orientation or the [Environment Design Workshop deck source](/deck-sources/phase-3/environment-design-workshop.md) for a working session.

```markdown
# Environment Separation Checklist

Agency/team: [name]
Use case or platform: [name]
Risk tier: [Tier 1/2/3 or pending]
Prepared by: [name]
Date: [date]

| Environment | Boundary used | Owner | Data allowed | Access rule | Cost/log view |
| ----------- | ------------- | ----- | ------------ | ----------- | ------------- |
| Sandbox | [tenant/workspace/account/subscription/project/resource group/namespace] | [name] | [synthetic/public/sample only] | [who can access] | [link or note] |
| Development | [boundary] | [name] | [synthetic/sanitized/internal if approved] | [who can access] | [link or note] |
| Staging/Test | [boundary] | [name] | [sanitized production-shape/test users] | [who can access] | [link or note] |
| Production | [boundary] | [name] | [approved real data only] | [least privilege/audited] | [link or note] |

## Minimum controls

- Production is separated from sandbox and development.
- Sandbox does not contain real sensitive data, live secrets, or production credentials.
- Secrets are different in each environment.
- Each environment has a named business or technical owner.
- Logs, costs, and access lists are reviewable.
- Retention and deletion expectations are documented.

## Open decisions

| Question | Owner | Due date | Status |
| -------- | ----- | -------- | ------ |
| [question] | [name] | [date] | [open/closed] |
```

## Promotion gate checklist

Use before moving a change from development to staging or from staging to production.

```markdown
# Promotion Gate Checklist

Project/service: [name]
Change: [summary]
From environment: [development/staging]
To environment: [staging/production]
Prepared by: [name]
Target date: [date]

| Gate | Required? | Status | Evidence | Owner |
| ---- | --------- | ------ | -------- | ----- |
| Functional tests pass | [yes/no/defer] | [green/yellow/red] | [link/note] | [name] |
| AI eval suite passes | [yes/no/defer] | [green/yellow/red] | [link/note] | [name] |
| Security/CVE scan reviewed | [yes/no/defer] | [green/yellow/red] | [link/note] | [name] |
| SBOM or dependency inventory updated | [yes/no/defer] | [green/yellow/red] | [link/note] | [name] |
| Infrastructure plan or drift review complete | [yes/no/defer] | [green/yellow/red] | [link/note] | [name] |
| Privacy/data handling review complete | [yes/no/defer] | [green/yellow/red] | [link/note] | [name] |
| Monitoring, alerting, and feedback path live | [yes/no/defer] | [green/yellow/red] | [link/note] | [name] |
| Rollback or pause path documented | [yes/no/defer] | [green/yellow/red] | [link/note] | [name] |

Decision: [promote / promote with conditions / hold / stop]
Conditions: [specific actions, owners, due dates]
Approver: [name, role, date]
```

## AI operations calendar

Use after launch to make routine monitoring, maintenance, and review visible.

```markdown
# AI Operations Calendar

Service/use case: [name]
Business owner: [name]
Technical owner: [name]
Operations owner: [name]
Review period: [month/quarter]

| Cadence | Review item | Owner | Evidence/location | Notes |
| ------- | ----------- | ----- | ----------------- | ----- |
| Weekly | Alerts, failed jobs, incidents | [name] | [dashboard/link] | [note] |
| Weekly | User feedback and negative themes | [name] | [queue/link] | [note] |
| Weekly | Eval failures and drift signals | [name] | [dashboard/link] | [note] |
| Weekly | Cost by use case and anomaly review | [name] | [dashboard/link] | [note] |
| Monthly | Dependency, container, and CVE review | [name] | [scanner/link] | [note] |
| Monthly | Prompt/model/retrieval change review | [name] | [registry/link] | [note] |
| Monthly | Access changes and privileged activity | [name] | [audit log/link] | [note] |
| Quarterly | Drift, disaster recovery, vendor/model, and policy exception review | [name] | [record/link] | [note] |
| Incident-triggered | Retrospective and runbook update | [name] | [incident record/link] | [note] |

Open maintenance risks:

- [risk, owner, due date]
```

## Production-readiness evidence register

Use to gather evidence before the production sign-off meeting.

```markdown
# Production-Readiness Evidence Register

Project/service: [name]
Risk tier: [Tier 1/2/3]
Target launch: [date]
Prepared by: [name]

| Evidence area | Required evidence | Location | Owner | Status |
| ------------- | ----------------- | -------- | ----- | ------ |
| Governance | Risk tier, review decision, approved use case | [link] | [name] | [status] |
| Data/privacy | Data classes, retention, prompt/response logging rule | [link] | [name] | [status] |
| Security | Access model, secrets, scan results, open risks | [link] | [name] | [status] |
| Evaluation | Eval set, thresholds, latest results, known failures | [link] | [name] | [status] |
| Operations | On-call/support path, runbook, incident path | [link] | [name] | [status] |
| Monitoring | Logs, metrics, traces, cost, feedback dashboard | [link] | [name] | [status] |
| Rollback | Feature flags, prompt/model rollback, manual fallback | [link] | [name] | [status] |
| User readiness | Training, guide, help path, launch communications | [link] | [name] | [status] |

Decision meeting: [date/time]
Recommended decision: [go / conditional go / hold / stop]
Conditions: [specific actions, owners, due dates]
```

## Model and prompt change record

Use for any production-impacting change to model ID, provider, prompt, retrieval configuration, tool access, or safety settings.

```markdown
# Model and Prompt Change Record

Service/use case: [name]
Change type: [model/provider/prompt/retrieval/tool/safety setting]
Requested by: [name]
Date: [date]

## Current state

- Provider/model slug or configuration: [current]
- Prompt or policy version: [current]
- Retrieval index/source version: [current]
- Tool permissions: [current]

## Proposed change

- Proposed provider/model slug or configuration: [proposed]
- Proposed prompt or policy version: [proposed]
- Proposed retrieval index/source version: [proposed]
- Proposed tool permissions: [proposed]

## Reason

[Why the change is needed.]

## Evidence

| Evidence | Result | Location |
| -------- | ------ | -------- |
| Eval score comparison | [result] | [link] |
| Cost/latency impact | [result] | [link] |
| Safety/DLP review | [result] | [link] |
| User impact review | [result] | [link] |

Rollback plan: [how to revert]
Approved by: [name, role, date]
Production release: [date/version]
```

## Drift and feedback review worksheet

Use weekly for Tier-2/3 services and monthly for lower-risk services that have real users.

```markdown
# Drift and Feedback Review Worksheet

Service/use case: [name]
Review period: [dates]
Reviewer: [name]

## Signals reviewed

| Signal | Current status | Action needed? | Owner |
| ------ | -------------- | -------------- | ----- |
| Eval score trend | [stable/down/up/unknown] | [yes/no] | [name] |
| User feedback themes | [summary] | [yes/no] | [name] |
| Cost per request/session | [stable/down/up/unknown] | [yes/no] | [name] |
| Refusal/content-filter rate | [stable/down/up/unknown] | [yes/no] | [name] |
| Retrieval quality/source freshness | [summary] | [yes/no] | [name] |
| Provider/model notices | [summary] | [yes/no] | [name] |
| Incidents or near misses | [summary] | [yes/no] | [name] |

## Decisions

- Add eval cases? [yes/no, details]
- Change prompt/model/retrieval/tool config? [yes/no, details]
- Open bug or training issue? [yes/no, details]
- Escalate to Review Committee or sponsor? [yes/no, details]

Next review date: [date]
```

## Access and break-glass review

Use quarterly for production AI services and after any incident involving elevated access. Pair with [Identity & Access](/phase-3-infrastructure/identity-access/) and [Operations Lifecycle & Resilience](/phase-3-infrastructure/operations-lifecycle/).

```markdown
# Access and Break-Glass Review

Service/use case: [name]
Environment: [production/staging/etc.]
Review period: [dates]
Reviewer: [name]
Date: [date]

## Access reviewed

| Role/group/account | Still needed? | Owner | Action |
| ------------------ | ------------- | ----- | ------ |
| [role/group/account] | [yes/no] | [name] | [keep/remove/modify] |
| [role/group/account] | [yes/no] | [name] | [keep/remove/modify] |

## Checks

- Departed staff removed: [yes/no]
- Vendor accounts reviewed: [yes/no/not applicable]
- Privileged access reviewed: [yes/no]
- Production admin access time-bounded or justified: [yes/no]
- Break-glass account exists and is stored correctly: [yes/no]
- Break-glass test completed or scheduled: [date/result]
- Break-glass use since last review: [none/list incidents]

Open actions:

| Action | Owner | Due date |
| ------ | ----- | -------- |
| [action] | [name] | [date] |
```

## Backup and restore test record

Use before production launch and on a recurring cadence for services that store prompts, configs, indexes, records, or user feedback.

```markdown
# Backup and Restore Test Record

Service/use case: [name]
Environment tested: [staging/production-like]
Test date: [date]
Tester: [name]

## Assets covered

| Asset | Backup source | Restore target | Result |
| ----- | ------------- | -------------- | ------ |
| Application database | [location] | [location] | [pass/fail] |
| Prompt registry/config | [location] | [location] | [pass/fail] |
| Retrieval index/source manifest | [location] | [location] | [pass/fail] |
| Eval suite/results | [location] | [location] | [pass/fail] |
| Audit logs/records export | [location] | [location] | [pass/fail/not applicable] |

Recovery time observed: [duration]
Recovery point observed: [age of restored data]
Issues found: [summary]
Actions required: [owner, due date]
Next test date: [date]
```

## Policy exception record

Use when the team needs to proceed with a documented variance from the normal control set. Exceptions should expire by default.

```markdown
# Policy Exception Record

Exception title: [short name]
Service/use case: [name]
Environment: [sandbox/dev/staging/production]
Requested by: [name]
Date requested: [date]

## Exception

Rule or control being excepted: [rule/control]
Reason exception is needed: [summary]
Scope: [workload, environment, data class, user group]
Risk if approved: [summary]
Mitigation: [controls, monitoring, narrowing, manual review]

Expiration or review date: [date]
Risk owner: [name]
Approver: [name/role/date]

## Follow-up

| Action | Owner | Due date | Status |
| ------ | ----- | -------- | ------ |
| [action] | [name] | [date] | [open/closed] |

Closure decision: [closed/extended/rejected]
Closure notes: [summary]
```

## Decommissioning checklist

Use when retiring a pilot, starter project, model route, vendor integration, or production AI service.

```markdown
# AI Service Decommissioning Checklist

Service/use case: [name]
Owner: [name]
Reason for retirement: [replacement/low usage/vendor change/cost/risk/etc.]
Planned shutdown date: [date]

## Before shutdown

- Users and support teams notified: [yes/no]
- Replacement or manual fallback documented: [yes/no/not applicable]
- Records/export requirements reviewed: [yes/no]
- Legal hold or public-records obligations checked: [yes/no]
- Final cost and usage report captured: [yes/no]

## Technical closure

| Item | Owner | Status |
| ---- | ----- | ------ |
| Disable feature flags/routes/jobs | [name] | [status] |
| Revoke API keys, service accounts, and vendor access | [name] | [status] |
| Archive or delete prompts, indexes, logs, and generated outputs per policy | [name] | [status] |
| Remove budget alerts, dashboards, and scheduled evals | [name] | [status] |
| Confirm vendor data deletion or export | [name] | [status] |
| Update approved tools list or service catalog | [name] | [status] |

Lessons learned: [summary]
Final approver: [name, role, date]
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

| Criterion                                         | Status             | Evidence       | Owner  |
| ------------------------------------------------- | ------------------ | -------------- | ------ |
| Real users are named and ready                    | [green/yellow/red] | [link or note] | [name] |
| Eval suite runs and thresholds are enforced       | [green/yellow/red] | [link or note] | [name] |
| On-call coverage is published and tested          | [green/yellow/red] | [link or note] | [name] |
| Cost per query/user is measured and within budget | [green/yellow/red] | [link or note] | [name] |
| Audit logging meets records/privacy requirements  | [green/yellow/red] | [link or note] | [name] |
| Rollback plan exists and was rehearsed            | [green/yellow/red] | [link or note] | [name] |
| User feedback channel is live and monitored       | [green/yellow/red] | [link or note] | [name] |
| Retirement condition is documented                | [green/yellow/red] | [link or note] | [name] |

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

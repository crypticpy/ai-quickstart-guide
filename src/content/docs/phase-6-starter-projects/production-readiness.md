---
title: Production Readiness Checklist
description: Eight criteria a starter project must meet before launch — what separates a pilot from a production AI deployment.
sidebar:
  order: 3
---

The production readiness checklist is the gate between "we tried it with a small group" (pilot) and "real users are using it for real work, on call is real, and we can't quietly turn it off" (launch). Most starter projects fail not at build but at this gate — the system works, the users like the demo, but one of the eight criteria below has been quietly skipped. The checklist exists to surface that gap before launch day rather than during the first incident.

The Month-10 production readiness gate is when the team walks the checklist with the business owner, security reviewer, and platform lead. Each criterion is green, yellow (documented variance), or red. Two or more reds is a no-go.

## The eight criteria

### 1. Real users (not pilots) using it for real work

The system is exposed to a named cohort of real users doing their real job, not a hand-picked test audience indulging the team.

- **How to verify**
  - The cohort is named and listed in the launch memo.
  - At least one identified user has confirmed in writing they will use the system for a specified workflow within 30 days of launch.
  - The cohort is not the team that built the system.
- **Common pitfall.** Launching to "the project team plus a few volunteers." That's a pilot in production clothing.

### 2. Eval suite runs in CI and on schedule; thresholds enforced

The eval suite is automated, runs on every change and on a schedule, and a failure below threshold blocks deploy.

- **How to verify**
  - The CI pipeline shows the eval job as a required check.
  - A scheduled run (nightly or weekly) is logged for the previous two weeks.
  - The threshold values are documented and code-enforced — not "we eyeball it."
- **Common pitfall.** Evals exist as a notebook the platform engineer runs by hand. They drift, scores degrade quietly, the team finds out from a user.

### 3. On-call coverage is real (someone gets paged; someone responds)

When the system breaks at 7pm on a Thursday, the page reaches a human who is contractually responsible for responding.

- **How to verify**
  - The on-call rotation is published with primary and backup names.
  - At least one test page has been fired and acknowledged inside the SLA.
  - The on-call has access to the runbook, deploy controls, and rollback procedure.
- **Common pitfall.** "The platform team will handle it" — without a named primary, an SLA, or a tested page path. Nothing happens until Monday.

### 4. Cost per user / per query measured and within budget

The team knows what each interaction costs and the projected monthly bill at expected volume sits inside the approved budget.

- **How to verify**
  - A cost dashboard shows cost per query and cost per active user.
  - A simulated week at expected volume has been run; total cost is projected and approved.
  - Cost alerts are configured at 80% and 100% of monthly budget.
- **Common pitfall.** "We'll watch the bill" — until a runaway loop or a chatty integration burns the quarter's API budget in 36 hours.

### 5. Audit log captures user actions that need capturing

User actions, system actions, and AI outputs that have legal, compliance, or operational significance are logged in a way that satisfies the records officer.

- **How to verify**
  - The audit log schema is reviewed and signed off by the records officer or privacy lead.
  - A spot-check of the previous week's activity shows the expected events present.
  - Retention rules match the agency's records schedule.
- **Common pitfall.** Logging everything (PII included) or logging nothing useful. Both fail the same compliance review.

### 6. Rollback plan exists and has been rehearsed

A documented rollback procedure exists and has been executed end-to-end at least once on staging, recently.

- **How to verify**
  - The rollback procedure is in the deployment runbook.
  - A staging rehearsal log is timestamped within the last 30 days.
  - Rollback time-to-completion is ≤15 minutes.
- **Common pitfall.** A rollback "plan" that's three bullet points in a wiki and has never been run. On launch day it doesn't work and nobody can find the previous SHA.

### 7. User feedback mechanism exists and is monitored

Users can report problems, give thumbs-up/down on AI outputs, or flag bad answers — and that feedback reaches a human inside a stated SLA.

- **How to verify**
  - A feedback control is present in the UI.
  - Feedback routes to a queue, channel, or ticket system the team checks daily.
  - The feedback SLA (e.g., "acknowledged in 2 business days") is documented and tracked.
- **Common pitfall.** A feedback button that emails a shared mailbox nobody owns. Feedback accumulates; trust erodes.

### 8. Retirement plan exists

The project has a named condition under which it will be sunset. The agency does not pretend the system will run forever.

- **How to verify**
  - The retirement condition is in the launch memo (e.g., "replaced by vendor product," "usage below N for two consecutive quarters," "underlying workflow eliminated").
  - The owner of the retirement decision is named.
  - A successor or migration path is sketched.
- **Common pitfall.** No retirement plan. The system accrues AI debt; in three years nobody knows whether to keep paying for it.

## Go/no-go decision

The Month-10 production readiness gate is the team's chance to say "not yet" without losing the build. A no-go is not a failure — the build still ran, the platform was still exercised, the user research is still real. If two or more criteria are not green, the [off-ramp on the Phase 6 index](/phase-6-starter-projects/#off-ramp--pilot-without-production-launch) ("Pilot Without Production Launch") is the right call. Most agencies that defer ship within the next two quarters with sharper scope.

A conditional go — proceed with a smaller cohort, a narrower scope, or one yellow criterion under remediation — is the right answer when most criteria are green and the gap is documented.

## Sign-offs required

The gate is recorded with signatures from each role responsible for a subset of the criteria.

- **Tech lead.** Eval thresholds (criterion 2) and rollback rehearsal (criterion 6).
- **Security / CISO.** Audit log (criterion 5) and RBAC enforcement — see the [RBAC module](/phase-5-platform/rbac-module/).
- **Business sponsor.** Real-users criterion (criterion 1) and cost criterion (criterion 4).
- **Platform team.** On-call rotation (criterion 3) and the underlying platform health.
- **Governance review committee.** Tier classification matches deployment posture — see [risk classification](/phase-1-governance/risk-classification/).

A signed gate document is the agency's record of decision. It travels with the project into operations.

## Related

- [User Testing Protocol](/phase-6-starter-projects/user-testing/) — UAT feeds the readiness criteria.
- [Deployment Runbook Template](/phase-6-starter-projects/deployment-runbook/) — the launch-day script the gate authorizes.
- [What's Next](/phase-6-starter-projects/whats-next/) — sustainability practices after the gate is passed.
- [Observability (Phase 3)](/phase-3-infrastructure/observability/) — the dashboards behind criteria 2, 3, 4.
- [Risk Classification (Phase 1)](/phase-1-governance/risk-classification/) — the tier framework the governance sign-off references.

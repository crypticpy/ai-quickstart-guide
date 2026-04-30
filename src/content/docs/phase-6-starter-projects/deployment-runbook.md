---
title: Deployment Runbook Template
description: The launch-day script for a starter project — pre-launch tasks, the go/no-go gate, the launch-day timeline, and the first 30 days of operation.
sidebar:
  order: 10
---

A deployment runbook is the script the team follows to take the starter project from "ready in staging" to "real users using it on Monday morning." Without a runbook, launches are improvised; improvised launches surface issues that should have been caught a week earlier and stress the on-call team unnecessarily. The runbook is the agency's promise to itself that launch day is boring.

This page is a template. Copy it into the starter project's repo, fill in the blanks, and rehearse it before the actual launch.

## Pre-launch: T-2 weeks

The two weeks leading up to launch are the most important. The team's stance shifts from "build" to "harden + verify." New features are not added. Existing features are exercised, monitored, and stressed.

### Two weeks before launch

- [ ] **Production readiness checklist** ([linked](/phase-6-starter-projects/production-readiness/)) clean. Every item passes or has a documented variance.
- [ ] **Eval suite at threshold** in CI. Recent eval runs in the dashboard.
- [ ] **Cost ceiling validated.** A simulated week of usage at expected volume; total cost projected and approved.
- [ ] **Rollback rehearsed.** A documented rollback procedure has been executed end-to-end at least once in staging.
- [ ] **Monitoring dashboards live.** SLOs defined; dashboards display them; alerts fire to the right channel.
- [ ] **On-call rotation set.** People know who's on; they have access; they have the runbook.
- [ ] **User documentation drafted.** A short user guide exists; "what is this", "how to use", "how to give feedback".
- [ ] **Help-desk briefed.** The agency's help desk knows the system exists, what users may ask, and where to escalate.

### One week before launch

- [ ] **Final UAT round** with the test cohort. Fixes for any blockers shipped.
- [ ] **Load test executed.** Expected concurrent-user load sustained for ≥30 minutes without errors above SLO threshold.
- [ ] **Security review signed off.** AppSec or equivalent reviewed the deployment. Findings tracked.
- [ ] **Privacy review signed off.** Privacy / records officer reviewed retention, audit, and PII handling.
- [ ] **Communications draft ready.** Launch announcement (internal-only at first), feedback channel, escalation paths.
- [ ] **Calendar invitations** for the launch hour, war-room window, and post-launch checkpoints.
- [ ] **Backup plan documented.** If we hit a blocker on launch day, what's the fallback (defer 24h, narrow scope, etc.)?

### Three days before launch

- [ ] **Freeze.** No code changes to the launch artifact except critical fixes.
- [ ] **Deploy candidate to staging from the launch SHA.** Verify staging matches the planned production deployment exactly.
- [ ] **Smoke test the launch SHA in staging.** Run a 10-minute test cohort exercise on staging.
- [ ] **Publish the launch readiness summary.** A one-page document to the steering group: SHA, date, audience, on-call, rollback plan.
- [ ] **Final go/no-go scheduled.** Calendar invite for the day before launch; deciders on the invite.

### Day before launch (the go/no-go gate)

A short meeting (≤ 30 minutes). Attendees: business owner, AI program lead, platform tech lead, on-call lead, security/privacy reviewer.

The decision is one of:

- **GO.** Proceed with the planned launch tomorrow.
- **CONDITIONAL GO.** Proceed with documented narrowing (smaller audience, reduced scope).
- **NO-GO.** Defer to a specific later date with a documented reason and remediation owner.

The decision is recorded with a signed note. Conditional and no-go decisions are not failures — they are the system working.

## Launch day

The plan for launch day. Times are approximate; the team adapts to its calendar.

### T minus 2 hours

- [ ] **War room open.** Dedicated channel (Slack / Teams) for launch communication. Calendar invite includes the link.
- [ ] **On-call confirms presence.** Primary + backup are at their keyboards.
- [ ] **Production health check.** Existing platform services healthy; no in-progress incidents.
- [ ] **Database / infrastructure spot-check.** No alerts, no resource pressure.
- [ ] **Final SHA verification.** The deploy artifact matches the launch SHA.

### T minus 30 minutes

- [ ] **Run the deploy.** Standard CI/CD pipeline; no special launch path.
- [ ] **Verify deploy success.** Health checks green; readiness probes pass; baseline metrics within range.
- [ ] **Run smoke tests.** A scripted set of canary requests against production from the war room.
- [ ] **Confirm flag state.** Feature flags set to the launch configuration (probably "on for the test cohort," not "on for everyone yet").

### T zero (launch hour)

- [ ] **Send the announcement.** Internal email / Slack to the test cohort: "the system is live."
- [ ] **Monitor the first interactions.** Watch error rate, latency, eval signals (if applicable), feedback.
- [ ] **Document the first user's first interaction** screenshot or description. Useful artifact later.
- [ ] **Be available.** The team is online and responsive. No multitasking.

### T plus 1 hour

- [ ] **First check-in.** War room reviews the first hour: how many users, what worked, what didn't.
- [ ] **Address any blocking issues.** A real issue is fixed or, if it can't be in 30 minutes, the audience is narrowed (rolled back to internal team only) until fix.
- [ ] **Comms update** to stakeholders if material.

### T plus 4 hours

- [ ] **Second check-in.** Reviews metrics over the half-day: load, errors, costs, feedback.
- [ ] **Decide on broadening.** If metrics are healthy, the test cohort can be expanded. If shaky, hold.
- [ ] **War room transitions** to async monitoring. On-call is primary point.

### End of launch day

- [ ] **Day-end check-in.** Final metrics review; document the day in a launch log entry.
- [ ] **On-call handoff** for overnight; primary contact for any incident.
- [ ] **Stakeholder update** for the steering group.
- [ ] **Team rest.** Launch days are tiring; tomorrow is for the calm-after.

## The first 30 days

The first month is when the team learns what running this system actually feels like. The discipline is to monitor closely, respond quickly to feedback, and avoid the temptation to add features.

### Week 1

- **Daily standup** specifically for the project. 15 minutes; what shipped, what broke, what users said.
- **Feedback triage** at the start of each day. Every piece of user feedback gets read and routed.
- **On-call coverage tight.** Primary + backup; quick escalation paths.
- **Cost dashboard checked daily.** Anomalies investigated.
- **Eval scores checked daily.** Drift caught early.
- **Audit log reviewed.** Spot-checks on user actions; nothing surprising.

### Week 2

- **First retrospective.** What's working, what isn't, what should change.
- **First prompt iteration** based on user feedback (typical).
- **First corpus / data update** based on user feedback (typical).
- **Adoption metrics** — weekly active users, queries per user, return rate.

### Weeks 3-4

- **Stable cadence.** Daily standup may scale back to 2-3 times/week.
- **Audience expansion** if metrics support it.
- **Second retrospective** at end of month 1.
- **Lessons-learned document** drafted (becomes input to Phase 6 closeout).
- **Platform team punch list** — gaps in the platform surfaced by the starter; prioritized for the platform team.

## Rollback procedure

The runbook includes a documented rollback. It must be:

1. **Rehearsed.** The team has executed it at least once in staging before launch.
2. **Fast.** Total time from "we should rollback" to "rolled back" ≤ 15 minutes.
3. **Reversible.** A rolled-back deploy can be re-deployed when fixed; data isn't lost.
4. **Communicated.** Users see a notice when the system is rolled back; the team's status page reflects it.

The rollback is typically:

- **Re-deploy the previous SHA** via standard CI/CD.
- **Disable the feature flag** that exposes the system to users.
- **Drain the queue** of in-flight async jobs (transcriptions, exports, etc.) gracefully.
- **Notify users** that the system is temporarily unavailable.

What's _not_ in the rollback:

- **Don't roll back data migrations** unless explicitly required and rehearsed. Most starters' migrations are additive (new tables, new columns) and don't need rolling back.
- **Don't manually edit production data** during a rollback. If data is wrong, file an incident; fix in a controlled change.

## Incident response

The first month will have at least one incident. Plan for it:

- **Severity definitions.** S1 = users can't use the system; S2 = degraded experience; S3 = bug affecting some users.
- **Page channels.** S1 pages on-call; S2 alerts on-call; S3 goes to the issue tracker.
- **Runbook per likely incident.** "What to do if eval scores drop suddenly," "What to do if cost alerts fire," "What to do if RBAC denies a user who should be allowed."
- **Postmortem on every S1.** Blameless; root-cause analysis; action items tracked.
- **Status page** for users; updated during S1/S2.

## Communications

Internal communications during launch:

- **Test cohort.** Email + Slack at T zero.
- **Steering group.** Brief at end of day 1, end of week 1, end of month 1.
- **Help desk.** Briefed before launch; any issues feed back to the team.
- **Wider agency.** Public announcement (if any) at end of month 1, after stable operation. Not at launch.

External (public-facing) communications:

- **Only after stable operation.** Don't announce a public-facing AI system at launch. Operate in a smaller cohort first.
- **Coordinated with comms / public affairs.** Wording reviewed.
- **Honest about scope.** "We launched X for Y team to Z workflow" — not "we launched our AI."

## Lessons-learned document

At the end of the first 30 days, the team writes a lessons-learned document. Sections:

- **What went well.**
- **What surprised us.** (positive and negative)
- **What we'd do differently next time.**
- **Specific platform gaps surfaced.** Concrete asks for the platform team.
- **Specific governance gaps surfaced.** Concrete asks for the program / governance team.
- **Adoption / impact data.** What numbers tell us this worked (or didn't).

This document is the agency's institutional memory for the next project.

## Plain-English Guide to Runbook Terms

- **Runbook.** A documented procedure for routine and exceptional operations. The launch runbook is the script for going live.
- **War room.** A dedicated channel and team focus during a launch or incident. Async by design but with everyone available.
- **Smoke test.** A small set of basic checks run after a deploy to confirm the system is up.
- **Canary.** A limited initial deploy or test interaction that surfaces problems before broad exposure.
- **SHA.** The specific code commit being deployed. Pinning to an SHA is how the team agrees on "the version we're launching."
- **Postmortem.** A blameless review of an incident, identifying causes and follow-up actions.
- **SLO (Service Level Objective).** A target for the system's reliability or performance — e.g., "99% of requests in <500ms."

## Related

- [Phase 6 overview](/phase-6-starter-projects/) — where the launch happens
- [Production Readiness Checklist](/phase-6-starter-projects/production-readiness/) — the gate before launch
- [User Testing Protocol](/phase-6-starter-projects/user-testing/) — UAT before launch
- [What's Next](/phase-6-starter-projects/whats-next/) — sustainability after launch
- [Observability (Phase 3)](/phase-3-infrastructure/observability/) — the dashboards the runbook watches

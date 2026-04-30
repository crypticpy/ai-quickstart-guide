---
title: User Testing Protocol
description: How to run user acceptance testing (UAT) for an AI starter project — recruit, structure sessions, capture feedback, decide go/no-go.
sidebar:
  order: 9
---

User acceptance testing for an AI system is not the same exercise as UAT for a traditional application. Traditional UAT validates the workflow — does the form submit, does the report run, can the user complete the task. AI UAT validates the workflow _plus_ the AI's behavior on edge cases the eval suite missed. Recruiting, scenarios, and signal capture all need adjustment, because users react to model outputs in ways an automated eval suite cannot.

This page is the protocol the starter team runs in Month 9 — the hardening + UAT month — before bringing the system to the production readiness gate.

## Recruiting the test cohort

The cohort is small, deliberately mixed, and recruited rather than volunteered.

- **Size.** 8–12 testers. Smaller than that produces thin signal; larger than that overwhelms the team's ability to respond to feedback in real time.
- **Mix.** Three groups in roughly equal proportion:
  - The workflow's daily users — the people who will actually live with the system after launch.
  - Skeptics who flagged concerns during discovery — they surface failure modes the enthusiasts won't.
  - One auditor or governance representative — to test the system from a compliance/oversight angle.
- **Avoid.** Anyone who built the system, anyone whose review is "of course it's great, I helped pick it," and anyone whose only stake is novelty.
- **Source.** The [Champions Network](/phase-2-education/track-5-champions/) is the natural pool. Champions are trained, sympathetic to the program, and embedded in the user community.

## Session structure

Sixty-minute sessions, one tester at a time, with a facilitator and an observer.

- **5 minutes — orientation.** What the system is, what it isn't, what the tester is being asked to do. Confirm consent for recording.
- **30 minutes — scripted scenarios.** A set of 4–6 representative tasks the tester walks through. Includes at least one task the team expects to fail (to surface how the user reacts to a bad output).
- **15 minutes — open exploration.** The tester uses the system however they want. This is where unscripted failure modes show up.
- **10 minutes — structured feedback.** A short questionnaire and an open conversation. What worked, what didn't, what surprised them, what they'd want changed.
- **Recording.** Sessions are recorded with consent. Recordings feed back into the eval suite as additional test cases.

## What to capture

Signal-rich UAT captures more than "did the tester finish the task."

- **Task success rate** per scenario — completed, partial, abandoned.
- **AI failure modes** observed — hallucination, unwarranted refusal, drift across the conversation, latency over threshold, format problems.
- **User-reported concerns** about correctness, fairness, transparency, or anything that triggered discomfort.
- **Ideas for adjacent use cases** — these don't get built into the starter, but they go to the [use-case intake pipeline](/phase-2-education/use-case-intake/) for future projects.

## Triaging feedback

Every piece of feedback ends up in one of three buckets. Triage happens daily during UAT, not all at the end.

- **Blockers.** Must fix before launch. Examples: hallucinations on a high-frequency question, RBAC failure exposing a record the user shouldn't see, a workflow bug that prevents task completion.
- **Eval-suite gaps.** The failed scenarios are encoded as new eval cases and added to CI. The next regression is caught automatically.
- **Backlog.** Real but post-launch — UI polish, additional scenarios, nice-to-have features.

The UAT readout is a one-page document summarizing cohort size, scenarios run, blockers found and fixed, eval cases added, and a recommendation. The [production readiness gate](/phase-6-starter-projects/production-readiness/) reviews the readout as evidence behind several of the eight criteria.

## Cohort safety

Test users are not lab subjects. Tell them what's recorded, who sees it, how long it's retained, and what happens to their feedback. Get written consent before the first session — verbal "is it OK if we record" at the start of a call is not sufficient. The agency's [acceptable use policy](/phase-1-governance/acceptable-use-policy/) governs the test environment, including any PII the testers might enter while exercising the system.

## Related

- [Production Readiness Checklist](/phase-6-starter-projects/production-readiness/) — the gate the UAT readout feeds.
- [Champions Network (Track 5)](/phase-2-education/track-5-champions/) — the recruiting pool.
- [Use-Case Intake](/phase-2-education/use-case-intake/) — where adjacent-use-case ideas go.
- [Acceptable Use Policy (Phase 1)](/phase-1-governance/acceptable-use-policy/) — the rules the test environment runs under.

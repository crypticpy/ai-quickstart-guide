---
title: Phase 6 — Starter Project
description: The agency picks a first AI application — RAG chatbot, meeting transcriber, document intelligence, workflow automation, or NL analytics — that exercises the platform and ships a real user-facing win.
sidebar:
  order: 1
---

Phase 6 is where the platform meets reality. After five phases of governance, training, infrastructure, dev stack, and modular platform work, the agency picks one application and ships it to real users. Not as a pilot, not as a demo — as a production deployment that gets used on a Tuesday morning by someone who has a job to do.

The choice of application is the agency's, not the guide's. This page describes the candidate archetypes and what each one teaches the team, but the right starter project is the one whose users are ready, whose data is in shape, and whose stakeholders care about the outcome.

## Two equal goals

The starter project earns its keep on two axes simultaneously.

1. **Get the team's feet wet.** First-real-production discipline is different from second-real-production discipline. The starter is where the team learns what "production AI" feels like — the cadence of evals, the cost surprises, the user feedback loops, the on-call experience. Picking something low-stakes is deliberate; partial failure is recoverable; nobody loses their case file because the chatbot misunderstood a question.

2. **Exercise the platform.** The seven Phase 5 modules look fine on paper. Composing them into one application is where the rough edges show up. The starter project's bug list is a gift to the platform team — it surfaces gaps that get fixed before the second project hits them. Plan for "we found six things the platform needs to do better" as a feature, not a problem.

The agency that picks a starter project optimized for either goal alone will be disappointed. A flashy demo that doesn't really use the platform teaches nothing about composition. A platform-stress-test that nobody uses teaches nothing about delivery. Pick a project that pays both bills.

## Five candidate archetypes

The agency picks one. (Larger agencies may pick two in parallel.) Each archetype is shaped to fit a real government use case and to exercise a meaningful subset of the platform.

| Archetype                                                                           | One-line                                                                | Why pick it                                                                |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [RAG Chatbot](/phase-6-starter-projects/archetype-rag-chatbot/)                     | Staff or public Q&A over agency policies, FAQ, regulations, procedures  | Most-asked questions answered consistently; classic platform exercise      |
| [Meeting Transcriber](/phase-6-starter-projects/archetype-meeting-transcriber/)     | Transcribe, summarize, and extract action items from staff meetings     | Universal staff pain; visible time-savings; light-touch governance         |
| [Document Intelligence](/phase-6-starter-projects/archetype-document-intelligence/) | Read, index, and answer questions about a document corpus               | Heavier RAG; tests retrieval quality; touches more modules                 |
| [Workflow Automation](/phase-6-starter-projects/archetype-workflow-automation/)     | AI-augmented intake routing, classification, or first-pass review       | Most operational impact; most governance scrutiny; tests RBAC + audit hard |
| [NL Data Dashboard](/phase-6-starter-projects/archetype-data-dashboard/)            | Natural-language queries over operational data, with charts and exports | Tests SQL guardrails; broadest set of stakeholder questions                |

Selection criteria, the readiness checks, and a decision tree are in the [selection guide](/phase-6-starter-projects/selection-guide/).

## What the agency commits to in Phase 6

Six months of work, sequenced like every other phase: discovery, build, evaluate, ship, operate, learn.

| Month | Focus                                                            | Output                                                                  |
| ----- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 7     | Selection + discovery                                            | Archetype chosen; user research complete; eval plan drafted             |
| 8     | First build sprint                                               | End-to-end happy path running in dev; first eval suite passes           |
| 9     | Hardening + UAT                                                  | Test-cohort users exercising staging; feedback in the backlog           |
| 10    | Production readiness gate                                        | Production readiness checklist clean; go/no-go decision                 |
| 11    | Production launch + first month of operation                     | Real users using it; metrics flowing; on-call handles first incidents   |
| 12    | Retrospective + platform punch list + decision on second project | Lessons-learned written; platform gaps prioritized; next project queued |

The cadence is deliberate. Months 7–8 are exploratory; months 9–10 are tightening; months 11–12 are the calm-after-the-launch when the team learns what running an AI product actually feels like.

## What "ships" means

Production launch passes the [production readiness checklist](/phase-6-starter-projects/production-readiness/). Specifically:

- Real users (not just pilots) are using it for real work.
- The eval suite runs in CI and on a schedule; thresholds are enforced.
- On-call coverage is real (someone gets paged; someone responds).
- Cost per user / per query is measured and within budget.
- The audit log captures the user actions that need capturing.
- A rollback plan exists and has been rehearsed.
- A user feedback mechanism exists and is monitored.
- The retirement plan exists (the project will eventually sunset; we don't pretend otherwise).

Anything less is a pilot. Pilots are useful, but the agency's Phase 6 commitment is to a launch.

## Hard dependencies

- **Phase 5 platform.** The starter project _composes_ Phase 5's modules. Skipping Phase 5 means rebuilding auth, RBAC, data grid, AI orchestration into the starter — eight months of work hidden inside a "starter."
- **Phase 4 standards.** The starter is built to coding standards, tested per the testing strategy, with API-first design. ADRs cover the project-specific decisions.
- **Phase 3 infrastructure.** Production deployment is into the Phase 3 environments. The starter doesn't introduce new infrastructure patterns.
- **Phase 1 governance.** Risk classification, procurement guardrails, AUP — all apply. The starter is the first thing the governance machinery has to actually rate, approve, and monitor in production.
- **Phase 2 training.** The team building the starter is largely Track 4 graduates plus the platform team. The user-facing audience needs Track 1 / Track 5 awareness.

If any of these are weak, the starter project will surface that weakness as a launch blocker. That's not a problem with the starter — it's the system working. Fix the gap before launching.

## Off-Ramp — Pilot Without Production Launch

Some agencies will reach Month 10 and decide the starter project should not launch yet. Reasons vary: the eval scores aren't where they need to be, the user-research surfaces a redesign, the political moment for AI deployment passed, the budget shifted. **The Phase 6 investment is not lost if launch is deferred.** What's been built is real platform exercise, real institutional learning, and a test cohort's worth of feedback. The agency can re-enter Phase 6 with a different archetype, a refined version of the same one, or a different audience. Most agencies that defer ship within the next two quarters with a clearer scope.

## Plain-English Guide to Phase 6 Terms

- **Starter project.** The agency's first production AI application built on the platform. Chosen for low risk and high learning, not for "biggest impact."
- **Archetype.** A category of AI application with a known shape — RAG chatbot, document intelligence, etc. Picking an archetype gives the team a starting point.
- **Pilot vs. launch.** A pilot is "we tried it with a small group." A launch is "real users are using it for real work, on call is real, and we can't quietly turn it off."
- **Production readiness.** A specific checklist of conditions a project must meet before launch.
- **User Acceptance Testing (UAT).** A structured period where intended users try the system and provide feedback before launch.

## Research basis

NIST AI RMF (manage stage), GSA's TTS RAG-as-a-service patterns, Anthropic's enterprise deployment patterns, Microsoft's AI Center of Excellence playbook, and the State of California's GenAI playbook (2024). Specific archetype patterns draw on documented federal and state deployments — Login.gov's chatbot, San Francisco's permit chatbot, Pennsylvania's ChatGPT pilot, the Department of Veterans Affairs' summarization pilots.

## Related

- [Selection Guide](/phase-6-starter-projects/selection-guide/) — how to pick the archetype
- [Production Readiness Checklist](/phase-6-starter-projects/production-readiness/) — what "ships" means in practice
- [User Testing Protocol](/phase-6-starter-projects/user-testing/) — how to run UAT
- [Deployment Runbook Template](/phase-6-starter-projects/deployment-runbook/) — the launch-day script
- [What's Next](/phase-6-starter-projects/whats-next/) — sustainability and the second project
- [Phase 5 — Modular Platform](/phase-5-platform/) — the modules the starter composes

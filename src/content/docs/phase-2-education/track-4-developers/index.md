---
title: Track 4 — Developer Upskilling
description: Hands-on technical track for developers, data engineers, and platform staff who will build, deploy, and maintain AI-augmented systems.
sidebar:
  order: 11
---

Track 4 is the only Phase 2 track that produces working code. Its audience is the developers, data engineers, and platform staff who will integrate Claude (or whichever foundation model the agency procures) into agency systems — the people building the eval harnesses, retrieval pipelines, agent loops, and observability that the rest of the program relies on. Without Track 4, the platform is a vendor product. With Track 4, the agency owns the integration competence and can sustain the platform past Year 1.

## Track at a glance

| Field        | Value                                                                               |
| ------------ | ----------------------------------------------------------------------------------- |
| Audience     | Developers, data engineers, ML engineers, platform / DevOps staff                   |
| Mandatory?   | Required for any developer building or deploying AI features                        |
| Format       | 6 × 3-hour hands-on labs + 1 capstone build week                                    |
| Group size   | 8–12 (smaller than other tracks — labs are screen-share intensive)                  |
| Prerequisite | Track 1 OR demonstrated equivalent fluency; comfort with Python or TypeScript       |
| Timing       | Months 3–6                                                                          |
| ADKAR focus  | Knowledge and Ability — building the skills to ship                                 |
| Kirkpatrick  | Levels 2–4 (skill demos, applied work in pilot, measured impact in starter project) |

## Lab map

| #   | Title                                            | What developers leave with                                                     |
| --- | ------------------------------------------------ | ------------------------------------------------------------------------------ |
| 4.1 | Foundation Models, Tokens, and Why Cost Matters  | A working Claude API client, cost dashboard, and prompt-cost-per-task estimate |
| 4.2 | Prompts, Tools, and Function Calling             | A multi-tool agent skeleton wired to two real agency tools                     |
| 4.3 | Retrieval (RAG): Grounding Models in Agency Data | A working retrieval index over a sample agency corpus with citations           |
| 4.4 | Eval Harnesses: Knowing if It Got Better         | A regression test suite for one agent that catches output drift                |
| 4.5 | Observability, Telemetry, and Cost Controls      | Structured logs, prompt/response capture, per-feature cost budgets             |
| 4.6 | Deployment Patterns: Sandboxes, Staging, Prod    | Promotion pipeline with eval gates and rollback                                |
| Cap | Capstone Build Week                              | A working end-to-end feature shipped to a Tier-1 or Tier-2 pilot               |

## Format

Each 3-hour lab runs:

- **30 min concept.** Just enough framing to make the hands-on portion productive.
- **2 hours hands-on.** Pair programming or solo, with the instructor circulating. Real code, agency data (where governance permits), running on the agency's actual platform.
- **30 min review.** Each pair shows their result. The instructor highlights what to take forward and what to drop.

The capstone week is a structured build sprint: developers form 2-3 person teams, pick a Tier-1 or Tier-2 use case from the intake pipeline, and ship a working pilot in 5 days. The Review Committee greenlights deployment for a small named user group at the end of the week.

## Pedagogical posture

Track 4 is anti-tutorial. The labs deliberately avoid "hello world" exercises and instead use real agency-shaped problems from day one. Developers leave with code that ports to their actual work, not a sandbox they will throw away.

This is also why the prerequisites are strict. A developer who is not yet fluent in Python or TypeScript cannot make use of a 3-hour hands-on lab, and the cohort dynamic suffers when a third of the room is debugging environment setup. For developers who need foundational skills first, Track 4 is preceded by 1-on-1 mentoring or a self-paced primer; the track does not start until the cohort is ready.

## Output discipline

Track 4 produces _shipped code_, not slides:

- Each developer commits at least one merged PR per lab to the platform repo or to an agency project.
- The capstone week ends with a working pilot deployed to ≥1 named user.
- Track 4 graduates form the initial maintainer pool for the [Modular Platform](/phase-5-platform/) and the technical reviewers for the [Champions Network](/phase-2-education/track-5-champions/).

## Evaluation

| Level | Metric                                                                          | Target               |
| ----- | ------------------------------------------------------------------------------- | -------------------- |
| 2     | Per-lab skill check: developer demonstrates the lab's core competency           | ≥90% pass per lab    |
| 3     | Capstone pilot ships to a real user group                                       | 100% of cohort teams |
| 3     | Track 4 graduates author/review ≥2 platform PRs in the 90 days post-track       | ≥80%                 |
| 4     | Mean time-to-pilot for Tier-2 use cases drops after Track 4 graduates available | ≥30% reduction       |

## Facilitator profile

Track 4 facilitators are the agency's strongest hands-on engineers — typically the platform lead or a senior contractor with applied AI shipping experience. The lectures-as-content model fails here; facilitators must be able to debug real code in front of the cohort, including when things go wrong. The "I don't know, let's find out together" posture is essential and credible only from a facilitator who is genuinely shipping work themselves.

## Async fallback

Track 4 is the track that resists async the most. Hands-on labs require live debugging, environment troubleshooting, and pair work; async versions have far worse outcomes. For developers who genuinely cannot attend live:

- Recorded labs available, but pair with a peer in the same async cohort.
- Mandatory 1-on-1 office hours with the Track 4 facilitator at the end of each lab.
- A required code review on each lab's output before the developer advances.

The async path takes ~50% longer in calendar time and is reserved for genuine schedule conflicts, not preference.

## Common Track 4 failures

- **Running labs without real data.** Toy data produces toy code. Get governance approval for a sanitized agency dataset before the track starts.
- **Skipping the eval lab.** Eval (Lab 4.4) is the unloved-but-load-bearing skill. Developers who ship without evals create work that breaks silently. Don't let teams skip this lab to "go faster."
- **Letting the capstone become a hackathon.** The capstone is structured: review-committee scoping, named users, eval gates, rollback plan. A hackathon ends in a demo; the capstone ends in a deployed pilot.

## Related

- [Phase 4 — Developer Stack](/phase-4-dev-stack/) — the toolchain Track 4 teaches against
- [Phase 5 — Modular Platform](/phase-5-platform/) — what Track 4 graduates extend
- [Phase 6 — Starter Project](/phase-6-starter-projects/) — the capstone often becomes the starter project's first feature
- [Track 5 — Champions Network](/phase-2-education/track-5-champions/) — the network Track 4 graduates technically support

---
title: Track 4 — Developer Upskilling
description: Hands-on technical track for developers, data engineers, and platform staff who will build, deploy, and maintain AI-augmented systems.
sidebar:
  label: Overview
  order: 0
---

Track 4 is the only Phase 2 track that produces working code. Its audience is the developers, data engineers, and platform staff who will integrate the agency's approved foundation models into agency systems: the people building API wrappers, eval harnesses, retrieval pipelines, agent loops, and observability that the rest of the program relies on. Without Track 4, the platform is just a vendor product. With Track 4, the agency owns the integration competence and can sustain the platform past Year 1.

## Track at a glance

| Field        | Value                                                                               |
| ------------ | ----------------------------------------------------------------------------------- |
| Audience     | Developers, data engineers, ML engineers, platform / DevOps staff                   |
| Mandatory?   | Required for any developer building or deploying AI features                        |
| Format       | 8 × 2-hour hands-on labs                                                            |
| Group size   | 8–12 (smaller than other tracks — labs are screen-share intensive)                  |
| Prerequisite | Track 1 OR demonstrated equivalent fluency; comfort with Python or TypeScript       |
| Timing       | Months 3–6                                                                          |
| ADKAR focus  | Knowledge and Ability — building the skills to ship                                 |
| Kirkpatrick  | Levels 2–4 (skill demos, applied work in pilot, measured impact in starter project) |

## Lab map

| #   | Title                                            | What developers leave with                                                     |
| --- | ------------------------------------------------ | ------------------------------------------------------------------------------ |
| 4.1 | [LLM API Fundamentals](/phase-2-education/track-4-developers/lab-1-llm-api-fundamentals/) | Provider-neutral wrapper, model ID config, token/cost estimates, retry pattern |
| 4.2 | [Prompt Engineering](/phase-2-education/track-4-developers/lab-2-prompt-engineering/) | Tested constituent-intake classifier and FastAPI endpoint                      |
| 4.3 | [Retrieval (RAG)](/phase-2-education/track-4-developers/lab-3-rag/) | Grounded policy Q&A service over a synthetic corpus with citations             |
| 4.4 | [Orchestration and Agents](/phase-2-education/track-4-developers/lab-4-orchestration-and-agents/) | Tool-using agent loop with traceable actions                                   |
| 4.5 | [AI-Assisted Development](/phase-2-education/track-4-developers/lab-5-ai-assisted-development/) | Verified AI coding workflow against a flawed sample app                        |
| 4.6 | [Testing AI Systems](/phase-2-education/track-4-developers/lab-6-testing-ai-systems/) | Eval, regression, property, performance, and judge-test patterns                |
| 4.7 | [Reusable AI Modules](/phase-2-education/track-4-developers/lab-7-reusable-ai-modules/) | Hexagonal classifier module with contract tests                                |
| 4.8 | [Capstone Civic Assistant](/phase-2-education/track-4-developers/lab-8-capstone/) | End-to-end service with classification, RAG answer, triage, tests, and handoff |

## Model IDs and provider examples

Every provider uses a model identifier in API calls. These identifiers are strings such as a model slug, deployment name, or managed endpoint name. They are configuration values, not policy decisions.

Provider model lists, aliases, regional availability, SDK method names, and pricing change over time. The labs use example IDs only to show where the value goes in code. Before running a live class or deploying anything, verify the current provider docs and your agency's approved tools list:

- Anthropic API docs
- OpenAI API docs
- Azure OpenAI / Azure AI Foundry docs
- AWS Bedrock docs
- Google Vertex AI docs, if your agency uses Google-hosted models

In production, prefer a configuration variable such as `LLM_MODEL_ID`, `ANTHROPIC_MODEL_ID`, `OPENAI_MODEL_ID`, or an Azure deployment name. Pin the approved value in the deployment environment rather than scattering literal model strings through application code.

## Format

Each 2-hour lab runs:

- **25 min concept.** Just enough framing to make the hands-on portion productive.
- **70 min hands-on.** Pair programming or solo, with the instructor circulating. Real code, synthetic or sanitized agency-shaped data, and the agency's approved platform where available.
- **25 min review.** Each pair shows their result. The instructor highlights what to take forward and what to drop.

The capstone lab is a structured integration exercise. Agencies with more time can expand it into a multi-day build sprint, but the default quickstart version is a bounded service that can be reviewed without turning Track 4 into a hackathon.

## Pedagogical posture

Track 4 is anti-tutorial. The labs deliberately avoid "hello world" exercises and instead use agency-shaped problems from day one. Developers leave with code patterns that port to their actual work, not a sandbox they will throw away.

This is also why the prerequisites are strict. A developer who is not yet fluent in Python or TypeScript cannot make use of a 3-hour hands-on lab, and the cohort dynamic suffers when a third of the room is debugging environment setup. For developers who need foundational skills first, Track 4 is preceded by 1-on-1 mentoring or a self-paced primer; the track does not start until the cohort is ready.

## Output discipline

Track 4 produces _shipped code_, not slides:

- Each developer commits at least one merged PR per lab to the platform repo or to an agency project.
- The capstone ends with a working service and a handoff document ready for review by a platform or starter-project team.
- Track 4 graduates form the initial maintainer pool for the [Modular Platform](/phase-5-platform/) and the technical reviewers for the [Champions Network](/phase-2-education/track-5-champions/).

## Evaluation

| Level | Metric                                                                          | Target               |
| ----- | ------------------------------------------------------------------------------- | -------------------- |
| 2     | Per-lab skill check: developer demonstrates the lab's core competency           | ≥90% pass per lab    |
| 3     | Capstone service passes tests and handoff review                                | 100% of cohort teams |
| 3     | Track 4 graduates author/review ≥2 platform PRs in the 90 days post-track       | ≥80%                 |
| 4     | Mean time-to-pilot for Tier-2 use cases drops after Track 4 graduates available | ≥30% reduction       |

## Facilitator profile

Track 4 facilitators are the agency's strongest hands-on engineers — typically the platform lead or a senior contractor with applied AI shipping experience. The lectures-as-content model fails here; facilitators must be able to debug real code in front of the cohort, including when things go wrong. The "I don't know, let's find out together" posture is essential and credible only from a facilitator who is genuinely shipping work themselves.

## Async fallback

Track 4 is the track that resists async the most. Hands-on labs benefit from live debugging, environment troubleshooting, and pair work. For developers who genuinely cannot attend live:

- Recorded labs available, but pair with a peer in the same async cohort.
- Mandatory 1-on-1 office hours with the Track 4 facilitator at the end of each lab.
- A required code review on each lab's output before the developer advances.

The async path usually needs more calendar time because code review and troubleshooting happen out of band.

## Common Track 4 failures

- **Running labs without agency-shaped data.** Toy data produces toy code. Use synthetic data by default and governance-approved sanitized data only when the Review Committee has cleared it.
- **Skipping the eval lab.** Eval (Lab 4.6) is the unloved-but-load-bearing skill. Developers who ship without evals create work that breaks silently. Don't let teams skip this lab to "go faster."
- **Letting the capstone become a hackathon.** The capstone is structured: review-committee scoping, tests, known limits, rollback plan, and a handoff document. A hackathon ends in a demo; the capstone ends in a reviewable artifact.

## Related

- [Phase 4 — Developer Stack](/phase-4-dev-stack/) — the toolchain Track 4 teaches against
- [Phase 5 — Modular Platform](/phase-5-platform/) — what Track 4 graduates extend
- [Phase 6 — Starter Project](/phase-6-starter-projects/) — the capstone often becomes the starter project's first feature
- [Track 5 — Champions Network](/phase-2-education/track-5-champions/) — the network Track 4 graduates technically support

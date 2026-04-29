---
title: Lab 5 — AI-Assisted Development
description: Two-hour lab where developers configure Copilot, Claude Code, or Cursor with gov-safe defaults, audit logging, and an AI-disclosure workflow.
sidebar:
  order: 6
---

## Lab brief

Lab 5 is the first Track 4 lab where the AI is helping write the code, not just running inside it. Developers configure their AI coding assistant with agency-approved defaults, wire up audit logging for AI-generated suggestions, and adopt the AI-disclosure norms used in the agency dev workflow. The configuration is the deliverable — it is what every Track 4 graduate carries into their day job.

## Audience and prerequisites

- Track 1 (AI Foundations) completed
- Working dev environment with the agency-approved AI coding assistant installed
- Cloud sandbox access from [Phase 3](/phase-3-infrastructure/cloud-sandbox/)
- Read the [Phase 4 AI-assisted development page](/phase-4-dev-stack/ai-assisted-development/) before the lab
- An empty repo in the cohort org to apply settings against

## Skills covered

- Copilot, Claude Code, and Cursor setup against the agency identity provider
- Gov-safe configuration: no PII in prompts, blocked-content filters, telemetry posture
- Audit log of AI-generated code attached to each PR
- AI-disclosure norms in commit messages, PR descriptions, and code review
- Review requirements and acceptance criteria for AI-generated code

## Lab output

A configured dev environment with AI guardrails — settings file, audit-log hook, PR template, and disclosure checklist — committed to the cohort repo.

## Success criteria

- Working code in CI with a green guardrail-check job
- Code review passed by the lab facilitator or paired peer
- Configuration deliverable committed to the cohort repo
- A test prompt containing PII is rejected by the local guardrail before reaching the model
- Every PR opened during the lab carries the AI-disclosure block from the template

## Gov-safe posture (required reading)

Lab 5 enforces three non-negotiable rules, mirroring the [Phase 4 AI-assisted development page](/phase-4-dev-stack/ai-assisted-development/):

- No PII or Tier-3 data in prompts. Guardrails block on the developer's machine before send.
- Audit log of AI-generated code is attached to every PR; reviewers can see which spans were AI-suggested.
- AI-disclosure norms apply: commit messages and PR descriptions declare AI assistance, and the human author remains accountable for correctness.

## What this lab does NOT cover

- Testing AI systems and bias review — that is Lab 6
- Building reusable AI modules — that is Lab 7
- End-to-end deployment of a feature — that is Lab 8

## Resources

- [Phase 4 AI-assisted development](/phase-4-dev-stack/ai-assisted-development/) — the agency standard this lab applies
- Anthropic Claude Code documentation
- GitHub Copilot enterprise documentation
- NIST AI RMF Govern function (responsible-use posture for AI dev tools)

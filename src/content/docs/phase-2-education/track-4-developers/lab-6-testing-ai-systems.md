---
title: Lab 6 — Testing AI Systems
description: Two-hour lab where developers build a regression test suite with bias and fairness checks plus cost tracking for AI components.
sidebar:
  order: 7
---

## Lab brief

Lab 6 is the unloved-but-load-bearing lab. Developers build the test suite that protects every other lab's output from silent regressions: golden-output prompt tests, bias and fairness checks against representative populations, and cost-per-task tracking that surfaces drift before it shows up on the bill.

## Audience and prerequisites

- Track 1 (AI Foundations) completed
- Working dev environment with deliverables from Labs 1–4 available to test against
- Cloud sandbox access from [Phase 3](/phase-3-infrastructure/cloud-sandbox/)
- A sample evaluation dataset provided in the lab (with subgroup labels)
- Familiarity with the agency's CI runner

## Skills covered

- Prompt regression testing and golden-output management
- Bias and fairness evaluation across subgroups
- Cost tracking, per-feature budgets, and drift alerts
- Test fixtures for retrieval and agent loops
- Failure-mode catalog and triage

## Lab output

A test suite for AI components with bias checks and a cost-tracking report, committed to the cohort repo and wired into CI.

## Success criteria

- Working code in CI with a green AI-eval job that runs on every PR
- Code review passed by the lab facilitator or paired peer
- Test suite deliverable committed to the cohort repo
- At least one subgroup gap surfaced and documented with a remediation note
- Cost-per-task report generated automatically on the eval run

## What this lab does NOT cover

- Module abstraction and reuse — that is Lab 7
- Production deployment and security review — that is Lab 8
- Long-horizon eval drift monitoring at platform scale — covered in [Phase 5](/phase-5-platform/)

## Resources

- NIST AI RMF Measure function (evaluation and bias testing)
- Anthropic evals documentation
- OpenAI evals documentation
- Algorithmic Justice League fairness testing references

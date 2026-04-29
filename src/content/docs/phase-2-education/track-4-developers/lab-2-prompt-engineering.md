---
title: Lab 2 — Prompt Engineering Patterns
description: Two-hour lab where developers build a versioned prompt library of ten-plus tested patterns aimed at recurring government use cases.
sidebar:
  order: 3
---

## Lab brief

Lab 2 turns prompts from ad-hoc strings into versioned, tested artifacts. Developers leave with a small library of patterns — system prompts, few-shot examples, structured-output prompts, chain-of-thought scaffolds — each with a test case and a known-good output. This is the substrate Lab 3 (RAG) and Lab 4 (agents) extend.

## Audience and prerequisites

- Track 1 (AI Foundations) completed
- Working dev environment from Lab 1, including the chatbot wrapper
- Cloud sandbox access from [Phase 3](/phase-3-infrastructure/cloud-sandbox/)
- Familiarity with version control branching and PR review

## Skills covered

- System prompts and role framing
- Few-shot example selection and ordering
- Chain-of-thought and structured-output patterns
- Prompt testing with golden-output comparisons
- Prompt version control, naming, and changelog discipline

## Lab output

A prompt library with 10+ tested patterns covering recurring government use cases (summarization, classification, extraction, drafting, redaction, translation), each with a docstring, a sample input, and a recorded expected output.

## Success criteria

- Working code in CI with a green prompt-test job
- Code review passed by the lab facilitator or paired peer
- Prompt library committed to the cohort repo under a versioned directory
- At least 10 patterns with tests and 1 documented failure mode per pattern
- One pattern picked up and reused by a different developer during the lab review

## What this lab does NOT cover

- Retrieval over agency documents — that is Lab 3
- Tool-using agents and orchestration — that is Lab 4
- Bias, fairness, and regression evaluation — that is Lab 6

## Resources

- Anthropic prompt-engineering documentation
- OpenAI prompt-engineering guide
- NIST AI RMF Measure function (prompt evaluation)
- "Plain-English Guide to Phase 2 Terms" on the [Phase 2 index](/phase-2-education/) for shared vocabulary

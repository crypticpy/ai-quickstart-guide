---
title: Lab 1 — LLM API Fundamentals
description: Two-hour hands-on lab where developers build a working chatbot API wrapper with authentication, token counting, streaming, and rate limiting.
sidebar:
  order: 2
---

## Lab brief

Lab 1 establishes the floor every other Track 4 lab builds on: a working API client to a foundation model, with the developer in control of authentication, token accounting, and failure modes. By the end of the session each developer has a chatbot wrapper they can extend in Labs 2–8 instead of restarting from scratch each time.

## Audience and prerequisites

- Track 1 (AI Foundations) completed
- Working dev environment with Python or TypeScript installed
- Cloud sandbox access provisioned in [Phase 3](/phase-3-infrastructure/cloud-sandbox/)
- API key for the agency's procured foundation model (issued in the lab)
- Familiarity with HTTP, JSON, and environment-variable secret handling

## Skills covered

- API authentication and key handling against agency secrets storage
- Token counting and per-request cost estimation
- Temperature, top-p, and stop-sequence controls
- Streaming responses and incremental rendering
- Error handling, retries with backoff, and rate-limit awareness

## Lab output

A working chatbot API wrapper with rate limiting, committed to the cohort repo, that other labs in this track import as the base client.

## Success criteria

- Working code merged to the cohort repo with CI green
- Code review passed by lab facilitator or paired peer
- Wrapper deliverable committed to the cohort repo under the developer's lab-1 directory
- Token counter returns within 5% of provider-reported usage on a 10-prompt sample
- Streaming and non-streaming modes both demonstrated in the lab review

## What this lab does NOT cover

- Prompt engineering patterns — that is Lab 2
- Retrieval augmentation — that is Lab 3
- Production deployment, CI promotion, and release gating — that is Lab 8

## Resources

- Anthropic API documentation
- OpenAI API reference
- NIST AI RMF Govern function (responsible API use baseline)
- Agency secrets-management runbook from [Phase 3 secrets management](/phase-3-infrastructure/secrets-management/)

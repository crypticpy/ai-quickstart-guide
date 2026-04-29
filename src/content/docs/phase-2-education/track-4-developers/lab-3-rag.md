---
title: "Lab 3 — RAG: Retrieval-Augmented Generation"
description: Two-hour lab where developers build a working retrieval pipeline over agency documents with chunking, embeddings, and citation rendering.
sidebar:
  order: 4
---

## Lab brief

Lab 3 takes the prompt library from Lab 2 and grounds it in agency content. Developers build a working RAG pipeline against a sanitized agency corpus, learn the difference between a demo retriever and a defensible one, and ship code that returns citations alongside answers.

## Audience and prerequisites

- Track 1 (AI Foundations) completed
- Working dev environment with Lab 1 wrapper and Lab 2 prompt library committed
- Cloud sandbox access from [Phase 3](/phase-3-infrastructure/cloud-sandbox/)
- A sanitized agency document set approved by governance (provided in the lab)
- Basic familiarity with vectors and similarity search

## Skills covered

- Document chunking strategies and trade-offs
- Vector embeddings and similarity search
- Context window management and retrieved-context budgeting
- Citation rendering and source linking
- Index refresh and reindex patterns

## Lab output

A working RAG pipeline over a sample agency corpus, returning answers with citations, committed to the cohort repo.

## Success criteria

- Working code in CI with a green retrieval-smoke-test job
- Code review passed by the lab facilitator or paired peer
- RAG pipeline deliverable committed to the cohort repo
- At least three chunking strategies benchmarked on the same corpus
- Every answer includes citations that resolve to a source document and span

## What this lab does NOT cover

- Tool-using agents and multi-step workflows — that is Lab 4
- RAG evaluation, drift detection, and bias review — that is Lab 6
- Promotion to staging and production — that is Lab 8

## Resources

- Anthropic retrieval and contextual retrieval documentation
- OpenAI embeddings documentation
- NIST AI RMF Map and Measure functions for grounded generation
- GSA TTS RAG-as-a-service patterns

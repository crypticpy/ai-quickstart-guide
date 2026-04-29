---
title: Lab 7 — Building Reusable AI Modules
description: Two-hour lab where developers refactor lab artifacts into a versioned AI orchestration module that follows platform interface standards.
sidebar:
  order: 8
---

## Lab brief

Lab 7 turns the per-developer artifacts from Labs 1–6 into a reusable module. Developers refactor their agent, retriever, or eval harness into a hexagonal-architecture module with a stable interface, semver-versioned releases, and the documentation other teams need to adopt it without reading the source.

## Audience and prerequisites

- Track 1 (AI Foundations) completed
- Working dev environment with Labs 1–6 deliverables available
- Cloud sandbox access from [Phase 3](/phase-3-infrastructure/cloud-sandbox/)
- The platform module template and interface contract from Phase 5 (provided in the lab)
- Familiarity with semantic versioning

## Skills covered

- Module interface design using hexagonal architecture
- AI abstraction-layer patterns and adapter swaps
- Versioning, deprecation, and backward compatibility
- Module documentation and adoption guides
- Inner-source contribution patterns

## Lab output

An AI orchestration module following platform standards — interface contract, adapter, tests, documentation, and a tagged release — committed to the cohort repo.

## Success criteria

- Working code in CI with a green module-contract-test job
- Code review passed by the lab facilitator or paired peer
- Module deliverable committed to the cohort repo
- Module imported and exercised by a different cohort developer during the lab review
- Tagged semver release published with changelog

## What this lab does NOT cover

- End-to-end feature integration across multiple modules — that is Lab 8
- Module marketplace publication — covered in [Phase 5](/phase-5-platform/)
- Long-term module ownership rotation — covered in the Phase 5 inner-source guide

## Resources

- Hexagonal Architecture (Cockburn) reference
- NIST AI RMF Govern function (module governance and accountability)
- Agency platform module taxonomy from Phase 5
- Inner-source patterns reference (InnerSource Commons)

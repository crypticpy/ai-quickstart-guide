---
title: Phase 5 — Modular Platform Build
description: Build the reusable module library — the "70% already solved" that makes future apps take weeks instead of months. Months 5–10.
sidebar:
  order: 1
---

> **Status:** Placeholder. Scheduled for Sprints 4–5.

## Objective

Build the reusable module library that will accelerate every future application. This is the core asset — the "70% already solved" that makes new apps take weeks instead of months.

## Deliverables

- Module taxonomy and interface contracts (hexagonal / ports-and-adapters)
- Seven core modules (each independently testable, documented, versioned):
  - Authentication & SSO
  - Data grid & search
  - API framework / gateway
  - Admin dashboard
  - Document rendering
  - Role-based access control (RBAC)
  - AI orchestration layer (LLM abstraction, prompt management, cost tracking)
- Inner-source contribution guide
- Module registry / catalog
- Internal Developer Platform (IDP) setup with self-service deployment and golden paths

## RAD reference

The [RAD platform repo](https://github.com/crypticpy) (link TBD pending RAD team handoff) is the concrete reference implementation. Module guides in this phase teach the _patterns_ and link to RAD for production-ready code.

## Off-ramp

Agencies that complete Phases 1–5 have a fully functional modular platform. Phase 6 (the starter project) can be deferred to align with a specific business need or budget cycle without losing the platform investment.

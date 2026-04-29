---
title: Phase 6 — Starter Project Deployment
description: Deploy the agency's first AI application using the platform modules built in Phase 5. Months 7–12.
sidebar:
  order: 1
---

> **Status:** Placeholder. Scheduled for Sprint 5.

## Objective

Select and deploy the agency's first AI-powered application using the platform modules built in Phase 5. This validates the entire stack end-to-end and demonstrates production-grade AI delivery.

## Four archetypes

Agencies pick one (or two, in parallel for larger teams):

| Archetype             | Description                                                              | Modules used                                                            |
| --------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Document Intelligence | AI reads, indexes, and answers questions about a document corpus         | Auth, Data Grid, AI Orchestration, Search, Doc Rendering, RBAC          |
| Conversational AI     | Role-based chatbot for staff or public Q&A (permits, benefits, services) | Auth, AI Orchestration, RBAC, Admin Dashboard                           |
| Workflow Automation   | AI-augmented document routing, approval chains, classification           | Auth, API Framework, AI Orchestration, Data Grid, Admin Dashboard, RBAC |
| Data Dashboard        | NL-to-SQL analytics dashboard over operational data                      | Auth, Data Grid, AI Orchestration, API Framework, Admin Dashboard       |

## Deliverables

- Starter project selection guide (decision tree)
- Architecture brief for each archetype (one per file in this directory)
- Deployment runbook template
- User testing protocol
- Production readiness checklist

## Hard dependency

Requires Phase 5 (platform) — starter projects assemble platform modules. Building without them defeats the modular platform premise.

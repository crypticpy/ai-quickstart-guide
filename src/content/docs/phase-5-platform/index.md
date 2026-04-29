---
title: Phase 5 — Modular Platform Build
description: Build the reusable module library — the "70% already solved" that makes future apps take weeks instead of months. Months 5–10.
sidebar:
  order: 1
---

Phase 5 is where the agency stops paying integration tax. The platform is not a product; it is a small library of well-bounded modules that every future application will compose. When the next intake submission becomes a project, 70% of the answer should already exist as code in the platform — auth, RBAC, data access, API plumbing, document rendering, AI orchestration. The team building the new application writes the 30% that is genuinely about the use case.

This is the longest phase (six months) and the most consequential. A platform that ships works for a decade. A platform that doesn't gets quietly abandoned and each team rebuilds the same things forever.

## Objective

Build seven core modules — independently testable, documented, versioned — with a coherent module taxonomy, an inner-source contribution model, a registry for discoverability, and an Internal Developer Platform (IDP) that exposes the platform's capabilities through self-service paths.

## The pattern: modular monolith with hexagonal seams

The platform is a **modular monolith**, not a microservice constellation. Modules live in one repo (or a small number) and ship as one deployable unit. Inside, each module is internally coherent and externally minimal: it exposes a small interface and depends on a small set of others. The seams use [hexagonal architecture / ports-and-adapters](/phase-5-platform/module-taxonomy/) so a module's domain logic does not depend on any specific cloud, database, or vendor.

Why a modular monolith and not microservices:

- **One deploy, not seven.** Phase 3 set up one CI/CD pipeline; one set of secrets; one observability backend. Microservices multiply each by N.
- **Refactoring across modules is cheap.** When a contract needs to change, both sides move in one PR.
- **Operational footprint is small.** A 5-person platform team can run a modular monolith. Microservices need 15–25.
- **Performance is better.** In-process function calls beat HTTP between services for almost every metric except specific scale-out cases.

The agency adopts this pattern explicitly. Microservices are reserved for the rare module that legitimately needs independent scaling, language difference, or deployment cadence. Most modules don't.

## The seven modules

| Module                                                             | What it does                                                                        | Why a module                                             |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [Authentication & SSO](/phase-5-platform/auth-module/)             | OIDC sign-in, session management, JWT validation, MFA enforcement                   | Every app needs it; nobody should reimplement            |
| [RBAC](/phase-5-platform/rbac-module/)                             | Roles, scopes, attribute-based policies, permission enforcement                     | Authorization is high-stakes and uniform across apps     |
| [Data Grid & Search](/phase-5-platform/data-grid-module/)          | Reusable typed list/filter/sort/export UI + backend; full-text search               | Every internal tool needs lists; reimplemented endlessly |
| [API Framework](/phase-5-platform/api-framework-module/)           | Request/response plumbing, error format, pagination, rate limit, OpenAPI generation | Wraps web framework with agency conventions baked in     |
| [Admin Dashboard](/phase-5-platform/admin-dashboard-module/)       | Cross-app admin shell: users, roles, audit log, feature flags, system health        | Operations needs one place to manage every app           |
| [Document Rendering](/phase-5-platform/document-rendering-module/) | Templated PDF, DOCX, HTML output for letters, reports, forms                        | Government work is paper work; render once               |
| [AI Orchestration](/phase-5-platform/ai-orchestration-module/)     | LLM adapters, prompt management, retrieval, eval, cost tracking, guardrails         | The biggest productivity multiplier in the platform      |

Plus two cross-cutting deliverables:

- [Inner-Source Contribution Guide](/phase-5-platform/inner-source/) — how teams contribute back.
- [Module Registry & Internal Developer Platform](/phase-5-platform/idp-and-registry/) — how teams discover and consume modules.

## Sequencing within Phase 5

Six months of work, sequenced so blocking dependencies resolve early.

| Month | Focus                                                             | Output                                                             |
| ----- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1     | Module taxonomy + Auth + RBAC                                     | Sign-in works end-to-end against the agency IdP; one role enforced |
| 2     | API Framework + Data Grid                                         | A working internal tool can be scaffolded from these three modules |
| 3     | Admin Dashboard + Document Rendering                              | An app can be operated and its outputs delivered                   |
| 4     | AI Orchestration v1 (LLM adapter + retrieval)                     | A prompt+retrieval feature can be added to any app via the module  |
| 5     | AI Orchestration v2 (eval, cost, guardrails) + Inner-Source guide | The platform becomes safe for Tier-2 deployments                   |
| 6     | Module Registry + IDP self-service paths + hardening              | Any developer can scaffold a new app in <1 hour                    |

The sequence assumes a small platform team (3–6 engineers). Larger teams can parallelize months 2–3.

## Hard dependencies

- **Phase 3 operational.** The platform runs on Phase 3's infrastructure. Without it, modules have nowhere to live.
- **Phase 4 standards adopted.** Coding standards, testing strategy, API-first design, ADR practice. Modules embody these standards; without the standards in place, the modules drift.
- **Track 4 graduates available.** Track 4 produces the engineers who build and maintain modules. Sequence Phase 5 to start as the first Track 4 cohort completes.

## What Phase 5 does NOT cover

- Specific user-facing applications. Apps come in Phase 6 (and onwards).
- Domain-specific business logic. The modules are domain-agnostic; eligibility logic, inspection scheduling, etc., live in their own apps that consume the modules.
- Vendor selection for foundation models. The AI Orchestration module's adapter pattern means the choice is config; the choice itself is procurement work.

## Off-Ramp — Platform Without Starter Project

Agencies that complete Phase 5 have a working platform with reusable modules, established governance, trained staff, and development standards. This is production-ready infrastructure. **Phase 6 (the starter project) can be deferred** by a quarter or more without losing the Phase 5 investment. Some agencies use this off-ramp deliberately: ship the platform, then wait for the right business need to land before committing to the first starter project. The platform's value compounds once it exists.

## Plain-English Guide to Phase 5 Terms

- **Module.** A self-contained unit of platform functionality with a small public interface. Other modules and applications consume it; they don't peek inside.
- **Modular monolith.** All modules in one process, one deployable unit. Internal calls are function calls, not HTTP. Easier to operate than microservices; gives most of the benefits.
- **Hexagonal architecture / ports-and-adapters.** The module's core logic ("hexagon") doesn't depend on its surroundings. It defines _ports_ (interfaces) and _adapters_ implement those ports for specific clouds, databases, or vendors. Swap the adapter; the core stays the same.
- **Inner source.** Treating internal codebases like open-source projects within the agency: shared, contributed-to, transparent code reviews. Producer modules; consumer teams contribute fixes back.
- **Internal Developer Platform (IDP).** The self-service surface that lets a developer scaffold a new app, deploy it, see its logs, and operate it without filing tickets. Backstage is the dominant open-source choice; Port and Cortex are commercial alternatives.
- **Golden path.** The recommended way to do a thing. The IDP makes the golden path the easy path, so teams choose it by default without needing to be told.

## Research basis

Modular monolith pattern (Shopify's documented architecture; Amazon Prime Video's 2023 migration), hexagonal architecture (Cockburn 2005), Spring Modulith and similar implementations, Backstage IDP (CNCF), inner source (PayPal originated; CMS first federal OSPO 2024), Austin APH RAD platform (145+ reusable modules in production), and the SPACE framework for measuring the developer experience the platform produces.

## Related

- [Phase 4 — Dev Stack](/phase-4-dev-stack/) — the standards modules embody
- [Phase 6 — Starter Project](/phase-6-starter-projects/) — the first thing built _on_ the platform
- [Track 4 — Developer Upskilling](/phase-2-education/track-4-developers/) — the engineers who build the platform
- [Track 5 — Champions Network](/phase-2-education/track-5-champions/) — the staff who source intake ideas the platform serves

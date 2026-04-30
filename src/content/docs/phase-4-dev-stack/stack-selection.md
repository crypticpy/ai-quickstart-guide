---
title: Stack Selection Decision Tree
description: Criteria-based evaluation across Python/FastAPI/React, .NET, Java/Spring, Node/Next.js, and Go — with the decision rules for picking one (or, rarely, two) primary stacks.
sidebar:
  order: 2
---

The stack the agency picks in Phase 4 is the one its developers, vendors, or support partners will use for years. It will outlast the framework's current major version, the cloud's current naming for managed services, and probably the current vendor for the IDE. The choice should be made deliberately, with criteria, and recorded as ADR-001 of the new dev practice. This page is the structured decision tree.

## The single biggest rule

**Most agencies should pick the stack they already have and can support.** A team with a working Java/Spring application and three years of operational experience should not switch to Python because Python is fashionable in AI; the migration cost can dwarf the productivity gain, and the operational pain during the transition is real. The right question is not "what is the best stack for AI work" — every modern stack can call AI services. The right question is "what stack can our staff, vendors, and hosting environment support while meeting our requirements for AI?"

The exceptions to this rule are documented below. They are narrower than they look.

## Selection criteria

Score each candidate stack on the following dimensions. The right stack is the one that wins on more dimensions, not the one that wins on the most exciting dimension.

### 1. Existing team skills

Look at the agency's working developer population and vendor support model, not aspirational hires. If most of the developers or maintainers are .NET people who can ship .NET confidently, that stack scores highly on this dimension regardless of any other consideration.

### 2. Existing operational footprint

Are there already production .NET / Java / Python / Node applications running? Is there a vendor or shared service already supporting them? An operations pattern that already knows how to deploy, monitor, and patch the stack is effort that does not have to be repeated. Score the existing operational footprint, not the aspiration.

### 3. AI ecosystem maturity

Some stacks have a smoother AI-development path than others. As of this guide's 2026 audit, the practical pattern is:

- **Python** — strongest ecosystem for orchestration, retrieval, evals, notebooks, and data-science-adjacent work.
- **TypeScript / Node** — strong SDK and web-app ecosystem; useful when one language across frontend/backend matters.
- **Go** — strong for service code; Anthropic and OpenAI have Go SDKs; less common for the orchestration layer because async / streaming patterns are heavier.
- **.NET** — strong Azure integration and mature enterprise tooling; Semantic Kernel and Microsoft.Extensions.AI are viable orchestration options.
- **Java / Spring** — strong enterprise/service ecosystem; Spring AI is improving and Spring remains a credible platform for modular service code.

A lower score on this dimension is not disqualifying. Every modern stack can call HTTP APIs, parse JSON, and use provider SDKs. Python and TypeScript are often the path of least resistance for AI orchestration, but an agency that already operates .NET, Java, or Go well should account for that advantage.

### 4. Hiring market

In a multi-year build, attrition is real. The agency must be able to hire, contract, or obtain shared-service support in the stack five years from now. All five candidate stacks pass this test today; none is clearly fading.

### 5. Government adoption and procurement

Some stacks have stronger government precedent (large vendor contracts, FedRAMP-authorized hosted runtimes, established procurement patterns). All five candidate stacks have substantial government adoption.

### 6. Modular monolith friendliness

Phase 5's platform follows a modular monolith pattern. Stacks vary in how naturally they support the pattern:

- Python with FastAPI's dependency injection — strong.
- TypeScript with NestJS — strong.
- Java with Spring (modular monolith is the Spring sweet spot) — strongest.
- .NET with ASP.NET Core and an opinionated module structure — strong.
- Go — works, but Go's module system and DI patterns require more discipline; modular monolith is doable but not idiomatic.

### 7. Portability across clouds

The chosen stack should run reasonably on AWS, Azure, and GCP. All five candidates do. Some have stronger first-party experiences (e.g., .NET on Azure, Java on AWS), but none are excluded.

## Candidate stacks (with summaries)

### Python + FastAPI + React/Next.js

**Best for:** Agencies without an entrenched stack; teams hiring data-science-leaning developers; the agency that is hiring for AI/ML capability and wants the broadest ecosystem.

**Strengths.** Large AI/ML ecosystem; FastAPI is purpose-designed for typed, async, OpenAPI-first APIs; React is a common frontend choice for new public-sector portals.

**Watch-outs.** Python deployment is heavier than the alternatives (Docker is the right packaging unit; do not deploy raw Python). Frontend / backend split means two languages, two test stacks, two CI surfaces. The reference implementation in this guide uses this stack and explains the tradeoff.

### .NET (C#) + ASP.NET Core + React or Blazor

**Best for:** Microsoft-shop agencies; teams with strong existing .NET operational experience; agencies on Azure with deep Entra ID integration.

**Strengths.** Excellent IDE / debugger; strong async story; strong Azure integration; mature ORMs and frameworks; Semantic Kernel and Microsoft.Extensions.AI.

**Watch-outs.** Smaller AI ecosystem than Python (improving fast). If the team uses Blazor, double-check the operational story and the eventual hiring market for Blazor specifically.

### Java + Spring (Boot or Modulith) + React

**Best for:** Agencies with established Spring expertise; teams that need the modular monolith pattern with strong tooling support; transactional / data-heavy backends.

**Strengths.** Spring Modulith supports the modular monolith pattern Phase 5 uses; strong test ecosystem (JUnit 5, Testcontainers, Pact); excellent transactional and database story; long deprecation cycles (good for government).

**Watch-outs.** AI ecosystem (Spring AI) is real but younger; verbose for prompt-heavy code. Hiring market for senior Spring developers is thinner than Python/Node in some regions.

### Node + TypeScript + Next.js

**Best for:** Web-heavy public portals; agencies wanting a single language across frontend and backend; teams already shipping Node.

**Strengths.** Same language across the stack reduces context switching; Next.js is a common React metaframework; major model providers have TypeScript SDKs; managed hosting paths are widely available.

**Watch-outs.** Operational discipline matters more in Node than in JVM/.NET; long-running processes and memory leaks need care; the npm dependency surface is large and requires active hygiene (Phase 4's [coding standards](/phase-4-dev-stack/coding-standards/) covers this).

### Go + (any frontend)

**Best for:** Service code where latency and footprint matter; existing Go shops; security-tooling-adjacent work.

**Strengths.** Tiny container images, fast startup, great concurrency primitives, simple deployment. Excellent for the platform's gateway and API framework modules.

**Watch-outs.** Less idiomatic for the AI orchestration layer (prompt assembly, streaming, eval harness). Many agencies use Go for the service tier and Python or TypeScript for the orchestration tier — but that is a two-stack decision (see below).

## The decision tree

```
Q1. Does the agency have a working production application maintained by ≥5 developers in a single stack?
    Yes → Score that stack first. Unless it scores ≤2/5 on AI ecosystem maturity, choose it.
    No → Continue.

Q2. Is the agency primarily vendor-managed, low-code, or without in-house developers?
    Yes → Choose the stack your vendor/shared-service can maintain, and require standards, tests, APIs, and data rules contractually.
    No → Continue.

Q3. Is the agency primarily on Azure with strong .NET operational experience?
    Yes → .NET is the default; evaluate against Python only if the agency is hiring data science capability.
    No → Continue.

Q4. Is the agency primarily building public-facing web portals?
    Yes → Python+FastAPI+React or Node+TypeScript+Next.js — pick whichever the team prefers.
    No → Continue.

Q5. Is the agency primarily building integrations and event-driven backends?
    Yes → Python+FastAPI is the broadest fit; Go for high-throughput service tiers; .NET if Azure-native; Java if Spring expertise exists.
    No → Continue (small fraction of agencies).

Q6. Default for code-owning teams with no entrenched stack → Python+FastAPI+React.
```

The default exists because Python+FastAPI+React is broad, AI-friendly, and easy to teach in the guide's reference implementation. It is not always the right choice — the questions above route many agencies to a different answer.

## Two-stack decisions

A small number of agencies legitimately need two stacks. The rule: **avoid two stacks for the same kind of work unless there is a documented owner and reason.** Acceptable splits:

- **Service tier in Go, orchestration tier in Python.** The platform's gateway and high-throughput services are Go; the AI orchestration layer is Python. Each tier is one stack; the seam between them is HTTP/gRPC.
- **Backend in .NET, ML/data tier in Python.** The agency's transactional systems are .NET; the AI orchestration and any data preparation tooling are Python. Same rule: each tier is one stack.

High-risk splits: "team A uses Python, team B uses Java, both build orchestration." That ends up with two implementations of every cross-cutting concern. If the platform truly needs more than one stack, ADR the boundary explicitly.

## What to record in ADR-001

The ADR for stack selection captures:

1. **Decision.** "The agency adopts $LANGUAGE / $FRAMEWORK / $FRONTEND as the primary stack for new platform and application work."
2. **Status.** Proposed → Accepted (after ratification by the AI program lead and platform-engineering lead).
3. **Context.** Existing stacks in production, team skills, AI ecosystem assessment, what was considered.
4. **Decision drivers.** Which selection criteria mattered most and why.
5. **Alternatives considered.** Each candidate stack with a short rationale for why it was not chosen.
6. **Consequences.** What this means for hiring, operational tooling, training, and migration of any non-conforming workloads.
7. **Review trigger.** Re-evaluate at major contract renewal, major platform shift, or roughly every 24 months.

## Migration policy for non-conforming workloads

If the agency has existing applications in stacks that aren't the new primary, the policy is:

- **Existing systems in production stay where they are.** No mass migration. The cost of rewriting working software for stack consistency is enormous and almost never recouped.
- **New work goes on the primary stack** unless an explicit ADR documents the exception (e.g., a service tier that genuinely benefits from Go).
- **End-of-life is a procurement question.** When the legacy system reaches its replacement cycle (5–10 years), the replacement uses the primary stack.

## Common stack-selection failures

- **"Python because AI."** Agencies abandon a perfectly good .NET or Java stack to chase AI productivity. The actual productivity gain is small; the migration cost is large.
- **"Pick the stack the consultant prefers."** A 12-month consulting engagement leaves an agency with a stack none of its full-time staff can maintain. Ground the decision in the agency's own staff.
- **No primary stack at all.** Each team picks. The platform never coheres. Modules built for one team don't reuse in another.
- **Picking three.** Two is the absolute maximum, and only when the boundary is structural (e.g., service tier vs. orchestration tier). Three becomes the agency that maintains nothing well.

## Related

- [Reference Implementation](/phase-4-dev-stack/reference-implementation/) — the worked example using the default Python+FastAPI+React stack
- [Coding Standards](/phase-4-dev-stack/coding-standards/) — applied to whichever stack is chosen
- [ADR Template](/phase-4-dev-stack/adr-template/) — the format ADR-001 uses

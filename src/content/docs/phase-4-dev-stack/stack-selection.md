---
title: Stack Selection Decision Tree
description: Criteria-based evaluation across Python/FastAPI/React, .NET, Java/Spring, Node/Next.js, and Go — with the decision rules for picking one (or, rarely, two) primary stacks.
sidebar:
  order: 2
---

The stack the agency picks in Phase 4 is the one its developers will use for the next decade. It will outlast the framework's current major version, the cloud's current naming for managed services, and probably the current vendor for the IDE. The choice should be made deliberately, with criteria, and recorded as ADR-001 of the new dev practice. This page is the structured decision tree.

## The single biggest rule

**Most agencies should pick the stack they already have.** A team with a working Java/Spring application and three years of operational experience should not switch to Python because Python is fashionable in AI; the migration cost dwarfs the modest productivity gain, and the operational pain during the transition is real. The right question is not "what is the best stack for AI work" — every modern stack does AI work. The right question is "what stack are our developers most productive in, and does that stack meet our requirements for AI?"

The exceptions to this rule are documented below. They are narrower than they look.

## Selection criteria

Score each candidate stack on the following dimensions. The right stack is the one that wins on more dimensions, not the one that wins on the most exciting dimension.

### 1. Existing team skills

Look at the agency's working developer population, not aspirational hires. If 80% of the developers are .NET people who can ship .NET in their sleep, that stack scores 5/5 on this dimension regardless of any other consideration.

### 2. Existing operational footprint

Are there already production .NET / Java / Python applications running? An ops team that knows how to deploy, monitor, and patch the stack is a year of effort that doesn't have to be repeated. Score the existing operational footprint, not the bench depth.

### 3. AI ecosystem maturity

Some stacks are stronger for AI work than others. As of 2026:

- **Python** — strongest. Direct SDKs from Anthropic, OpenAI, and every model vendor; reference notebooks for retrieval and agents; the entire ML and data science world.
- **TypeScript / Node** — second. First-class SDKs from major vendors; strong serverless story; identical language between frontend and backend.
- **Go** — strong for service code; Anthropic and OpenAI have Go SDKs; less common for the orchestration layer because async / streaming patterns are heavier.
- **.NET** — Azure OpenAI has first-class .NET integration; Semantic Kernel is a viable orchestration framework; broader Anthropic/OpenAI SDK coverage is thinner.
- **Java / Spring** — Spring AI is real and improving; vendor SDK coverage is thinner than Python/TypeScript; works well for service code, less idiomatic for prompt-heavy orchestration.

A stack scoring 3/5 on this dimension is not disqualifying — every modern stack can call HTTP APIs and parse JSON. But Python and TypeScript are the path of least resistance for the AI orchestration layer specifically.

### 4. Hiring market

In a multi-year build, attrition is real. The agency must be able to hire (or contract with) developers in the stack five years from now. All five candidate stacks pass this test today; none is clearly fading.

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

**Strengths.** Largest AI/ML ecosystem; FastAPI is purpose-designed for typed, async, OpenAPI-first APIs; React frontend is the de facto standard for new public-sector portals.

**Watch-outs.** Python deployment is heavier than the alternatives (Docker is the right packaging unit; do not deploy raw Python). Frontend / backend split means two languages, two test stacks, two CI surfaces. The reference implementation in this guide uses this stack and explains the tradeoff.

### .NET (C#) + ASP.NET Core + React or Blazor

**Best for:** Microsoft-shop agencies; teams with strong existing .NET operational experience; agencies on Azure with deep Entra ID integration.

**Strengths.** Excellent IDE / debugger; strong async story; Azure integration is best-in-class; mature ORMs and frameworks; Semantic Kernel and Microsoft.Extensions.AI.

**Watch-outs.** Smaller AI ecosystem than Python (improving fast). If the team uses Blazor, double-check the operational story and the eventual hiring market for Blazor specifically.

### Java + Spring (Boot or Modulith) + React

**Best for:** Agencies with established Spring expertise; teams that need the modular monolith pattern with strong tooling support; transactional / data-heavy backends.

**Strengths.** Spring Modulith is purpose-built for the modular monolith Phase 5 produces; strong test ecosystem (JUnit 5, Testcontainers, Pact); excellent transactional and database story; long deprecation cycles (good for government).

**Watch-outs.** AI ecosystem (Spring AI) is real but younger; verbose for prompt-heavy code. Hiring market for senior Spring developers is thinner than Python/Node in some regions.

### Node + TypeScript + Next.js

**Best for:** Web-heavy public portals; agencies wanting a single language across frontend and backend; teams already shipping Node.

**Strengths.** Same language across the stack reduces context switching; Next.js is the dominant React metaframework; OpenAI and Anthropic SDKs are first-class; Vercel/Cloud Run/App Service all have first-party Next.js paths.

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

Q2. Is the agency primarily on Azure with strong .NET operational experience?
    Yes → .NET is the default; evaluate against Python only if the agency is hiring data science capability.
    No → Continue.

Q3. Is the agency primarily building public-facing web portals?
    Yes → Python+FastAPI+React or Node+TypeScript+Next.js — pick whichever the team prefers.
    No → Continue.

Q4. Is the agency primarily building integrations and event-driven backends?
    Yes → Python+FastAPI is the broadest fit; Go for high-throughput service tiers; .NET if Azure-native; Java if Spring expertise exists.
    No → Continue (small fraction of agencies).

Q5. Default → Python+FastAPI+React.
```

The default exists because Python+FastAPI+React is the broadest, easiest-to-hire, AI-friendly stack with strong government adoption. It is the choice this guide's reference implementation uses. It is not always the right choice — the questions above route most agencies to a different answer.

## Two-stack decisions

A small number of agencies legitimately need two stacks. The rule: **never two stacks for the same kind of work.** Acceptable splits:

- **Service tier in Go, orchestration tier in Python.** The platform's gateway and high-throughput services are Go; the AI orchestration layer is Python. Each tier is one stack; the seam between them is HTTP/gRPC.
- **Backend in .NET, ML/data tier in Python.** The agency's transactional systems are .NET; the AI orchestration and any data preparation tooling are Python. Same rule: each tier is one stack.

Unacceptable splits: "team A uses Python, team B uses Java, both build orchestration." That ends up with two implementations of every cross-cutting concern. If the platform truly needs more than one stack, ADR the boundary explicitly.

## What to record in ADR-001

The ADR for stack selection captures:

1. **Decision.** "The agency adopts $LANGUAGE / $FRAMEWORK / $FRONTEND as the primary stack for new platform and application work."
2. **Status.** Proposed → Accepted (after ratification by the AI program lead and platform-engineering lead).
3. **Context.** Existing stacks in production, team skills, AI ecosystem assessment, what was considered.
4. **Decision drivers.** Which selection criteria mattered most and why.
5. **Alternatives considered.** Each candidate stack with a short rationale for why it was not chosen.
6. **Consequences.** What this means for hiring, operational tooling, training, and migration of any non-conforming workloads.
7. **Review cadence.** Re-evaluate every 24 months unless triggered by a major shift.

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

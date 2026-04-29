---
title: Module Taxonomy & Hexagonal Architecture
description: How modules are bounded, how they expose interfaces (ports), how adapters keep the domain independent of clouds and vendors, and how modules consume each other.
sidebar:
  order: 2
---

A platform module is not a folder. A module is a unit with a small, deliberate **public interface** and a sealed **internal implementation**. Other modules and applications depend only on the interface; the implementation can be replaced without changing consumers. The taxonomy on this page describes the rules that make seven modules compose into one coherent platform instead of seven independent kingdoms with overlapping responsibilities.

The pattern the agency adopts is **hexagonal architecture** (also called ports-and-adapters), introduced by Alistair Cockburn in 2005 and now the dominant pattern for long-lived, vendor-portable platform code. Hexagonal architecture is not the only way to keep a module clean, but it is the one most agencies will encounter in modern reference implementations (Spring Modulith, NestJS, .NET Clean Architecture templates, FastAPI clean-architecture starters), and it gives non-trivial, testable benefits.

## What a module is

A module is the unit at which:

- **Public API** is defined — the interface other modules consume.
- **Ownership** is assigned — one team owns the module; that team approves changes to the public API.
- **Versioning** is tracked — the module has a SemVer line and a changelog.
- **Quality gates** apply — coverage, contract tests, eval thresholds.
- **Documentation** lives — a README, an ADR folder, and per-port reference docs.
- **Boundaries** are enforced — code in module A does not import private code from module B.

A module is _not_ a microservice. The seven platform modules ship in one process. The boundary is logical, enforced by linting and code review, not by a network hop.

## The hexagon, in plain language

The hexagonal pattern divides a module into three layers:

1. **Domain (the hexagon's core).** Pure business logic. Knows nothing about HTTP, databases, message queues, the chosen LLM vendor, or the cloud. Functions and data structures only.
2. **Ports.** Interfaces (Python `Protocol`, Java/.NET `interface`, Go `interface`, TypeScript type) that the domain defines and depends on. Each port describes a capability the domain needs (e.g., "save a case", "send a notification", "ask an LLM to summarize").
3. **Adapters.** Implementations of ports that talk to the outside world. There is usually one production adapter per port (e.g., Postgres adapter for the case-store port) and a fast in-memory adapter for tests.

Dependencies point **inward only**. The domain depends on nothing. Ports are owned by the domain. Adapters depend on the ports and on the external system. The outside world (HTTP handlers, CLI, message consumers) drives the domain through "primary" ports; the domain drives the outside world through "secondary" ports.

```
                 +---------------------+
   HTTP/CLI ---->| Primary port (in)   |
                 |                     |
                 |   Domain logic      |---- Secondary port (out) ----> DB / LLM / Queue
                 |   (the hexagon)     |
                 +---------------------+
```

The visual is a hexagon because Cockburn wanted to break the "layered cake" mental model. Six sides means a module can have multiple primary and multiple secondary ports without one direction feeling privileged.

## Why this pattern earns its keep

Three concrete payoffs that are visible inside a year.

1. **Vendor swaps are local.** When the AI Orchestration module swaps from Anthropic to AWS Bedrock, the change is in one adapter file. The domain code is untouched. The agency's exposure to vendor risk drops.
2. **Tests run in milliseconds.** The domain has no I/O. Unit tests instantiate the domain with in-memory adapters and execute thousands of assertions per second. The "is the testing pyramid the right shape" question (see [testing strategy](/phase-4-dev-stack/testing-strategy/)) becomes trivial — most logic _can_ be unit tested.
3. **Cross-module boundaries are visible.** When a developer wants module A to call module B, the only allowed path is through B's public ports. Linting rejects "I'll just import the helper class from B" shortcuts. The platform stays modular.

## Module file layout (conventional)

The agency's reference module layout (Python shown; the same shape applies in other languages with that ecosystem's idioms):

```
modules/auth/
├── README.md
├── pyproject.toml or setup.cfg
├── ADRs/
│   └── ADR-0001-token-format.md
├── src/auth/
│   ├── __init__.py
│   ├── domain/                 # the hexagon
│   │   ├── models.py           # User, Session, Token, etc.
│   │   ├── policies.py         # invariants and rules
│   │   └── services.py         # use cases (sign_in, refresh, etc.)
│   ├── ports/                  # interfaces the domain depends on
│   │   ├── user_repository.py
│   │   ├── token_signer.py
│   │   └── audit_log.py
│   ├── adapters/
│   │   ├── http/               # primary: FastAPI router
│   │   ├── postgres/           # secondary: implements UserRepository
│   │   ├── jwt/                # secondary: implements TokenSigner
│   │   └── otel/               # secondary: implements AuditLog via OTel
│   └── public/                 # what other modules import
│       ├── __init__.py         # re-exports the public surface
│       ├── client.py           # AuthClient — used by other modules
│       └── types.py            # PublicUser, AuthError, etc.
└── tests/
    ├── unit/                   # domain only, fakes for ports
    ├── adapter/                # adapter contract tests
    └── module/                 # the module's public interface, end-to-end
```

The `public/` folder is the only thing other modules are allowed to import. Linting rules (described below) enforce this.

## Public interfaces between modules

Modules consume each other through a small, typed client surface. The pattern that has worked across many agencies:

- Each module exposes a **single client class** in its `public/client.py` (or equivalent).
- The client class is pure data-in / data-out — no global state.
- Inputs and outputs are **public types** in the same `public/` package; consumers do not see internal models.
- Errors are public typed exceptions.

Example — the RBAC module's public client (illustrative):

```python
# modules/rbac/src/rbac/public/client.py
from typing import Protocol
from .types import Permission, ResourceRef, PermissionDecision

class RBACClient(Protocol):
    def can(self, user_id: str, permission: Permission, resource: ResourceRef) -> PermissionDecision: ...
    def assert_can(self, user_id: str, permission: Permission, resource: ResourceRef) -> None: ...
```

A consumer in the Data Grid module imports `from rbac.public import RBACClient` and depends only on this. The implementation may be local-in-process today and a network call tomorrow; the consumer doesn't change.

## Dependency direction enforcement

Module boundaries are easy to draw on a whiteboard and easy to violate in code. Two enforcement mechanisms:

1. **Import linting.** A custom linter rule (Python: `import-linter`; JS/TS: `eslint-plugin-boundaries`; Java: ArchUnit; .NET: NetArchTest; Go: `go-cleanarch`) declares the allowed module dependency graph. Imports that violate the graph fail the build.
2. **Visibility.** Most languages have a way to mark internal code as not-public (Java packages, .NET `internal`, TypeScript barrel files, Python convention via `__all__` and `_underscore_prefix`). Use it.

The agency's import-linter contract for Python (sample):

```yaml
# .importlinter
[importlinter:contract:platform-modules]
name = Platform module boundaries
type = forbidden
source_modules =
    auth
    rbac
    data_grid
    api_framework
    admin_dashboard
    document_rendering
    ai_orchestration
forbidden_modules =
    auth.domain
    auth.adapters
    rbac.domain
    rbac.adapters
    # ... one entry per module's domain and adapters
```

Translation: nobody outside `auth` may import from `auth.domain` or `auth.adapters`. They may only import from `auth.public`.

## The dependency graph (what depends on what)

The seven modules and their allowed dependencies. Read top-to-bottom: lower layers may not depend on higher ones.

```
            ┌─────────────────────────────┐
   APPS     │  Specific applications      │  (Phase 6 onwards)
            └──────────────┬──────────────┘
                           │
            ┌──────────────▼──────────────┐
   COMP    │  Composed modules            │
            │  - Admin Dashboard           │
            │  - Document Rendering        │
            └──────────────┬──────────────┘
                           │
            ┌──────────────▼──────────────┐
   APP-SVC  │  Application-service modules│
            │  - Data Grid & Search        │
            │  - AI Orchestration          │
            └──────────────┬──────────────┘
                           │
            ┌──────────────▼──────────────┐
   PLATFORM │  Platform modules            │
            │  - API Framework             │
            │  - RBAC                      │
            │  - Auth / SSO                │
            └──────────────────────────────┘
```

A module may depend on anything below it; nothing equal or above. The constraint is enforced by the import-linter contract.

## Cross-cutting concerns (logging, metrics, tracing, errors)

Every module needs to log, emit metrics, and trace. The agency provides a thin **platform-bootstrap** package that exposes:

- A configured logger.
- An OpenTelemetry tracer and meter.
- A typed error base class with the [RFC 7807 Problem Details](/phase-4-dev-stack/api-first-design/) shape.
- Standard structured-log fields (request_id, tenant_id, user_id where present).

Every module imports the bootstrap package; no module rolls its own. This is the one allowed exception to the strict module boundaries — bootstrap is below all modules, including platform modules. Bootstrap has no business logic; it is glue.

## Adapter conventions

Adapters are where reality lives. A few conventions keep them honest.

- **One adapter, one external system.** A Postgres adapter does not also call S3. If both are needed, they are two adapters.
- **Configuration is injected, not read.** Adapters take their settings as constructor arguments. They do not call `os.getenv`. The composition root reads config and constructs adapters.
- **Adapter contract tests.** Each adapter has a contract test that runs against the real external system (a Postgres in a container, an LLM via a recorded cassette, etc.). The test verifies the adapter implements the port correctly.
- **Test doubles live next to the adapter.** A `tests/fakes/InMemoryUserRepository` lives in the `auth` module and is exported as a test utility. Other modules use it for their own tests.

## The composition root

Every application that consumes the platform has a **composition root** — the one place where adapters are constructed and wired into modules. It is typically the application's `main.py` (or `Program.cs`, or `Application.java`). Nothing else knows which adapter is bound to which port.

Sketch:

```python
# apps/intake-portal/src/main.py
def build_app(settings: Settings):
    # adapters
    user_repo = PostgresUserRepository(settings.db)
    token_signer = JWTSigner(settings.jwt_keys)
    audit = OTelAuditLog(...)

    # modules constructed from adapters
    auth = AuthService(user_repo, token_signer, audit)
    rbac = RBACService(...)
    api = APIFramework(auth=auth, rbac=rbac, ...)

    # wire HTTP routes
    return api.make_app()
```

The composition root is the only place where module wiring decisions live. Tests have their own composition roots that swap in fakes.

## Versioning the public surface

Each module's public API is versioned with SemVer. Internal code is not versioned externally — it can change at any commit without a SemVer bump as long as the public surface is unaffected.

Bumps:

- **Major** — public type signature changes incompatibly. Method removed; required argument added; return type changed; exception added that consumers don't catch.
- **Minor** — additive changes. New optional argument; new method; new exported type.
- **Patch** — bug fix that does not change the public surface.

The deprecation policy from [API-first design](/phase-4-dev-stack/api-first-design/) applies: a deprecated method stays for at least one major version with a deprecation warning before removal.

## Testing modules

Three levels, mirroring the [testing pyramid](/phase-4-dev-stack/testing-strategy/):

- **Unit tests** exercise the domain with fakes for every port. They are pure-CPU tests; thousands run per second.
- **Adapter contract tests** run each adapter against the real external system. One contract per port.
- **Module tests** drive the module through its public client class with real adapters wired up. They verify the module composes correctly.

A module that ships without all three test layers is not done.

## When NOT to add a module

Modules have overhead — they add a versioning surface, a public client, a set of ports, and contract tests. Don't create one for code that is naturally a part of an existing module.

Use the seam test: if the code has its own port shape and could realistically be replaced (different vendor, different cloud, different algorithm) in two years, it earns a module. If it's just "a place to put related code," it's a sub-package inside an existing module.

## Anti-patterns

- **Anemic domain.** Domain models that are pure data with no behavior; all logic lives in services. Sometimes appropriate, often a sign that the domain is poorly understood.
- **Leaky adapters.** A Postgres adapter that returns `psycopg.Row` objects up into the domain. The domain now depends on Postgres. Map adapter results into domain types at the boundary.
- **God module.** One module accreting features that should belong elsewhere. Split when the public surface exceeds 15 methods or the README exceeds 1,500 words.
- **Public-by-default.** Everything in the module is exported. Consumers reach into internals. Boundaries decay. Use `public/` discipline ruthlessly.
- **Cyclic dependencies.** Module A imports B; B imports A. The import-linter rejects this; if you find one, you have a missing module to extract or a layer violation.

## Plain-English Guide to Module Taxonomy Terms

- **Port.** An interface that the domain depends on. The domain says "I need somebody to save users for me"; the port describes what "save users" looks like as a function.
- **Adapter.** An implementation of a port. The Postgres adapter saves users to Postgres. The in-memory adapter saves them to a Python dict.
- **Primary port.** Something the outside world calls _into_ the domain (e.g., an HTTP endpoint).
- **Secondary port.** Something the domain calls _out to_ (e.g., a database, an LLM API).
- **Composition root.** The one place in the application where adapters are constructed and bound to modules. Also called "wiring."
- **Public surface.** The set of types and methods other modules and applications are allowed to import. Anything else is internal.

## Related

- [Phase 5 overview](/phase-5-platform/) — the seven modules
- [Auth module](/phase-5-platform/auth-module/) — first concrete example of the pattern
- [API-First Design](/phase-4-dev-stack/api-first-design/) — module HTTP surfaces follow this
- [Testing Strategy](/phase-4-dev-stack/testing-strategy/) — unit / adapter / module tests

---
title: API-First Design
description: OpenAPI specifications as source of truth, versioning policy, contract testing, an agency-wide style guide, and an API registry that makes APIs discoverable.
sidebar:
  order: 7
---

API-first design means the API is designed and specified before implementation begins, and the specification is the source of truth from which clients, servers, documentation, and tests are generated. It is not "we use REST" or "we have OpenAPI." Most agencies have OpenAPI files; few have API-first design.

The shift matters because every long-lived agency platform becomes a network of APIs that other systems depend on. The API contract is the durable artifact; the implementation behind it changes many times. Treating the contract carelessly is how integrations break, and how integrations break is how vendor and partner relationships erode. Phase 4 sets the standards that prevent this.

## Why API-first

Three concrete benefits.

1. **Multiple consumers can build in parallel.** Once the OpenAPI spec is agreed, the frontend team, the API team, and any external partner can work simultaneously against the same contract. Mocks generated from the spec stand in for the not-yet-built server.
2. **Generated clients beat hand-written ones.** A type-safe TypeScript client generated from the spec is more correct, more current, and cheaper to maintain than the equivalent hand-written one.
3. **The contract is reviewable.** Reviewing a 200-line OpenAPI diff is much faster than reviewing the implementation diff that produces the same API surface. Catches breaking changes early.

## The agency standard

Every API the agency exposes — internally to other teams or externally to vendors and partners — should have a documented contract. The minimum is a committed OpenAPI file or README contract table with an owner; the standard path is an OpenAPI document enforced in CI.

| Surface              | Standard                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| Specification format | **OpenAPI 3.1+** or the current agency-supported OpenAPI version; evaluate OpenAPI 3.2 as tooling supports it. Use AsyncAPI 3.0 for event-driven APIs. |
| Source of truth      | The spec is generated from the code OR the code is generated from the spec — pick one and CI-enforce |
| Style                | Agency style guide (this page) applied via Spectral linting in CI                                    |
| Versioning           | Semantic versioning of the API; breaking changes require a major bump and a deprecation plan         |
| Documentation        | Auto-rendered Swagger UI / Redoc on a stable URL per environment                                     |
| Discovery            | Minimum: README/catalog entry; Standard: static registry or gateway developer portal; Large: Backstage/API catalog |
| Contract tests       | Minimum: schema validation and generated-client tests; Standard/Large: Pact or equivalent for critical consumers |
| Authentication       | OIDC bearer tokens; no API keys for human-driven traffic                                             |
| Error format         | RFC 9457 Problem Details (obsoletes RFC 7807)                                                        |

## Specification-first vs. code-first

Two approaches; the agency picks one and applies it consistently.

### Code-first (recommended for Python / .NET / TypeScript)

The implementation is annotated with types and metadata; the OpenAPI spec is generated from the code.

- **Python (FastAPI):** Spec auto-generated from Pydantic models and route signatures. The agency commits the generated `openapi.yaml` and CI verifies it matches the running app.
- **.NET (ASP.NET Core):** Swashbuckle / NSwag generates the spec from controllers and DTOs.
- **TypeScript (NestJS, Hono, etc.):** Decorator-based spec generation; commit the result.

The discipline: the spec is generated, but it is committed and reviewed in PRs. CI compares the generated spec to the committed one and fails on drift. Treat the spec as source of truth even if it isn't authored by hand.

### Specification-first (recommended for Java / multi-language services)

The OpenAPI spec is hand-authored (or design-tool-authored). The server stub and clients are generated from it.

- **Java (Spring):** `openapi-generator` produces server stubs and DTOs.
- **Go:** `oapi-codegen` is the standard.
- **Across stacks:** Most languages have a generator; the spec is the canonical artifact.

Specification-first is harder to start (requires designing the spec deliberately) but produces a cleaner API and better partner experience. Pick this path if the agency's APIs have lots of external consumers.

## Style guide (Spectral-enforced)

The agency style guide is a Spectral rules file. CI runs `spectral lint openapi.yaml` and blocks merges on violations. Sample rules:

| Rule                                               | Why                                                             |
| -------------------------------------------------- | --------------------------------------------------------------- |
| Paths in kebab-case (`/cases/{caseId}`)            | URL convention; readable and consistent                         |
| Resource names plural (`/cases`, not `/case`)      | REST convention                                                 |
| Operations have `operationId`                      | Generators produce useful method names                          |
| Operations have `summary` and `description`        | Generated docs are usable                                       |
| Operations have at least one `tag`                 | Docs grouping                                                   |
| Every 4xx response uses `application/problem+json` | RFC 9457 Problem Details format                                 |
| Every 200 list response is paginated               | Lists never become unbounded                                    |
| Every endpoint declares its security               | Auth is explicit, not inherited silently                        |
| Schemas have `description` on every property       | Generated clients have IntelliSense; partners can read the spec |
| No additional properties on request bodies         | Catch typos at the API boundary                                 |
| Date / datetime use ISO 8601 with timezone         | Avoid ambiguous local-time bugs                                 |
| IDs use UUIDs (or other typed IDs), not bare ints  | Hard-to-confuse identifiers                                     |

The rule set lives in the agency's shared standards repo as `.spectral.yaml`. Repos extend it; they do not redefine.

## Versioning

The agency uses semantic versioning of the API.

- **Major** — breaking change. Removed field, removed endpoint, changed type, changed error semantics. Requires deprecation plan.
- **Minor** — additive change. New endpoint, new field, new optional parameter, new response code.
- **Patch** — bug fix that does not change the contract. Documentation correction, server-side fix.

The version appears in **two places**:

1. The URL: `/v1/cases`. New majors live alongside (`/v2/cases`); old majors stay until deprecation completes.
2. The OpenAPI `info.version` field, kept in sync.

Header-based versioning (`Api-Version: v2`) is acceptable but URL-based is more discoverable for partners. Pick one and stay consistent.

## Deprecation policy

Breaking changes are not free. The agency's policy:

- **Mark the old version `deprecated: true`** in the spec the day the new version ships.
- **Sunset header** (RFC 8594) communicates the removal date in API responses.
- **Minimum 12-month deprecation window** for external consumers; 6 months for internal-only APIs.
- **Migration documentation** published the day the new version ships.
- **Removal** only after telemetry shows zero usage for 30 days OR the deprecation window has elapsed (whichever is later).

A breaking change without a deprecation plan is a finding in any PR review.

## Authentication and authorization in the spec

Every endpoint declares:

- `security` block referencing the auth scheme (OIDC).
- Required scopes / roles in the security requirement.
- Per-endpoint authorization in the `description` if it differs from the default for the resource.

The spec is the source of truth for "who can call what." Service-side authorization checks reference the same scopes; mismatch is a CI failure.

## Error format (RFC 9457 Problem Details)

```json
{
  "type": "https://errors.agency.gov/cases/already-closed",
  "title": "Case is already closed",
  "status": 409,
  "detail": "Case 1234 was closed on 2026-04-01 and cannot be reopened.",
  "instance": "/cases/1234/reopen",
  "request_id": "01HE..."
}
```

RFC 9457 obsoletes RFC 7807 and defines the current Problem Details format for HTTP APIs. The agency requirement:

- All 4xx and 5xx responses use this shape.
- `type` is a stable URL; documentation lives at that URL.
- `request_id` carries the trace ID; users report it to support.
- No leaking of stack traces or internal implementation in `detail`.

The shape is in the agency's shared schema and is referenced by every API.

## Pagination

Lists never come back unbounded. Every list endpoint paginates.

The agency standard: **cursor-based** pagination for any list that grows.

```
GET /cases?limit=50&cursor=eyJpZCI6...

Response:
{
  "data": [ ... ],
  "next_cursor": "eyJpZCI6...",  // null when end reached
  "limit": 50
}
```

Why cursor and not offset: stable across inserts, scales to large datasets without slow `OFFSET` queries. Offset pagination is acceptable only for small, append-only datasets.

## Contract testing (where this connects)

Contract tests (covered in [testing strategy](/phase-4-dev-stack/testing-strategy/)) verify that producers and consumers agree on the contract specified by the OpenAPI spec.

- The producer's contract test asserts: the OpenAPI spec accurately describes what the running server returns.
- The consumer's contract test asserts: this client correctly handles every documented response shape.

Together, they prevent the "we changed `caseId` to `case_id` and four downstream services broke" failure.

## API discoverability

The agency should make APIs discoverable at a level that matches its size. A small agency with one or two APIs does not need Backstage on day one; it does need an owner and a place where another developer or vendor can find the contract.

Minimum catalog fields:

- Name, owner, description, current version, status (active / beta / deprecated).
- Link to the OpenAPI spec or contract table.
- Link to rendered docs if available.
- Endpoint URL by environment where appropriate.
- Authentication required and how to request access.

Tooling options:

- **Backstage** with the API plugin — heaviest, most flexible. Good if the agency commits to Backstage as IDP (Phase 5).
- **GitOps registry** — a single repo with `apis/{name}/spec.yaml` and a CI pipeline that publishes a static catalog site. Lightweight; good first version.
- **Cloud-native API gateways** (Azure API Management, AWS API Gateway, Apigee) include a developer portal that doubles as a registry. Pick this if the agency already has the gateway.
- **README table** — enough for the first pilot: API name, owner, spec path, environment URL, auth notes.

API discoverability is a core Phase 4 control; the tool can scale from a README table to a formal registry. "I didn't know this API existed" is a primary cause of duplicate-effort across teams.

## Async and event-driven APIs

Not every interface is HTTP request/response. For event-driven surfaces:

- **AsyncAPI 3.0** is the OpenAPI equivalent for async. Same discipline: spec is source of truth, validated in CI where possible, and cataloged.
- **Schema registry** (Confluent Schema Registry, AWS Glue Schema Registry, etc.) for the message payloads.
- **Event versioning:** carry a `schemaVersion` field in every event; consumers log + alert on unexpected versions.

The Phase 4 standard treats async APIs with the same discipline as sync APIs. Don't skip them.

## Internal vs. external APIs

The agency typically has two grades of API.

- **Internal** — used only by other agency systems. Documentation can be lighter; deprecation can be faster (6 months); auth is workload identity.
- **External** — used by other agencies, vendors, residents. Documentation is partner-facing; deprecation 12+ months; auth is OAuth client credentials or per-user tokens; rate-limiting is enforced.

Both follow the style guide. The differences are in deprecation policy, documentation depth, and the SLO targets.

## Common API-design failures

- **OpenAPI files that don't match the running app.** Drift is the default; CI must enforce equality.
- **No deprecation plan.** Teams break partners and only learn about it through angry emails.
- **Different error formats per endpoint.** Pick RFC 9457 Problem Details once; apply everywhere.
- **Unbounded lists.** Returning all 50,000 cases in one response. Always paginate.
- **Auth as an afterthought.** Endpoints with no security declaration "because it's internal." Internal still authenticates; the workload identity scheme applies.
- **One giant API for many concerns.** A 400-endpoint API is unmaintainable. Split into domain-bounded APIs; reference them from the registry.
- **Generated SDKs not updated.** A spec change without a corresponding client release means consumers can't see the new fields. Wire SDK release into CI.

## Adopting in existing repos

Existing agency APIs that don't meet the standard:

- Add Spectral linting in audit-only mode for one quarter; surface violations without blocking.
- Fix the high-impact violations (missing security, missing pagination, inconsistent errors).
- Switch Spectral to enforcing on the next major release.
- Don't rewrite an existing API for style compliance only; bundle the cleanup with the next planned major.

## Related

- [Coding Standards](/phase-4-dev-stack/coding-standards/) — the standards the API code follows
- [Testing Strategy](/phase-4-dev-stack/testing-strategy/) — the contract tests that bind to the spec
- [ADR Template](/phase-4-dev-stack/adr-template/) — how breaking-change decisions are recorded
- [Phase 5 — Modular Platform](/phase-5-platform/) — the modules that expose APIs to each other

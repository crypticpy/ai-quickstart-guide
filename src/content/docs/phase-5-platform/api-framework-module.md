---
title: API Framework Module
description: Request/response plumbing, error format, pagination, rate limit, and OpenAPI generation — the agency's web framework conventions in one package.
sidebar:
  order: 6
---

The API Framework module wraps the underlying web framework (FastAPI, ASP.NET Core, Spring, Hono — whichever the agency's [stack selection](/phase-4-dev-stack/stack-selection/) chose) with the agency's conventions baked in. A team building a new application doesn't write middleware for auth, error formatting, pagination, rate limiting, or OpenAPI generation — they import this module and get all of those right by default.

The module is opinionated on purpose. Every internal HTTP API across the agency should feel the same: same error shape, same auth header, same pagination cursors, same rate-limit headers, same OpenAPI conventions. Consistency isn't aesthetic — it lets one client library, one observability dashboard, one runbook, and one debugging mental model serve every API.

## What this module owns

- **Application factory.** A `make_app()` function that returns a configured app instance with all middleware wired.
- **Request lifecycle.** Trace ID propagation, request logging, body size limits, timeouts.
- **Authentication middleware.** Validates the session token via the [auth module](/phase-5-platform/auth-module/); attaches `request.user`.
- **Authorization decorator.** `@requires(permission)` that calls the [RBAC module](/phase-5-platform/rbac-module/).
- **Error handling.** RFC 7807 Problem Details on every 4xx/5xx response.
- **Pagination helpers.** `Paginated[T]` types and cursor encode/decode.
- **Rate limiting.** Per-user and per-IP limits with consistent `Retry-After` headers.
- **OpenAPI generation.** Spec produced from typed handlers; schema endpoint at `/openapi.json`.
- **Health and readiness.** `/health` (liveness) and `/ready` (readiness with downstream checks).

## What this module does NOT own

- **Routes.** The consuming app declares its own routes.
- **Domain logic.** The framework is plumbing; the domain is in the application's modules.
- **Specific business policies.** "A case must have a title" is in the case domain, not in the framework.

## Public surface

```python
# modules/api_framework/src/api_framework/public/client.py
from typing import Protocol
from .types import (
    ApiApp, ApiSettings, RequiresPermission, Paginated,
    ProblemDetails, RequestContext
)

class ApiFramework(Protocol):
    def make_app(self, settings: ApiSettings) -> ApiApp:
        """Returns a configured application with all platform middleware."""

    def requires(self, permission: str) -> RequiresPermission:
        """Decorator. Calls RBAC.assert_can with the request user + resource."""

    def paginate(self, query, sort_keys: list[str]) -> Paginated:
        """Helper to apply cursor pagination to a query."""
```

The decorator usage:

```python
from api_framework.public import requires, ApiFramework

@router.get("/cases/{case_id}")
@requires("case.read", resource=lambda req: ResourceRef("case", req.path_params["case_id"]))
async def get_case(case_id: str, ctx: RequestContext):
    ...
```

The `requires` decorator is mandatory. The framework has a startup check that fails the boot if any non-public route is missing one. This implements [default-deny](/phase-5-platform/rbac-module/) at the API layer.

## The middleware stack (in order)

The framework wires middleware in a specific order; consumers can add to the chain but cannot reorder:

1. **Trace ID** — extract or generate `X-Request-ID`; propagate to OTel context.
2. **Request log** — start span; emit "request.received" log.
3. **CORS** — configurable per-app allowlist.
4. **Body size limit** — default 1 MB; uploads use a separate endpoint with a higher limit.
5. **Timeout** — default 30s per request; long operations go async.
6. **Rate limit** — token bucket per (user_id, route) and (ip, route).
7. **Authentication** — validate session token; attach user.
8. **CSRF** — for browser-driven mutating endpoints; double-submit cookie.
9. **Route handler** — runs `@requires` permission check, then the handler body.
10. **Error formatter** — convert any exception to RFC 7807.
11. **Response log** — emit "request.completed" log; close span.

Each middleware is in its own file behind a port; production adapters use the language's idiomatic mechanism (FastAPI middleware, ASP.NET middleware, Spring filters, Hono middleware).

## Error format (RFC 7807)

Every error response has the same shape, per the [API-first standard](/phase-4-dev-stack/api-first-design/):

```json
{
  "type": "https://errors.agency.gov/cases/not-found",
  "title": "Case not found",
  "status": 404,
  "detail": "Case 1234 does not exist or you don't have access.",
  "instance": "/cases/1234",
  "request_id": "01HE...",
  "errors": []
}
```

The framework defines a hierarchy of typed exceptions:

| Exception            | HTTP | Use                                                    |
| -------------------- | ---- | ------------------------------------------------------ |
| `BadRequest`         | 400  | Malformed request                                      |
| `ValidationError`    | 422  | Schema validation failed; carries field-level errors   |
| `Unauthorized`       | 401  | No valid session                                       |
| `Forbidden`          | 403  | RBAC denial                                            |
| `NotFound`           | 404  | Resource doesn't exist (or row filter hides it)        |
| `Conflict`           | 409  | State conflict (e.g., reopening a closed case)         |
| `RateLimited`        | 429  | Token bucket exhausted; carries Retry-After            |
| `ServiceUnavailable` | 503  | Downstream dependency unavailable; carries Retry-After |

Handler code raises these typed exceptions; the error formatter renders them. Bare `raise` of stdlib exceptions becomes a 500 with no leak of internals — `detail` is generic; the trace ID lets ops correlate.

The `type` URL is stable per error class. Documentation lives at the URL. Third-party clients can switch on `type` without parsing `detail`.

## Authorization in handlers

The framework provides three patterns for auth checks:

1. **Decorator** — `@requires("case.read", resource=lambda req: ...)`. Most common; declares the permission inline with the route.
2. **Imperative** — call `rbac.assert_can(...)` inside the handler. Used when the resource isn't known until partway through the handler.
3. **Public** — `@public`. Explicitly marks an endpoint as not requiring auth (e.g., health checks, IdP callbacks). The startup check counts these and emits a warning if there are more than expected.

Lint rule: every route must have one of `@requires`, `@public`, or an explicit `rbac.assert_can` call. Boot fails otherwise.

## Pagination

Built-in `Paginated[T]` response model:

```python
class Paginated(Generic[T]):
    data: list[T]
    next_cursor: str | None
    limit: int
```

The `paginate()` helper takes an ORM query (SQLAlchemy / EF Core / JPA / etc.) and a list of sort keys, applies the cursor predicate, and returns the result. Cursor encoding is uniform across endpoints; clients can use the same decoder.

```python
@router.get("/cases", response_model=Paginated[Case])
@requires("case.read")
async def list_cases(query: CasesQuery, ctx: RequestContext):
    base = db.query(Case)
    return paginate(base, sort_keys=["updated_at", "id"], query=query, user_id=ctx.user.id)
```

For most list endpoints, the [Data Grid module](/phase-5-platform/data-grid-module/) builds on top of this — apps don't write list handlers manually.

## Rate limiting

Two rate-limit dimensions, per route configurable:

- **Per-user.** Default 60 req/min for authenticated users.
- **Per-IP.** Default 30 req/min for unauthenticated traffic.

The bucket is implemented in Redis (production) or in-memory (development). Headers on every response:

```
RateLimit-Limit: 60
RateLimit-Remaining: 54
RateLimit-Reset: 12
```

When exhausted, a 429 with:

```
Retry-After: 12
```

Sensitive endpoints (sign-in, password reset, search) override the default to a tighter limit. Long-running expensive endpoints can opt into an additional concurrency cap (only N in-flight per user).

## Body validation

The framework leans on the underlying typed-handler mechanism:

- **FastAPI / Hono** — Pydantic / Zod request bodies; validation happens before the handler runs.
- **ASP.NET Core** — DTOs + DataAnnotations / FluentValidation.
- **Spring** — `@Valid` + Bean Validation.

Validation failures become a 422 with field-level error details:

```json
{
  "type": "https://errors.agency.gov/validation",
  "title": "Validation failed",
  "status": 422,
  "errors": [
    { "field": "title", "code": "required", "message": "title is required" },
    {
      "field": "status",
      "code": "enum",
      "message": "status must be one of [open, closed]"
    }
  ]
}
```

The error format is consistent across stacks. Front-end form components map field codes to localized messages.

## OpenAPI generation

The framework auto-generates an OpenAPI 3.1 spec from typed handlers, with the agency's conventions applied:

- **Operation IDs** generated from the route name (e.g., `getCaseById`).
- **Tags** inherited from the router.
- **Security** declared per route (resolved from `@requires` / `@public`).
- **Error responses** documented for every common error class.
- **Pagination params** included automatically on `Paginated[T]` returns.

The generated spec is served at `/openapi.json` and validated by Spectral in CI. The reference implementation includes a Swagger UI at `/docs` (dev only) and a Redoc page at `/api-docs` (production).

## Trace ID and observability

Every request carries a `X-Request-ID` header. If absent, the framework generates one. Inside the request:

- **OTel span** is started with the request as root.
- **Logs** emitted carry `request_id`, `trace_id`, `user_id`, `route`.
- **Errors** include the `request_id` in the RFC 7807 body so users can quote it.
- **Outbound calls** propagate the trace via W3C Trace Context.

The framework's logger has structured-field support; consuming code adds fields and the framework emits them in the standard JSON shape (Phase 3 [observability](/phase-3-infrastructure/observability/)).

## Health and readiness

Two endpoints with distinct semantics:

- **`/health`** (liveness). Returns 200 if the process is alive. Used by Kubernetes liveness probes.
- **`/ready`** (readiness). Runs registered readiness checks (DB connection, downstream APIs reachable, KMS available). Returns 200 if all pass; 503 with details otherwise. Used by load balancer + Kubernetes readiness probes.

Apps register readiness checks via the framework:

```python
api.register_readiness_check("postgres", lambda: db.execute("SELECT 1"))
api.register_readiness_check("auth-jwks", lambda: auth.jwks_reachable())
```

Don't put the readiness check on `/health` — a slow downstream check then trips Kubernetes' liveness probe and the pod restarts in a loop. The two are separate by design.

## CORS

CORS is allowlist-based. The settings declare:

- **`allowed_origins`** — exact origins (no wildcards in production).
- **`allowed_methods`** — `GET`, `POST`, etc.
- **`allowed_headers`** — `Content-Type`, `Authorization`, `X-Request-ID`, etc.
- **`allow_credentials`** — true if cookies are used.
- **`max_age`** — preflight cache TTL.

The framework refuses to start if `allowed_origins` is `["*"]` and `allow_credentials` is true (forbidden by spec; common bug).

## CSRF

For browser-driven mutating requests with cookies (the agency's session model), CSRF protection is on by default:

- **Double-submit cookie pattern.** Server sets a `csrf_token` cookie; client reads it and echoes it as `X-CSRF-Token` header on mutating requests.
- **SameSite=Lax cookies** as a baseline.
- **Origin / Referer** check as defense-in-depth.

API token-authenticated requests (no cookie) skip CSRF — the auth scheme itself is the defense.

## File uploads

Uploads have their own endpoint pattern with a higher body size limit and streaming support. The framework provides `Upload` types that integrate with object storage (S3 / Blob / GCS) — the upload writes directly to a presigned URL, not through the API server.

For uploads that must transit the API (e.g., to scan, parse, or transform), the framework supports streaming multi-part with a configurable per-route size cap.

## Configuration

Settings come from environment variables (12-factor) plus a YAML config for non-secret defaults. The framework's `ApiSettings` class is typed; mistyped or missing values fail boot with a clear error.

```python
class ApiSettings(BaseModel):
    service_name: str
    environment: Literal["dev", "preview", "staging", "prod"]
    cors: CORSSettings
    auth: AuthSettings
    rate_limit: RateLimitSettings
    otel: OTelSettings
```

Secrets are never read from `os.getenv` directly — they come through the platform [secrets manager](/phase-3-infrastructure/secrets-management/).

## Testing the framework

`api_framework.testing.test_app(...)` returns a TestClient with all middleware wired against fakes (FakeAuthClient, FakeRBACClient, in-memory rate limiter). Consuming apps use it for integration tests:

```python
def test_unauthorized_returns_401(test_app):
    r = test_app.get("/cases/1234")  # no token
    assert r.status_code == 401
    assert r.json()["type"].endswith("/unauthorized")

def test_forbidden_returns_403(test_app, user_without_case_read):
    r = test_app.get("/cases/1234", token=user_without_case_read.token)
    assert r.status_code == 403
```

Behavior of every middleware is tested in the framework's own test suite; consuming apps don't retest auth / errors / pagination — they trust the framework.

## Performance overhead

The framework adds budget on every request. Measured on the reference implementation:

- Authentication (cache hit): ~1ms
- Authorization: ~2ms
- Rate limiting: ~0.5ms
- Logging + tracing: ~0.5ms
- Error formatting (only on errors): ~1ms

Total framework overhead on a happy-path request: ~4ms. Well within the budget for any realistic agency API.

## Multi-language note

The agency's reference framework is in the chosen primary stack (Python/FastAPI for most agencies). Equivalent ports exist for the secondary stacks the agency adopted in [stack selection](/phase-4-dev-stack/stack-selection/). The _public surface_ — error format, pagination, headers, OpenAPI conventions — is identical across implementations. The internals are idiomatic per language.

## Plain-English Guide to API Framework Terms

- **Middleware.** A function that wraps every request — runs before, the handler runs, then the middleware runs after. Auth, logging, and CORS are middleware.
- **Decorator.** A wrapper around a route handler that adds behavior (e.g., a permission check).
- **Cursor.** An opaque token that says "give me the next page after this point." Used instead of offset because it's stable when rows are inserted.
- **CORS.** Cross-Origin Resource Sharing. Browser security feature; the API declares which other origins are allowed to call it.
- **CSRF.** Cross-Site Request Forgery. An attack where a malicious site causes the user's browser to make an authenticated request the user didn't intend.
- **Liveness vs. readiness.** Liveness = "is the process alive." Readiness = "can the process serve traffic right now."

## Related

- [Auth Module](/phase-5-platform/auth-module/) — wired in by the framework's auth middleware
- [RBAC Module](/phase-5-platform/rbac-module/) — invoked by the `@requires` decorator
- [API-First Design](/phase-4-dev-stack/api-first-design/) — the standards this framework implements
- [Observability (Phase 3)](/phase-3-infrastructure/observability/) — what the framework's logging and tracing feed

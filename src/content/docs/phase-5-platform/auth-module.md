---
title: Authentication & SSO Module
description: OIDC sign-in, session management, JWT validation, MFA enforcement — one implementation that every application uses.
sidebar:
  order: 3
---

The authentication module turns "the agency's identity provider says this user is who they claim" into a session and a set of claims that every other module can trust. It is the first module the agency builds because every subsequent module depends on it; nothing else can move forward until sign-in works.

The bar is high. Auth bugs are security bugs. The module has a small public surface, a thin layer of agency-specific logic, and a hard rule against reinventing protocol-level cryptography. It uses well-known libraries (Authlib, MSAL, Microsoft.Identity.Web, Spring Security, Auth.js) at the adapter layer and exposes one consistent API to every application.

## What this module owns

- **Sign-in flows.** OIDC Authorization Code with PKCE for browser apps; client credentials for service-to-service.
- **Session management.** Issuing, refreshing, and revoking the agency's session token.
- **Token validation.** Verifying JWTs from the IdP and from the agency's own session signer.
- **MFA enforcement.** Knowing when MFA was required and verifying it occurred.
- **User identity.** A `User` type that carries the stable identifier other modules use.
- **Audit hooks.** Every authentication-relevant event is emitted as a structured log + OTel span.

## What this module does NOT own

- **Authorization.** Whether a user is _allowed_ to do a thing is the [RBAC module](/phase-5-platform/rbac-module/). Authentication answers "who"; authorization answers "may they."
- **User profile management.** Phone numbers, preferences, organizational data. That is a separate domain module.
- **Identity provider operation.** The agency runs (or buys) the IdP — Entra ID, Okta, Keycloak. This module integrates with it; it does not replace it.

## The public surface

```python
# modules/auth/src/auth/public/client.py
from typing import Protocol
from .types import User, Session, AuthError, MFAStatus

class AuthClient(Protocol):
    def begin_sign_in(self, redirect_uri: str, state: str) -> str:
        """Returns the IdP authorization URL."""

    def complete_sign_in(self, code: str, state: str) -> Session:
        """Exchanges the code for tokens; returns an agency Session."""

    def validate_session(self, session_token: str) -> User:
        """Returns the user; raises AuthError if invalid."""

    def refresh_session(self, refresh_token: str) -> Session: ...
    def revoke_session(self, session_token: str) -> None: ...

    def require_mfa(self, user: User, action: str) -> MFAStatus:
        """Verifies MFA was performed within the allowed window for the action."""
```

The public types:

- `User` — `id`, `email`, `display_name`, `idp_subject`, `mfa_required_until`, `attributes`. No internal-only fields.
- `Session` — `session_token`, `refresh_token`, `expires_at`, `user`.
- `AuthError` — typed exception with subclasses (`SessionExpired`, `InvalidSignature`, `MFARequired`, `RevokedSession`).
- `MFAStatus` — `Satisfied | Required | Failed` with timestamps.

Other modules import only from `auth.public`. The internal domain models (database rows, signing keys, IdP-specific token shapes) are not visible.

## Standards followed

- **OIDC** — OpenID Connect Core 1.0. The agency is an OIDC Relying Party.
- **OAuth 2.1** — used internally for service-to-service flows; OAuth 2.0 + the PKCE / refresh-token-rotation BCPs.
- **JWT** — RS256 or ES256 for tokens. Never HS256 (symmetric) for tokens that cross trust boundaries.
- **PKCE** — required for all browser flows.
- **State parameter** — required; cryptographically random; bound to session.
- **Refresh token rotation** — every refresh returns a new refresh token; old one becomes invalid (RFC 6749 + OAuth 2.1 BCP).
- **Token revocation** — RFC 7009 endpoint exposed.

The module does not implement these protocols from scratch. It uses Authlib (Python), Microsoft.Identity.Web (.NET), Spring Security (Java), or Auth.js (Node) at the adapter layer.

## Architecture (ports and adapters)

Following the [hexagonal pattern](/phase-5-platform/module-taxonomy/), the module's seams:

| Port             | Description                                            | Production adapter                                     |
| ---------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| `IdPClient`      | OIDC client — discovery, authorize URL, token exchange | Authlib / MSAL / Spring Security                       |
| `SessionStore`   | Persist session and refresh tokens                     | Postgres (default); Redis if scale                     |
| `TokenSigner`    | Sign and verify the agency's session JWTs              | KMS-backed (Azure Key Vault / AWS KMS / GCP Cloud KMS) |
| `AuditLog`       | Emit structured authentication events                  | OpenTelemetry + central log                            |
| `MFAVerifier`    | Confirm MFA happened recently for an action            | IdP claim inspection (default)                         |
| `UserRepository` | Look up / upsert agency user records                   | Postgres                                               |

The domain — `services.sign_in`, `services.complete`, `services.validate`, etc. — depends only on these ports. Swapping Authlib for MSAL changes one adapter file.

## IdP support

The agency standardizes on **OIDC**. The module is tested against:

- **Microsoft Entra ID** (formerly Azure AD)
- **Okta**
- **Auth0**
- **Keycloak** (for self-hosted / on-prem agencies)
- **Login.gov** (federal — required for U.S. citizen-facing apps; OIDC, IAL2/AAL2)

Each IdP is a configuration profile, not a separate adapter. The OIDC discovery endpoint (`/.well-known/openid-configuration`) provides everything the module needs at runtime; no IdP-specific code paths.

## Session token shape

The agency's session is a short-lived JWT signed by KMS, with a refresh token persisted server-side.

```json
{
  "iss": "https://auth.agency.gov",
  "sub": "user-uuid",
  "aud": "agency-platform",
  "exp": 1735689600,
  "iat": 1735686000,
  "sid": "session-uuid",
  "mfa_at": 1735680000,
  "scope": "platform"
}
```

Decisions:

- **Lifetime: 15 minutes for `exp`.** Short enough that revocation matters; long enough that refresh chatter is acceptable.
- **Refresh token persists server-side.** Rotated on every use. Stored hashed.
- **`mfa_at` claim.** Records when MFA was last performed. Sensitive actions can require recent MFA.
- **No PII in the JWT.** Just the `sub` (UUID). Names and email come from the user record, fetched on demand.

## MFA policy

MFA is **required for every user**, not just admins. The agency's policy:

1. **Initial sign-in.** MFA is enforced by the IdP. The module checks the AMR / ACR claim and rejects sign-ins that didn't include MFA.
2. **Sensitive actions.** Re-MFA required if the last MFA was more than _N_ minutes ago. The default _N_ is 30 minutes; sensitive actions (bulk export, role change, secret rotation) reduce it to 5.
3. **MFA methods.** The module trusts whatever the IdP enforces — TOTP, FIDO2, push, SMS as last resort. The agency's IdP configuration (Phase 3) sets the allowed methods.
4. **Step-up auth.** When `require_mfa()` returns `Required`, the consuming app redirects to the IdP with a `prompt=login` and `acr_values` requesting fresh MFA.

## Service-to-service authentication

Inter-module calls inside the modular monolith do not authenticate — they trust the in-process boundary. Cross-process calls (a separate worker, a microservice if any) use **client credentials** flow:

- Each service has an identity in the IdP (Entra service principal / Okta service app / etc.).
- It obtains a token via client credentials at startup; refreshes before expiry.
- The receiving service validates the token with the same `validate_session()` machinery (different audience).
- No long-lived API keys for service-to-service. The Phase 3 [secrets management](/phase-3-infrastructure/secrets-management/) workload identity gives services their token without storing a static credential.

## Logging out

Logout is two operations, in this order:

1. **Revoke the agency session.** `revoke_session()` deletes the refresh token and adds the session ID to the revocation cache.
2. **Redirect to the IdP's end-session endpoint.** Discovered from the OIDC config. The IdP clears its own session.

Failing to do step 2 means the next sign-in goes through silently — the user thinks they logged out but the IdP still has them signed in. The module's logout helper does both.

## Revocation

Sessions can be revoked centrally:

- **By user** — admin force-logout from the [admin dashboard](/phase-5-platform/admin-dashboard-module/).
- **By session** — user logs out from one device.
- **By policy** — security event invalidates all sessions older than a timestamp.

Revocation is implemented as a small cache (Redis or DB-backed) checked on every `validate_session()`. Cache size is bounded by session count; entries expire when the session would have expired anyway.

## Failure modes the module must handle

Auth modules fail in distinctive ways. The reference implementation tests for all of these:

- **Clock skew.** IdP token is rejected for being "in the future" because the validating server is a few seconds ahead. Allow ±60s by default.
- **JWKS rotation.** The IdP rotated its signing key; the module's cached keys are stale. Re-fetch JWKS on validation failure once before erroring.
- **State mismatch.** A returned `state` doesn't match the one stored. Reject; do not exchange the code.
- **Redirect URI mismatch.** Always match against the registered URI, never trust query parameters.
- **Open redirector.** Post-login redirect targets must be on the allow list. Never trust an arbitrary `?next=` parameter.
- **Concurrent refresh.** Two browser tabs refresh at the same time; one wins, one's refresh token becomes invalid. Treat the loser's failure as "go back to sign-in," not as a security event.

## Observability hooks

Every public method emits an OTel span and a structured log entry. Specific events:

| Event                   | Severity | Fields                        |
| ----------------------- | -------- | ----------------------------- |
| `sign_in.success`       | INFO     | user_id, idp, mfa_method      |
| `sign_in.failed`        | WARN     | reason, idp, ip               |
| `mfa.required`          | INFO     | user_id, action               |
| `session.revoked`       | INFO     | session_id, reason            |
| `token.invalid`         | WARN     | reason, token_id              |
| `step_up.required`      | INFO     | user_id, action, last_mfa_age |
| `service.authenticated` | DEBUG    | service_id, audience          |

Failed signature validation is a WARN (not ERROR) because it is expected at boot during JWKS rotation. Repeated failures from the same client are a separate alert in the SIEM.

## Threat model (this module's slice)

The module is the front door to the platform. The threats it explicitly handles:

- **Token theft / replay.** Short token life + refresh rotation + revocation cache.
- **CSRF.** State parameter; SameSite=Lax cookies; same-origin checks on auth endpoints.
- **Open redirect.** Allow-list for post-auth redirects.
- **JWT confusion (alg=none, alg=HS256 with the public key as secret).** Adapters explicitly assert the expected algorithm; library defaults are not trusted.
- **Replay of old MFA.** `mfa_at` claim + sensitive-action re-prompt.
- **Audit log tampering.** Logs go to an append-only sink (Phase 3 observability stack); the module does not store audit logs in its own DB.

The module does NOT solve account compromise upstream of the IdP — that is the IdP's job (impossible-travel detection, brute-force protection, password rotation). Configure those controls in the IdP, not here.

## Public test utilities

Other modules need to test code that calls auth without spinning up an IdP. The module exports:

- `auth.testing.FakeAuthClient` — implements `AuthClient`; configurable to return canned users, raise `MFARequired`, etc.
- `auth.testing.make_user(...)` — factory for `User` test fixtures.
- `auth.testing.make_session(...)` — factory for `Session` test fixtures.

Importing from `auth.testing` is allowed from any test file in any module. Importing from `auth.testing` in production code fails the import-linter check.

## Performance

The module is on every request path. Targets:

- `validate_session`: p95 ≤ 2ms (cache hit), p95 ≤ 15ms (cache miss with KMS verify).
- `complete_sign_in`: p95 ≤ 200ms (one IdP token-exchange round-trip).
- `refresh_session`: p95 ≤ 50ms.

A token validation cache (validated JWT → User, keyed by session ID, TTL = 60s) keeps the hot path on cache. Invalidate on revocation.

## Migration from the existing system

Most agencies have an authentication system already — a custom OAuth implementation, a vendor middleware, an SSO that handles redirects but not session state. The migration playbook:

1. **Stand up this module** alongside the existing auth. New apps use it; old apps stay on the old auth.
2. **Identity reconciliation.** Match users in the new system to users in the old system by IdP `sub` claim (preferred) or email (fallback with manual review).
3. **Migrate apps one at a time.** Each app's switchover replaces the old auth import with `from auth.public import AuthClient`. The composition root wires the new client.
4. **Decommission the old auth** when the last app is migrated, not before.

Big-bang migrations of the auth layer have a bad track record. Take the slow path.

## Plain-English Guide to Auth Terms

- **OIDC (OpenID Connect).** A protocol for "who is this user?" built on top of OAuth 2.0. The agency's apps are OIDC clients; the IdP is the OIDC provider.
- **JWT (JSON Web Token).** A signed JSON blob carrying claims. Verifiable without calling back to the issuer.
- **PKCE (Proof Key for Code Exchange).** Defends against intercepted auth codes in browser apps. The client picks a random secret, hashes it for the auth request, and reveals it on token exchange.
- **MFA (Multi-Factor Authentication).** Requires more than a password — a second factor like TOTP, FIDO2, or a push notification.
- **AMR / ACR.** Claims in the IdP's token describing _how_ the user authenticated (AMR = methods used, ACR = level achieved). The module reads these to enforce MFA.
- **JWKS (JSON Web Key Set).** The set of public keys the IdP uses to sign tokens, served at a discoverable URL.
- **Refresh token rotation.** Every refresh returns a new refresh token; the old one is invalid. Stops a stolen refresh token from being usable forever.

## Related

- [RBAC Module](/phase-5-platform/rbac-module/) — what the user is allowed to do, given who they are
- [Identity & Access (Phase 3)](/phase-3-infrastructure/identity-access/) — the IdP this module integrates with
- [Module Taxonomy](/phase-5-platform/module-taxonomy/) — the hexagonal pattern this module exemplifies
- [API Framework](/phase-5-platform/api-framework-module/) — wires session validation into request handling

---
title: RBAC Module
description: Roles, scopes, attribute-based policies, and consistent permission enforcement across applications.
sidebar:
  order: 4
---

The RBAC module answers one question on every privileged operation: _is this user allowed to do this thing on this resource_? Authentication (the [auth module](/phase-5-platform/auth-module/)) tells you who the user is. Authorization tells you what they may do. The two are easy to confuse and the consequences of confusing them are severe.

A unified RBAC module exists because authorization is one of the highest-stakes pieces of code an agency writes and one of the most likely to be reimplemented inconsistently across teams. When each application invents its own permission language, the audit answer to "who can read this case file" becomes "let me read the seven different codebases." A platform-level RBAC module gives the agency one vocabulary, one enforcement path, and one audit trail.

## What this module owns

- **The permission catalog.** A registry of named permissions like `case.read`, `case.assign`, `audit.export`.
- **Roles.** Named bundles of permissions (`Investigator`, `Supervisor`, `Auditor`).
- **Resource-level decisions.** "Can user U do permission P on resource R?" with rich resource context.
- **Attribute-based extensions.** Beyond pure RBAC: rules that consider resource ownership, status, classification, time of day.
- **Policy evaluation.** A consistent decision pipeline that returns Allow / Deny / NotApplicable with reasons.
- **Audit emission.** Every authorization decision is logged with enough context to reconstruct it.

## What this module does NOT own

- **Authentication.** The user is already identified by [auth](/phase-5-platform/auth-module/). RBAC takes the user as input.
- **Application-specific business rules.** "A case can only be closed by its assigned investigator after all checklist items are done" is business logic; it lives in the case-management code. RBAC handles the "is the user an investigator on this case" piece, not the checklist.
- **Provisioning.** Onboarding a user, assigning their first role, syncing from HR systems — those are workflows in the [admin dashboard](/phase-5-platform/admin-dashboard-module/).

## Public surface

```python
# modules/rbac/src/rbac/public/client.py
from typing import Protocol
from .types import (
    Permission, ResourceRef, PermissionDecision,
    Role, PolicyContext, AuthorizationError
)

class RBACClient(Protocol):
    def can(self, user_id: str, permission: Permission,
            resource: ResourceRef, context: PolicyContext = ...) -> PermissionDecision: ...

    def assert_can(self, user_id: str, permission: Permission,
                   resource: ResourceRef, context: PolicyContext = ...) -> None:
        """Raises AuthorizationError if not allowed."""

    def list_permissions(self, user_id: str) -> list[Permission]:
        """Permissions the user has anywhere — used for UI gating."""

    def assign_role(self, user_id: str, role: Role, scope: ResourceRef = ...) -> None: ...
    def revoke_role(self, user_id: str, role: Role, scope: ResourceRef = ...) -> None: ...
```

The `PermissionDecision` returned by `can()` is rich: `allowed: bool`, `reason: str`, `policy_id: str`, `evaluated_at: datetime`. Consuming code can log the reason; UIs can show "you don't have permission because <reason>."

## Permission model

The agency's permissions follow a `domain.action` convention.

- **Domain** — the resource family (`case`, `inspection`, `audit`, `user`, `report`).
- **Action** — the verb (`read`, `write`, `assign`, `export`, `delete`, `admin`).

Examples: `case.read`, `case.assign`, `audit.export`, `user.admin`.

Permissions are strings declared in a central registry — typically a YAML file checked into the platform repo. Every consuming module declares the permissions it needs; the registry is the single source of truth.

```yaml
# rbac/permissions.yaml
permissions:
  case:
    read: "View a case file."
    write: "Edit a case file."
    assign: "Assign a case to another user."
    close: "Mark a case as closed."
  audit:
    read: "View audit log entries."
    export: "Export audit log entries to file."
  user:
    read: "View user profiles."
    admin: "Manage roles and assignments."
```

Adding a permission is a PR against this file plus the corresponding consuming code. Reviewers know to scrutinize permission additions — they expand the surface of "what can be done."

## Role model

A role is a named bundle of permissions. The agency's reference roles:

| Role           | Permissions (excerpt)                           | Notes                                |
| -------------- | ----------------------------------------------- | ------------------------------------ |
| `Reader`       | `*.read`                                        | Read-only across the platform        |
| `Investigator` | `case.read`, `case.write`, `case.assign` (own)  | Scoped to assigned cases             |
| `Supervisor`   | Investigator + `case.assign` (any)              | Cross-case authority                 |
| `Auditor`      | `audit.read`, `audit.export`, `*.read`          | Audit-only; no mutations             |
| `Admin`        | `user.admin`, `*.admin`                         | Platform administration; small group |
| `SecurityOps`  | `audit.read`, `session.revoke`, `secret.rotate` | Operational security work            |

Role assignments are scoped:

- **Global** — applies platform-wide.
- **Tenanted** — applies within an agency tenant (multi-tenant platforms).
- **Resource-scoped** — applies on a specific resource subtree (e.g., "Investigator on cases in Region 4").

The scope is part of the assignment, not the role definition. Role _definitions_ are universal; _assignments_ carry their scope.

## ABAC extensions

Pure role-based decisions don't capture rules like:

- "An investigator can read a case only if they are assigned to it."
- "A supervisor can reopen a case for 30 days after it closed; after that, only an auditor can."
- "Tier-3 data access requires a recent MFA event AND the user's role assignment is current AND their training is up-to-date."

The module supports **attribute-based policies** layered on top of roles. A policy is a small expression evaluated against the user, the resource, and the request context. The agency uses a constrained DSL based on Common Expression Language (CEL — used by Kubernetes, Istio, Google IAM) for portability:

```yaml
# rbac/policies/case-read.yaml
- id: case.read.investigator-assigned
  permission: case.read
  effect: allow
  condition: |
    has_role(user, 'Investigator') &&
    case.assignees.contains(user.id)

- id: case.read.supervisor
  permission: case.read
  effect: allow
  condition: has_role(user, 'Supervisor')

- id: case.read.tier3-restriction
  permission: case.read
  effect: deny
  condition: |
    case.classification == 'tier3' &&
    !user.attributes.tier3_access
```

The decision pipeline evaluates all matching policies. Effect priority: explicit Deny > explicit Allow > default Deny. The first matching deny wins; absence of any matching allow is a deny. The reason returned by `can()` names which policy fired.

## The decision pipeline

```
        ┌────────────────────────────────────┐
input → │ 1. Resolve user roles + attributes │
        │ 2. Match candidate policies         │
        │ 3. Evaluate each policy             │
        │ 4. Combine results (deny wins)      │
        │ 5. Audit emit                       │
        │ 6. Return PermissionDecision        │
        └────────────────────────────────────┘
```

Step 5 emits before step 6 returns. Even denied decisions are logged; unattempted decisions are not. Volume control: the audit adapter can sample successful low-risk `*.read` decisions at a configurable rate, but writes, denies, Tier-2/Tier-3 actions, and `*.admin` actions should be logged unless policy says otherwise.

## Where checks happen

The recommended rule: every privileged operation is checked at the API layer, and high-risk operations are checked again in the domain layer.

1. **API layer.** The [API framework](/phase-5-platform/api-framework-module/) decorator `@requires(Permission.case_read)` runs on the request handler. Returns 403 with a Problem Details response if denied.
2. **Domain layer.** For sensitive resources or code paths with non-HTTP callers, the case-management service calls `rbac.assert_can(user, 'case.read', case_ref)` before returning the case. The reason: defense-in-depth — background jobs and CLI tools can bypass the API; the domain check catches them.

UI gating using `list_permissions()` is a third layer but is _convenience_, not security. Assume an authenticated user can craft any request the API surface allows; rely on server-side enforcement.

## Architecture (ports and adapters)

| Port                | Description                                       | Production adapter                   |
| ------------------- | ------------------------------------------------- | ------------------------------------ |
| `RoleRepository`    | Read role definitions and user → role assignments | Postgres (default)                   |
| `PolicyStore`       | Load policy definitions                           | Filesystem (default); DB optional    |
| `AttributeProvider` | Look up user / resource attributes for ABAC       | Composite (auth, app, HR sync)       |
| `PolicyEvaluator`   | Evaluate CEL expressions                          | `cel-python` / `cel-go` / `cel-java` |
| `AuditLog`          | Emit decisions                                    | OTel + central log                   |
| `DecisionCache`     | Optional cache of recent decisions                | Redis or in-memory                   |

The domain — `services.evaluate`, `services.combine`, `services.assign` — is independent of all of these. The policy DSL evaluator is pluggable; CEL is the default but the module can use OPA / Rego in environments that have already adopted Open Policy Agent.

## OPA / Rego escape hatch

Some agencies have already adopted Open Policy Agent for cluster authz, network policy, or admission control. RBAC supports OPA as an alternative `PolicyEvaluator` adapter:

- Policies authored in Rego instead of CEL.
- Decisions delegated to a local OPA sidecar via gRPC.
- Bundle distribution uses OPA's standard mechanism.

The module's _public_ API is unchanged; only the policy authoring language differs. Pick OPA if the agency already runs it; pick CEL if not (CEL is simpler).

## Caching decisions

The `can()` call is on every request hot path. A cache helps but introduces staleness risk.

- Decision cache key: `(user_id, permission, resource_ref, context_hash)`.
- TTL: 30 seconds default. Short enough that role revocations propagate quickly.
- Invalidation: explicit on `assign_role` / `revoke_role` for the affected user.
- Bypass: callers can pass `bypass_cache=True` for high-stakes decisions (e.g., admin actions).

Don't cache without measurement. The cache pays for itself in apps with many `read` operations per page; not in apps that already check once per request.

## Auditing decisions

Every authorization decision is an audit event:

```json
{
  "event": "rbac.decision",
  "decision": "allow",
  "user_id": "user-uuid",
  "permission": "case.read",
  "resource": { "type": "case", "id": "case-uuid" },
  "policy_id": "case.read.investigator-assigned",
  "context": { "request_id": "trace-uuid", "ip": "...", "mfa_at": "..." },
  "evaluated_at": "2026-04-29T14:23:00Z"
}
```

These events feed the [admin dashboard](/phase-5-platform/admin-dashboard-module/) audit view and are retained per the [data classification](/phase-1-governance/risk-classification/) policy. Tier-2/3 actions are retained for the regulatory minimum; Tier-1 reads can be sampled to control volume.

## Common authorization mistakes

This module's design heads off the canonical authorization bugs:

- **Insecure direct object reference (IDOR).** "I can read case 1234 because I'm logged in" — fixed by passing the resource into `can()` and writing policies that check ownership.
- **Confused deputy.** A trusted service performs an action with its own authority instead of the user's. Policies must consider the on-behalf-of user, not the calling service.
- **Privilege escalation via role-assignment.** Anybody who can assign roles can grant themselves admin. The `user.admin` permission is itself protected; only existing admins can grant it.
- **Forgotten permission check.** A new endpoint ships without a check. Guarded by the API framework's lint or review checklist that requires `@requires`, `@public`, or an explicit assertion (default-deny posture).
- **Permission sprawl.** Permissions accumulate without retirement. Quarterly review of the permission registry; unused permissions are removed.

## Default deny

The module is **default-deny**. If no policy matches, the answer is `deny` with reason `no-applicable-policy`. The platform's wiring assumes this:

- The API framework should require each route to declare `@requires`, `@public`, or an explicit authorization assertion. Mature teams can enforce this with lint/build gates; smaller teams can start with review checklists and route tests.
- The default permission for any new endpoint is `none` (i.e., even authenticated users can't call it) until a permission is declared.
- Background jobs that need elevated authority use a service principal whose role is reviewed.

Default-allow is the source of most authorization bugs in legacy systems; default-deny costs a small upfront design effort and prevents whole classes of incidents.

## Public test utilities

Other modules need fast, deterministic authz in tests:

- `rbac.testing.FakeRBACClient` — programmable allow/deny rules; configurable per-test.
- `rbac.testing.allow_all_for(user)` / `deny_all_for(user)` — convenience.
- `rbac.testing.with_role(user, role)` — sugar for setting up role assignments.

## Performance

Starter targets:

- `can()`: p95 ≤ 5ms (cache hit), p95 ≤ 20ms (cache miss with one DB query).
- `assign_role()`: p95 ≤ 50ms.

The policy evaluator is the dominant cost. CEL evaluation is fast (microseconds); the dominant cost is attribute fetching. Co-locate the attribute provider with the RBAC service.

## Plain-English Guide to RBAC Terms

- **Role.** A named bundle of permissions. "Investigator" is a role.
- **Permission.** An action on a resource family. `case.read` is a permission.
- **Scope.** The breadth of a role assignment — global, tenant, or specific resource subtree.
- **ABAC (Attribute-Based Access Control).** Authorization that considers attributes (user, resource, environment) beyond just role membership.
- **CEL (Common Expression Language).** A small, safe expression language used by Kubernetes / Istio / Google IAM for policy. The agency uses it for ABAC rules.
- **Default-deny.** Absence of an explicit allow means deny. The opposite of default-allow.
- **Confused deputy.** A bug where a trusted service performs actions with its own authority instead of the original requester's, allowing the requester to do things they couldn't have done directly.
- **IDOR (Insecure Direct Object Reference).** Accessing a resource by ID without verifying you have permission to that specific resource.

## Related

- [Auth Module](/phase-5-platform/auth-module/) — provides the user identity RBAC operates on
- [API Framework](/phase-5-platform/api-framework-module/) — applies the `@requires` decorator that wires RBAC into HTTP
- [Risk Classification Policy](/phase-1-governance/risk-classification/) — informs which actions need tier-3 ABAC rules
- [Admin Dashboard](/phase-5-platform/admin-dashboard-module/) — surfaces role assignments and audit events to operators

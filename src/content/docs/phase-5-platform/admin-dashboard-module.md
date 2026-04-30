---
title: Admin Dashboard Module
description: Cross-app admin shell — users, roles, audit log, feature flags, system health — one place to operate every app.
sidebar:
  order: 7
---

The admin dashboard is the recommended operations surface for applications built on the platform. Operators should not have to learn a different admin UI for every internal tool. In small agencies this may be a hosted admin console plus a few app-specific screens; in larger agencies it can become a shared shell where each application registers its admin views.

The dashboard can be a platform module. When an app needs custom admin workflows, prefer registration into the shared operations surface over duplicating user, role, audit, and health views.

## What this module owns

- **The admin shell.** Navigation, layout, theming, search, command palette.
- **User management.** View users, assign roles, force logout, view session history.
- **Role management.** Create roles, edit role definitions, view who has what.
- **Audit log viewer.** Searchable, filterable view over all platform audit events.
- **Feature flag console.** Read/write flags exposed by the platform's flag system.
- **System health.** Aggregated status of every registered service / dependency.
- **Bulk operations.** With safeguards — preview, confirmation, audit trail.
- **Notification & banner system.** Operator-broadcast messages to users.

## What this module does NOT own

- **Application-specific admin.** "Reassign all open cases for an investigator who quit" is in the case-management app's admin section, _registered into_ the dashboard.
- **End-user features.** This is for operators / admins / supervisors. The user-facing app is separate.
- **Reporting / analytics.** A read-heavy reports surface is its own thing; the dashboard is for actions.

## The registration pattern

Each application registers admin views into the dashboard at startup:

```python
admin = AdminDashboard(...)

admin.register_section(AdminSection(
    id="cases",
    title="Cases",
    icon="briefcase",
    permission="case.admin",
    views=[
        AdminView(path="/cases/all", title="All Cases", component="cases:AllCasesAdmin"),
        AdminView(path="/cases/reassign", title="Bulk Reassign", component="cases:ReassignTool"),
    ],
))
```

The dashboard renders the section in its navigation only if the current user has the declared permission. The component reference points to a frontend module the consuming app ships separately and the dashboard loads via module federation (or its framework's equivalent).

The contract between the dashboard and a registered view is:

- **The dashboard provides** layout, navigation, current user, breadcrumb, audit context.
- **The view provides** its content, registers any local routes, and emits audit events for actions it performs.

## User management

The default user-management surface, available to anyone with `user.admin`:

- **Search and filter** users by name, email, role, last sign-in, status.
- **View user detail** — profile, role assignments, recent sessions, recent audit events.
- **Edit roles** — add or remove role assignments (calls the [RBAC module](/phase-5-platform/rbac-module/)).
- **Force logout** — revoke all sessions for the user.
- **Suspend / unsuspend** — disable sign-in without removing the user.
- **Impersonation** (optional, gated by separate permission) — sign in as the user for support purposes; clearly labeled, fully audited.

User-create / delete flows should route through the IdP or authoritative directory, not a standalone dashboard database. The dashboard should not create an identity that does not exist in the IdP.

### Impersonation rules

Impersonation is dangerous if mishandled. The dashboard's rules:

- Requires `user.impersonate` — separate from `user.admin`.
- Requires fresh MFA (within 5 minutes).
- Original operator's identity is preserved in every audit event during the impersonation (the audit shows _who_ acted, not just _as whom_).
- Impersonation session has a hard 30-minute cap.
- Persistent banner across the impersonated UI says "Impersonating <user> as <operator>" — non-dismissible.
- Mutating actions during impersonation log _both_ identities.
- A separate audit event marks impersonation start and end.

Some agencies forbid impersonation entirely. The module supports being compiled out (no impersonation surface, no `user.impersonate` permission). Decision is per-agency and goes in an ADR.

## Role management

For operators with `role.admin`:

- **List roles** — global, scoped, custom.
- **View role detail** — permissions granted, users assigned, scopes.
- **Edit a role** — add / remove permissions; system roles are read-only.
- **Create a custom role** — typically scoped to a specific tenant or scope.
- **Delete a role** — only allowed if no assignments reference it; otherwise the deletion is blocked with a list of users who would be affected.

Permission additions to system roles require an ADR. The module's UI links to the ADR template and reminds operators that role changes are audit-relevant.

## Audit log viewer

Every audit event from every module flows into the central event store (Phase 3 [observability](/phase-3-infrastructure/observability/)). The dashboard provides the operator's view of it.

Search / filter dimensions:

- **Time range.** Defaults to the last 24 hours.
- **Actor** — user_id or service_id.
- **Action type** — `auth.sign_in`, `rbac.decision`, `case.update`, etc.
- **Resource** — type and ID, when present.
- **Outcome** — allow / deny / error.
- **Correlation ID** — request_id or trace_id (for incident reconstruction).

Output:

- **Timeline view** — a stream of events.
- **Detail expansion** — full event JSON on click.
- **Linked traces** — one click into the trace in the observability backend.
- **Export** — CSV/JSON, with the same RBAC / watermarking as the [data grid module](/phase-5-platform/data-grid-module/).

Read access to audit log:

- `audit.read` — see audit events.
- `audit.read.all` — see audit events including those involving privacy-sensitive actions; usually only for compliance officers.
- The dashboard checks both. An auditor without `audit.read.all` sees redacted entries on Tier-3 actions.

## Feature flags

The platform's flag system is a small module exposing a typed flag client to apps. The dashboard surfaces flags for operators:

- **List flags** — name, type, current value, environments.
- **Edit a flag value** — per environment.
- **History** — who flipped what, when.
- **Targeting rules** — flags can target specific users / roles / tenants.

The flag system supports four backends:

- **Local config file** — simplest; flag changes require a deploy.
- **Database-backed** — runtime mutable; the dashboard writes the flag table.
- **Cloud-native** (LaunchDarkly, GrowthBook, Azure App Configuration, AWS AppConfig) — the dashboard talks to the API.
- **OpenFeature SDK** — agency-vendor-neutral; backend is configurable.

Flag changes are audit events. Sensitive flags (anything that affects authorization, billing, data classification, or safety behavior) should require stronger control, such as dual approval or change review, depending on risk.

## System health

A single page that aggregates:

- **Service status** — every registered service's `/ready` result.
- **Downstream dependencies** — DB, IdP, KMS, object storage, LLM provider — each with a status indicator.
- **Recent incidents** — open and recently closed.
- **Active feature flag overrides** — what's currently flipped.
- **Recent deploys** — last N deploys per service.
- **Background jobs** — queued, running, failed counts.

Each tile links to the deeper view (the observability backend, the feature flag console, the deploy log).

The page is the operator's "what's the state of the platform right now" surface. It's not a replacement for Grafana / Datadog / Application Insights dashboards — those serve engineers digging into specific signals. The system health view is the one-screen overview for an operator who needs to know if the platform is healthy.

## Bulk operations

Operators sometimes need to act on many records at once: reassign all of an investigator's cases when they leave; mark a batch of cases as Tier-3 after a policy change; archive cases beyond a retention threshold.

The dashboard's bulk operation pattern:

1. **Filter / select.** The operator builds a query (using the [data grid](/phase-5-platform/data-grid-module/)) describing the rows.
2. **Preview.** The first 100 rows are shown; the total count is computed; the diff is described in plain language ("Will reassign 1,247 cases from Jane to John").
3. **Confirm.** The operator types the count number to confirm — a small friction barrier that prevents fat-finger disasters.
4. **Async execute.** The operation runs as a background job with progress visible.
5. **Audit.** Each affected record is an audit event; the bulk operation is itself one event with the query and count.
6. **Undo (where possible).** If the operation has a reverse, the dashboard records enough context to support an "undo last operation" within a window.

Bulk operations require their own permission (`*.bulk`), separate from the per-record permission. Bulk actions are not just "many singular actions" — they have different risk and need a different gate.

## Banners and broadcast messages

The dashboard supports operator-issued banners visible across the platform:

- **Maintenance window** — scheduled banner that auto-shows during the window.
- **Service degradation** — manual banner during an incident.
- **Policy update** — informational, auto-dismiss with acknowledgment.

Banners are typed (info / warning / critical) and rendered consistently in the platform shell. Setting a banner is an audit event; criticality determines the dual-control requirement.

## Architecture (ports and adapters)

| Port                      | Description                               | Production adapter                 |
| ------------------------- | ----------------------------------------- | ---------------------------------- |
| `UserDirectory`           | Read users from the IdP                   | Microsoft Graph / Okta / Auth0 SDK |
| `RoleClient`              | Read/write role assignments               | Calls into RBAC module             |
| `AuditQuery`              | Search audit events                       | OpenSearch / Loki / cloud-native   |
| `FeatureFlagClient`       | Read/write flags                          | OpenFeature with concrete backend  |
| `JobQueueClient`          | Submit and track bulk-op jobs             | Platform job queue                 |
| `ServiceHealthAggregator` | Poll readiness across registered services | HTTP fanout                        |
| `BannerStore`             | Persist banners                           | Postgres                           |

The dashboard's domain is largely orchestration — it composes other modules' clients. Most logic is at the ports/adapters seam.

## Frontend architecture

The shell is a React application (with Vue / Lit variants for agencies that picked those). Section UIs are loaded dynamically:

- **Module federation** (Webpack 5+ / Vite plugin) — apps publish their admin module; the shell loads at runtime.
- **Iframe sandbox** — fallback for apps that can't share the shell's runtime.
- **Server-rendered partial** — for HTMX-based apps, sections can be server-rendered partials embedded in the shell.

The shell provides shared services (auth, theming, navigation, command palette, toasts) via a typed context that registered modules consume.

Accessibility baseline: WCAG 2.2 AA on the shell; sections inherit. The shell ships with the agency's design tokens (colors, typography, spacing) and dark-mode support.

## Observability of operator actions

Every action an operator takes through the dashboard is an audit event. Beyond audit:

- **Operator session recording** (optional, off by default) — for high-stakes consoles, record the operator's UI session for after-the-fact review. Privacy-sensitive; requires policy approval before enabling.
- **Action-rate alerts** — unusual operator behavior (1,000 role changes in 5 minutes) triggers an alert in the SIEM.
- **Permission usage telemetry** — which admin permissions are exercised most often informs the role design.

## Common admin-dashboard failures

- **Every app builds its own admin.** The platform loses leverage when basic admin surfaces are duplicated. Establish "register, don't rebuild" as the standard where a shared dashboard exists.
- **No bulk safeguards.** An admin "delete all" button without preview/confirmation/audit. Build the bulk-op pattern once; reuse it.
- **Admin actions not audited.** Audit the dashboard at least as carefully as the user-facing app — admin actions are higher risk per click.
- **Impersonation without controls.** Either avoid it or implement the full control set. Halfway implementations create audit and privacy risk.
- **Permissions confused with roles in the UI.** Operators routinely confuse "this user has role X" with "this user has permission Y." The UI should make both visible.
- **System health is a graveyard.** Status indicators that always say "healthy" become unread. Tie indicators to real readiness checks; tune so green means something.

## Plain-English Guide to Admin Dashboard Terms

- **Admin shell.** The wrapper UI (nav, header, layout) that hosts every application's admin views.
- **Module federation.** A frontend technique where one app loads code from another at runtime — used so the shell can host views shipped by separate apps.
- **Impersonation.** An operator signing in _as_ another user for support purposes, with audit and controls.
- **Bulk operation.** An action applied to many records at once — preview, confirm, execute, audit.
- **Dual control.** A change that requires two people's approval before it takes effect (e.g., flipping a sensitive flag).
- **Feature flag.** A configuration that toggles a feature on/off without a deploy. Used for gradual rollouts and emergency kill-switches.

## Related

- [Auth Module](/phase-5-platform/auth-module/) — operator identity comes from here
- [RBAC Module](/phase-5-platform/rbac-module/) — role / permission management is delegated here
- [Data Grid Module](/phase-5-platform/data-grid-module/) — admin lists are grids
- [Observability (Phase 3)](/phase-3-infrastructure/observability/) — the audit / telemetry the dashboard reads
- [API Framework](/phase-5-platform/api-framework-module/) — the API surface the dashboard exposes

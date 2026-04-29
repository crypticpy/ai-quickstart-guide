---
title: Module Registry & Internal Developer Platform
description: How developers discover platform capabilities and scaffold new applications without filing tickets — Backstage, golden paths, and self-service.
sidebar:
  order: 11
---

A platform that nobody can find isn't a platform. The Module Registry and Internal Developer Platform (IDP) are the user interface for the platform — the surfaces that let a developer discover what's available, scaffold a new application, deploy it, see its logs, and operate it without filing tickets.

The IDP is what turns "we have seven modules and inner-source contribution" into "a developer at the agency can scaffold a working internal tool in under an hour, with auth, RBAC, lists, AI, and admin already wired in." That's the moment Phase 5 cashes its check.

## What "Internal Developer Platform" means

A few definitions in circulation; the agency's working definition:

> An IDP is the self-service surface that lets a developer go from "I want to build a thing" to "the thing is in production" without per-step approval, ticket filing, or specialist knowledge of the underlying infrastructure.

The IDP is _not_ the underlying platform — that's Phases 3, 4, and 5 combined. The IDP is the layer on top that exposes the platform's capabilities through a coherent, self-service interface.

The dominant open-source choice is **Backstage** (CNCF, originated at Spotify, used by hundreds of organizations including the U.S. Department of Defense via Platform One). Commercial alternatives — Port, Cortex, OpsLevel — provide similar functionality with less assembly required. The agency picks one and commits.

## What the IDP exposes

The agency's IDP surface, organized by user task:

| User wants to                            | IDP surface                                               |
| ---------------------------------------- | --------------------------------------------------------- |
| Discover existing modules / APIs         | **Module registry** + **API registry**                    |
| Scaffold a new application               | **Software templates** ("golden paths")                   |
| Deploy an application                    | **Deploy view** (links to CI/CD, environment status)      |
| See an application's runtime state       | **Service overview** (status, logs, traces, dependencies) |
| Run a one-time operation                 | **Action catalog** (provision DB, rotate secret, etc.)    |
| Find a runbook or piece of documentation | **TechDocs** (markdown rendered in IDP)                   |
| Find an owner / on-call                  | **Catalog** (every entity has an owner)                   |
| Track ownership across the platform      | **Software catalog** (entities + relationships)           |

Every surface is a Backstage plugin or equivalent in the chosen IDP.

## The software catalog

The catalog is the spine. It lists every "entity" the platform knows about:

- **Components** — services, websites, libraries, modules.
- **APIs** — every API the agency exposes.
- **Resources** — databases, S3 buckets, queues, secrets, ML models.
- **Systems** — collections of components that deliver a capability ("Case Management System").
- **Domains** — higher-level groupings ("Health & Human Services").
- **Groups** — teams.
- **Users** — people.

Entities are declared in YAML files checked into each repo:

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: cases-api
  description: Case-management REST API
  tags: [java, spring, tier-2]
  annotations:
    github.com/project-slug: agency/cases-api
    backstage.io/techdocs-ref: dir:.
spec:
  type: service
  lifecycle: production
  owner: case-platform-team
  system: case-management
  providesApis: [cases-v1]
  consumesApis: [auth-v1, rbac-v1, ai-orchestration-v1]
  dependsOn: [resource:cases-db, component:auth-service]
```

Backstage scrapes these files from registered repos and renders the relationships. The agency's catalog gives a queryable, navigable map: "show me everything that depends on the auth module," "who owns the cases system," "which components are tier-3."

Discovery rules:

- **Required for production.** A component cannot reach production without a catalog entry. CI enforces.
- **Owner is mandatory.** Unowned entities are auto-flagged for orphan resolution.
- **Lifecycle is honest.** `production` / `staging` / `experimental` / `deprecated`. Filter by lifecycle in views.

## Module registry

The platform modules — the seven from [Phase 5](/phase-5-platform/) plus any others — appear in the catalog with extra metadata:

- **Public API documentation** — generated from the module's OpenAPI / Protobuf / typed client.
- **Versioning history** — which version is in which environment.
- **Consumer list** — every component that depends on the module (auto-derived from the catalog).
- **CONTRIBUTING link** — to the module's contribution guide.
- **Roadmap link** — to the module's public roadmap (issue tracker filter).
- **Maintainers** — names and contact.
- **Eval / quality dashboards** — if applicable (AI orchestration's eval pass rate, for instance).

The registry view answers, in one place: "what modules does the platform offer, who owns them, what version is current, who consumes them, and how do I contribute?"

## API registry

A specialized view of the catalog focused on APIs:

- **OpenAPI rendered docs** (Swagger UI / Redoc) inline.
- **Try-it-out** for non-mutating endpoints.
- **Authentication info** — how to get credentials.
- **SLAs** — uptime, latency, deprecation policy.
- **Consumer list** — who uses this API.
- **Spec download** for offline use.

The API registry is the agency's discovery answer: a developer asking "is there already a service that returns the case for an applicant" finds the answer in seconds. Without the registry, the answer is asking around in Slack and reinventing the wheel half the time.

## Software templates ("golden paths")

The IDP's most valuable surface for new work. A software template is a parameterized recipe that scaffolds a working application from agency-approved patterns.

```yaml
# templates/internal-tool-fastapi-react/template.yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: internal-tool-fastapi-react
  title: Internal Tool — FastAPI + React
  description: |
    A new internal tool with FastAPI backend, React frontend, auth+RBAC wired,
    a data grid, deployed to the standard environments.
spec:
  parameters:
    - title: Basics
      properties:
        name: { type: string }
        owner: { type: string }
        description: { type: string }
    - title: Features
      properties:
        include_ai: { type: boolean, default: false }
        include_documents: { type: boolean, default: false }
        primary_entity:
          { type: string, description: "Main resource (e.g., 'case')" }

  steps:
    - id: fetch-base
      action: fetch:template
      input:
        url: ./skeleton
        values: { ... }
    - id: publish
      action: publish:github
      input: { ... }
    - id: register
      action: catalog:register
      input: { ... }
    - id: deploy-staging
      action: trigger:cicd
      input: { ... }
```

The developer fills in a form (name, owner, primary entity, AI yes/no) and clicks Submit. Within minutes:

- A new repo is created with the scaffold.
- Auth, RBAC, API framework, data grid, optional AI orchestration are wired in.
- CI/CD is configured.
- Catalog entry is registered.
- The first deploy to the dev environment is in progress.

The whole "from idea to running app" cycle that used to take 4–8 weeks now takes under an hour. That ratio is the IDP's headline metric.

### Reference templates the agency ships

| Template                         | What it scaffolds                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| Internal tool — FastAPI + React  | Standard back-office app with a primary entity, data grid, admin                         |
| Internal tool — ASP.NET + Blazor | Same, .NET stack                                                                         |
| API service — FastAPI            | Pure backend service exposing an API                                                     |
| API service — Spring             | Same, Java                                                                               |
| Worker service — Python          | Background-job worker (queue consumer)                                                   |
| AI feature — RAG over documents  | Document ingestion + retrieval + chat UI                                                 |
| Static site — Astro              | Documentation / informational microsite                                                  |
| Module — platform contribution   | A new platform module conformant with the [taxonomy](/phase-5-platform/module-taxonomy/) |

Each template ships with a working test suite, a CI pipeline, an OTel-instrumented runtime, and a `README` that's long on getting-started and short on lecture.

### Golden paths principle

A "golden path" is the recommended way to do a thing. The IDP makes the golden path the easy path — easier than rolling your own. Examples:

- The golden path for "I need to authenticate users" is "use the auth module via the IDP-scaffolded template." Easier than rolling your own OIDC.
- The golden path for "I need to run scheduled jobs" is "use the worker template with the platform queue." Easier than running your own cron.
- The golden path for "I need a vector store" is "register an index with AI orchestration." Easier than provisioning a separate vector DB.

The agency does not _require_ teams to take the golden path — they're allowed to deviate, with an ADR — but the golden path is so easy that 90% of teams take it.

## TechDocs

Documentation is rendered inside the IDP from markdown files in each repo. Backstage's TechDocs plugin reads `mkdocs.yml` (yes, MkDocs, not the Astro site we're building, though the agency standardizes on this guide as the cross-platform reference). Documentation lives next to the code it describes; the IDP renders it in a unified search.

The result: a developer searching "how do I set up rate limiting" finds the API framework's docs, regardless of which repo they live in. Documentation does not become unfindable in Confluence-land.

## Action catalog

Common operations that used to require ticket filing become self-service IDP actions:

| Action                      | What it does                                                  |
| --------------------------- | ------------------------------------------------------------- |
| Provision dev database      | Creates a Postgres database in the dev cluster, returns URI   |
| Rotate service secret       | Triggers KMS-backed rotation, restarts dependents             |
| Add member to repo          | Adds the user to the repo's access group                      |
| Onboard team to platform    | Creates the team's groups, repos, environments                |
| Request elevated permission | Creates a typed approval ticket; auto-grants on dual sign-off |
| Submit eval suite run       | Runs an AI orchestration eval suite ad-hoc                    |

Each action is a Backstage scaffolder template (or commercial-IDP equivalent) wired to the underlying infrastructure. Self-service paths replace ticket queues. Approvals are still required for sensitive actions, but the workflow is in the IDP, audit trails included.

## Service overview view

For a deployed service, the IDP shows:

- **Health** — current readiness, recent uptime.
- **Deploys** — last 10 deploys, who shipped what.
- **Dependencies** — APIs consumed, resources used.
- **Consumers** — who depends on this service.
- **On-call** — who to page right now.
- **Logs** — recent error logs (linked to the observability backend).
- **Traces** — recent slow traces.
- **Metrics** — request rate, error rate, latency p95.
- **Cost** — last month's compute / storage / AI cost (where applicable).

The view is the operator's "one stop shop" for context on a service. Engineers don't bounce between four tools to figure out what's going on.

## Backstage vs. commercial alternatives

The choice depends on the agency's posture.

| Option        | Pros                                                | Cons                                                          |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------- |
| **Backstage** | Open source; CNCF; large plugin ecosystem; flexible | Requires a dedicated team to operate; heavy lift to customize |
| **Port**      | Hosted; quick start; opinionated good defaults      | Cost; less flexibility for unusual needs                      |
| **Cortex**    | Strong scorecards / quality gates                   | Less flexible for arbitrary plugins                           |
| **OpsLevel**  | Mature service catalog; SLO tooling                 | Catalog-focused; less "platform" surface                      |

Most agencies under 50 developers should pick Port or Cortex — the operational cost of Backstage is a real burden. Larger agencies, especially those willing to invest in IDP engineering, get more from Backstage. The agency's choice goes in an ADR.

## The Backstage stack (for agencies that pick it)

Backstage is a TypeScript application. The stack:

- **Frontend** — React; the IDP UI.
- **Backend** — Node.js; serves the catalog API and runs scaffolder actions.
- **Database** — Postgres; the catalog and metadata.
- **Auth** — OIDC against the agency IdP (Phase 3).
- **Plugins** — TechDocs, Scaffolder, Catalog, plus chosen extras (Kubernetes, GitHub, Sentry, Linear, Sonarqube).

Hosting: Backstage typically runs on the agency's standard Kubernetes cluster. Resource requirements are modest (a couple of pods, a Postgres instance).

A small dedicated team (2–3 engineers) maintains the agency's Backstage installation. Without that team, customizations stagnate and the IDP becomes a museum.

## Lifecycle and deprecation in the catalog

Catalog lifecycle states drive UI prominence:

- **`production`** — first-class display, full SLAs.
- **`staging`** — visible, marked.
- **`experimental`** — visible, marked clearly; consumers warned about stability.
- **`deprecated`** — visible with deprecation banner; planned removal date displayed.
- **`unmaintained`** — orphan flag; OSPO triages.

Deprecation banners on a service auto-propagate to the consumers list — every consuming team is notified once via the IDP, with the deprecation date and migration link. No more "we deprecated that six months ago and you didn't see the email."

## Scorecards and quality gates

The IDP can apply scorecards to entities — a set of checks that score a service's health:

- Has CONTRIBUTING.md? ✅
- Has owner? ✅
- Has at least one API documented? ✅
- Has TechDocs published? ✅
- Coverage above threshold? ✅
- All dependencies are not deprecated? ❌
- Has on-call rotation defined? ❌

Scores are aggregated by team and surfaced in dashboards. Scorecards are not punitive in their first quarter — they're a feedback signal. Once teams have time to react, scores can be tied to deploy gates (e.g., a service must score ≥ 80 on the production scorecard).

## Adoption arc

Backstage / IDP rollouts have predictable phases. The agency plans for:

- **Months 1–2.** Platform team stands up the IDP. Catalogs the platform's own modules. Ships the first software template (the most common app shape).
- **Months 3–4.** Pilot teams use the IDP to scaffold their next service. Feedback drives template improvements. The catalog grows organically.
- **Months 5–6.** Action catalog expands. TechDocs adoption broadens. Scorecards introduced as advisory.
- **Months 7+.** IDP becomes the default surface. New services are scaffolded through it; deploy / on-call / docs flow through it.

The pattern that fails: rolling out the IDP fully on day one, requiring everyone to use it before it's good. Pilot first, expand on demand.

## Common IDP failures

- **Catalog becomes stale.** Entities are registered once and never updated. Health: percentage of entities updated in the last 90 days; alert below 60%.
- **No software templates.** Catalog without scaffolder is a directory; the IDP earns its keep through golden paths.
- **Required by mandate, not by usefulness.** Mandating IDP usage when the IDP is incomplete teaches developers that the IDP is a hurdle. Make it useful first.
- **Backstage without a team.** A Backstage install with no maintainer rots within a year — plugin updates, custom views, agency-specific integrations all need ongoing work.
- **Templates that drift from reality.** A scaffolded app that doesn't actually run in the current platform shape. Templates have CI; reference apps generated from templates pass the same CI as hand-written apps.
- **Catalog ownership unclear.** Who keeps the catalog clean? The IDP team. They need authority to require entries and to prune orphans.

## What "<1 hour from idea to running app" requires

The Phase 5 success criterion is "any developer can scaffold a new app in <1 hour." Achieving this requires:

1. The software template exists and works.
2. Auth, RBAC, API framework, data grid are reachable through the template.
3. CI/CD is fully configured by the template.
4. Cloud sandbox provisioning is automated (Phase 3).
5. Catalog registration is automatic.
6. The dev environment deploy is part of the template flow.

Miss any one of these and the time stretches to days. All six in place is the unlock.

## Plain-English Guide to IDP Terms

- **IDP (Internal Developer Platform).** The self-service surface that exposes the agency's underlying platform to its developers — catalog, scaffolder, docs, deploy.
- **Backstage.** The dominant open-source IDP, originated at Spotify, donated to the CNCF.
- **Catalog.** A registry of every "entity" (service, API, library, team, resource) the platform tracks.
- **Software template / golden path.** A scaffold that creates a working application from an approved pattern.
- **Scorecard.** A set of checks scored against an entity (e.g., a service); surfaces quality and ownership gaps.
- **TechDocs.** Markdown documentation rendered inside the IDP, sourced from each repo.
- **Action catalog.** Self-service operations replacing ticket-driven workflows.

## Related

- [Phase 5 overview](/phase-5-platform/) — the modules the IDP exposes
- [Inner-Source Contribution Model](/phase-5-platform/inner-source/) — how teams contribute to the modules the IDP catalogs
- [CI/CD Pipeline (Phase 3)](/phase-3-infrastructure/cicd-pipeline/) — what software templates wire into
- [Phase 6 — Starter Project](/phase-6-starter-projects/) — the first thing scaffolded through this IDP

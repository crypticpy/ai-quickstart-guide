---
title: Cloud Sandbox Provisioning
description: Sandbox / staging / production tiers, landing zone patterns, and per-cloud (AWS, Azure, GCP) provisioning recipes.
sidebar:
  order: 2
---

The first thing Phase 3 produces is a place for developers to actually work. Without it, Track 4 labs run on personal laptops, intake submissions stall waiting for "an environment," and the platform has nowhere to live. For a no-IT or one-person-IT agency, that place may start as an approved SaaS tenant or a simple cloud sandbox. For standard and large agencies, the target structure is three environments that share a landing zone pattern but differ in policy strictness: a sandbox where teams experiment, a staging environment where the platform is integrated and tested, and a production environment that hosts real workloads with real users.

## Minimum useful Phase 3 for no-IT agencies

If the agency cannot yet provision cloud accounts, subscriptions, or projects, use a minimum controlled path:

| Control | Minimum version |
| --- | --- |
| Approved place to work | Approved AI SaaS tenant or existing cloud console, not personal accounts |
| Ownership | One named admin and one manager sponsor |
| Identity | SSO if available; otherwise named accounts with MFA and an access list |
| Data | Synthetic data only; no real PII, confidential, protected, or restricted data |
| Secrets | One approved secrets location; no secrets in spreadsheets, chat, or code |
| Cost | Monthly cap or budget alert, reviewed by the owner |
| Logs | Vendor/admin logs retained in the tool or cloud console |
| Approval | Manual intake approval before any new pilot or data source is added |

This path is not a production architecture. It is a safe starting point that lets training, intake, and Tier-1 learning move while the full infrastructure path catches up.

## Three-environment model

| Environment | Purpose                                            | Who can deploy             | Real data?                               | Outbound network                                 |
| ----------- | -------------------------------------------------- | -------------------------- | ---------------------------------------- | ------------------------------------------------ |
| Sandbox     | Experimentation, Track 4 labs, prototypes          | Any developer with SSO     | No (synthetic or sanitized only)         | Open to approved AI vendors via egress allowlist |
| Staging     | Integration tests, eval gates, pre-prod validation | CI/CD only (no human push) | Sanitized agency data, refreshed nightly | Same allowlist as production                     |
| Production  | Real workloads, real users                         | CI/CD only after approval  | Yes, scoped per use case                 | Locked-down allowlist; egress through inspection |

The discipline is that **sandbox is permissive on tooling and strict on data**, while **staging and production are strict on tooling and selective on data**. Reversing that — letting prototypes touch real data, or letting production run unsigned containers — creates avoidable security, privacy, and trust risk.

## Landing zone pattern

The full landing-zone pattern below is the standard/large-agency target. Smaller agencies can begin with the minimum control and add the full version as staffing, budget, and risk increase.

| Area | Minimum control | Full landing zone |
| --- | --- | --- |
| Boundary | Separate account/subscription/project if possible; otherwise a clearly named sandbox | Separate account/subscription/project per environment |
| Network | Use the provider's default secure baseline; no real data in sandbox | Private subnets, controlled ingress, no default outbound internet route |
| Logging | Vendor/cloud audit logs enabled and retained | Central security-owned log sink across environments |
| Identity | SSO if available; named MFA accounts otherwise | SSO federation, no long-lived local users, alarmed break-glass |
| Tags / ownership | `owner`, `env`, and cost owner documented | Enforced `env`, `owner`, `data-tier`, `cost-center`, and `tier` tags |
| Spend | Budget alert and named owner review | Alerts at 50% / 80% / 100%; non-prod auto-stop if cap is exceeded |

The full version uses these components with different policy by environment:

1. **Account / subscription / project boundary.** Each environment is its own account-level boundary. Mistakes in sandbox cannot reach production.
2. **Pre-baked network.** A VPC / VNet with private subnets for workloads, public subnets only for ingress, no default routes to the internet.
3. **Logging sink.** Every account streams logs and audit events to a central security-owned account that developers cannot write to.
4. **Identity baseline.** SSO federation enabled; no long-lived local users; break-glass account documented and alarmed.
5. **Tag policy.** Every resource carries `env`, `owner`, `data-tier`, `cost-center`, and `tier` (referencing the [risk classification](/phase-1-governance/risk-classification/)). In mature environments, untagged resources are blocked or auto-quarantined; smaller teams can start with naming conventions and a weekly owner review.
6. **Spend guardrails.** Budget alerts at 50% / 80% / 100% of monthly cap; auto-stop on non-prod when 100% exceeded.

When the team has the capacity, build the landing zone once, in code (Terraform, Pulumi, Bicep, or the cloud's native vending tool). Then provision each environment from the same template. Drift between environments is a top source of pain; the IaC pattern prevents it.

## Per-cloud landing zone

### AWS

- **Vending.** Use AWS Control Tower to vend accounts in an Organization with pre-baked OUs (e.g., `Sandbox`, `NonProd`, `Prod`, `Security`, `Logs`). Each environment is one or more accounts; the AI platform team owns the workload accounts, security owns the `Security` and `Logs` accounts.
- **Networking.** A shared-services VPC for ingress (ALB, WAF) connected via Transit Gateway; per-account workload VPCs with private subnets only. VPC endpoints for S3, DynamoDB, Bedrock, KMS, and Secrets Manager so workload traffic does not hairpin through the internet.
- **Logging.** CloudTrail organization trail to a central account; VPC Flow Logs and Bedrock invocation logs enabled by default.
- **Service control policies.** Block `iam:CreateUser`, `*:DeleteLogGroup`, region pinning, and unsigned image deployment at the OU level.
- **Reference.** AWS Landing Zone Accelerator (LZA) is a common agency-friendly starting point; verify the current accelerator, SCPs, and security baseline mappings before adopting them.

### Azure

- **Vending.** Use Azure Landing Zones (the Cloud Adoption Framework reference) to vend Management Group hierarchy with `platform/`, `landingzones/`, `decommissioned/`, `sandbox/`. Subscriptions are the environment unit; the AI platform team owns workload subscriptions, security owns the management subscription.
- **Networking.** Hub-spoke topology with Azure Firewall in the hub; spokes per environment. Private Endpoints for OpenAI, Key Vault, Storage, Cosmos DB.
- **Logging.** Activity Logs and Diagnostic Settings stream to a central Log Analytics workspace; Microsoft Sentinel for SIEM if available.
- **Azure Policy.** Built-in initiatives: NIST SP 800-53 R5, CIS Microsoft Azure Foundations Benchmark, Microsoft cloud security benchmark. Apply at Management Group level.
- **Reference.** The Azure Landing Zones accelerator on GitHub (`Azure/ALZ-Bicep` or Terraform variant) is a common starting point; verify current module support and policy initiatives against the agency's tenant.

### Google Cloud

- **Vending.** Use the Cloud Foundation Toolkit (Terraform) or Project Factory to vend a Resource Hierarchy with folders for `bootstrap`, `common`, `production`, `nonproduction`, `development`. Projects are the environment unit; security owns logging and audit projects.
- **Networking.** Shared VPC with a host project per environment tier; Private Service Connect for Vertex AI, Cloud Storage, BigQuery. VPC Service Controls perimeters for Tier-2/3 data.
- **Logging.** Aggregated sinks to a central project; Data Access logs enabled for Vertex AI and any AI services.
- **Organization Policy.** Constraints: `iam.allowedPolicyMemberDomains`, `compute.requireOsLogin`, `compute.vmExternalIpAccess`, `iam.disableServiceAccountKeyCreation`, `compute.skipDefaultNetworkCreation`. Apply at organization or folder level.
- **Reference.** The Google Cloud Foundation blueprint (`terraform-example-foundation`) is a common starting point; verify current modules, organization policy support, and any public-sector requirements before adoption.

## Sandbox-specific patterns

The sandbox is the environment most teams underinvest in. Done right, it removes 80% of the friction Track 4 developers hit.

- **Self-service provisioning.** A developer should be able to claim a personal namespace (or sub-account, or sub-project) without filing a ticket. Tag it with the developer's identity and a 7-day TTL by default.
- **Pre-installed tooling.** SSO, the agency's package mirror, the approved container registry, the CI/CD runner pool, and the AI service endpoints already configured. New developers should not need to repeat platform setup.
- **Synthetic data set.** A blessed synthetic dataset that mirrors the shape of agency data (same schemas, same structure, no real PII). The review path approves the synthetic set once; thereafter developers use it freely.
- **Loud cost surface.** Sandbox environments should show the developer the running cost in real time. Surprise bills are an adoption killer; visible cost teaches the right habits.
- **TTL and reaping.** Anything in sandbox older than 30 days without activity gets a "delete in 7 days" notice. Anything older than 90 days dead is auto-deleted unless the owner extends.

## Staging-specific patterns

- **Refreshed from production-shape data.** Sanitized snapshots from production (or production-like) data, refreshed on an approved cadence. The sanitization pipeline is itself a Tier-2 use case and goes through the review path.
- **CI/CD-only deploys.** Humans cannot push directly. Every change comes through the pipeline with eval gates passing.
- **Production-equivalent network.** Same egress policy as production; same private endpoints; same secrets manager scopes. Only the data and the user audience differ.
- **Synthetic load.** A scheduled load test that exercises the AI orchestration path catches regressions cheaper than production does.

## Production-specific patterns

- **Two-person approval for any change to security-relevant config.** Network policy, IAM, secrets, KMS keys.
- **No interactive shell access by default.** Break-glass procedures documented; alarmed when used.
- **Deployment behind feature flags.** Every new AI feature ships dark first, then to a small named user group, then broader.
- **Dedicated reviewer for first deploy.** The AI program lead or designate signs off on the first production deploy of a Tier-2 workload, even if CI/CD is green.

## Sandbox cost guardrails

Cost is the top reason agencies pull back on AI experimentation. Set the guardrails up front:

- **Per-developer monthly cap.** A typical starting cap is $200–$500/month per developer in sandbox. Above the cap, the workload pauses and the developer files a justification.
- **Tag-based attribution.** All AI service spend tagged to `developer` or `team`; weekly cost report goes to managers.
- **Free-tier exhaustion alarm.** Many AI service free tiers expire silently. Alarm before you fall off the cliff.
- **Idle workload reaper.** A workload with zero traffic for 48 hours in sandbox shuts down. Restart on demand.

## Common provisioning failures

- **Procurement says yes; identity says no.** The cloud is approved but the SSO tenant is not federated to the new tenant. Get this resolved before week 2 — it is the #1 four-week delay we see.
- **The "sandbox" is actually a shared dev environment.** If multiple developers share a single namespace, the sandbox is not a sandbox. Insist on per-developer isolation.
- **The egress allowlist becomes a denial-of-service.** Approved AI vendor endpoints should be in the allowlist on day one. Anthropic, OpenAI, Bedrock, Vertex, and the agency's vector store provider should not require a ticket each.
- **No off-ramp from the cloud.** If the entire architecture is locked into a single cloud's serverless stack, the agency has lost the option to switch. Keep the orchestration layer portable.

## Off-Ramp — Local Docker sandbox

Agencies whose cloud provisioning is delayed by 6+ weeks should not wait. Stand up a local Docker Compose sandbox with a checked-in `.env.example`, synthetic data, and no live secrets by default. Track 4 labs can run against the local sandbox until the cloud comes online.

Optional adds, when available: SSO through the existing IdP, an approved image registry, and a lightweight observability stack such as OTel + Jaeger + Loki. Treat the local sandbox as disposable training infrastructure, not the place where real agency data or production credentials live.

## Related

- [Environment Strategy & Promotion Path](/phase-3-infrastructure/environment-strategy/) — how sandbox, development, staging, and production fit together operationally
- [Identity & Access](/phase-3-infrastructure/identity-access/) — the SSO and workload identity that lives inside the landing zone
- [Container Orchestration](/phase-3-infrastructure/container-orchestration/) — what runs inside the workload subnets
- [Security Baseline](/phase-3-infrastructure/security-baseline/) — the policies the landing zone enforces
- [Risk Classification](/phase-1-governance/risk-classification/) — the tier model the tag policy references

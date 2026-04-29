---
title: Cloud Sandbox Provisioning
description: Sandbox / staging / production tiers, landing zone patterns, and per-cloud (AWS, Azure, GCP) provisioning recipes.
sidebar:
  order: 2
---

The first thing Phase 3 produces is a place for developers to actually work. Without it, Track 4 labs run on personal laptops, intake submissions stall waiting for "an environment," and the platform has nowhere to live. The right structure is three environments that share a landing zone pattern but differ in policy strictness: a sandbox where teams experiment, a staging environment where the platform is integrated and tested, and a production environment that hosts real workloads with real users.

## Three-environment model

| Environment | Purpose                                            | Who can deploy             | Real data?                               | Outbound network                                 |
| ----------- | -------------------------------------------------- | -------------------------- | ---------------------------------------- | ------------------------------------------------ |
| Sandbox     | Experimentation, Track 4 labs, prototypes          | Any developer with SSO     | No (synthetic or sanitized only)         | Open to approved AI vendors via egress allowlist |
| Staging     | Integration tests, eval gates, pre-prod validation | CI/CD only (no human push) | Sanitized agency data, refreshed nightly | Same allowlist as production                     |
| Production  | Real workloads, real users                         | CI/CD only after approval  | Yes, scoped per use case                 | Locked-down allowlist; egress through inspection |

The discipline is that **sandbox is permissive on tooling and strict on data**, while **staging and production are strict on tooling and selective on data**. Reversing that — letting prototypes touch real data, or letting production run unsigned containers — is how agencies end up in the news.

## Landing zone pattern (cloud-agnostic)

Every environment is built from the same components, just with different policy:

1. **Account / subscription / project boundary.** Each environment is its own account-level boundary. Mistakes in sandbox cannot reach production.
2. **Pre-baked network.** A VPC / VNet with private subnets for workloads, public subnets only for ingress, no default routes to the internet.
3. **Logging sink.** Every account streams logs and audit events to a central security-owned account that developers cannot write to.
4. **Identity baseline.** SSO federation enabled; no long-lived local users; break-glass account documented and alarmed.
5. **Tag policy.** Every resource carries `env`, `owner`, `data-tier`, `cost-center`, and `tier` (referencing the [risk classification](/phase-1-governance/risk-classification/)). Untagged resources are blocked or auto-quarantined.
6. **Spend guardrails.** Budget alerts at 50% / 80% / 100% of monthly cap; auto-stop on non-prod when 100% exceeded.

Build the landing zone once, in code (Terraform, Pulumi, Bicep, or the cloud's native vending tool). Then provision each environment from the same template. Drift between environments is a top source of pain — the IaC pattern prevents it.

## Per-cloud landing zone

### AWS

- **Vending.** Use AWS Control Tower to vend accounts in an Organization with pre-baked OUs (e.g., `Sandbox`, `NonProd`, `Prod`, `Security`, `Logs`). Each environment is one or more accounts; the AI platform team owns the workload accounts, security owns the `Security` and `Logs` accounts.
- **Networking.** A shared-services VPC for ingress (ALB, WAF) connected via Transit Gateway; per-account workload VPCs with private subnets only. VPC endpoints for S3, DynamoDB, Bedrock, KMS, and Secrets Manager so workload traffic does not hairpin through the internet.
- **Logging.** CloudTrail organization trail to a central account; VPC Flow Logs and Bedrock invocation logs enabled by default.
- **Service control policies.** Block `iam:CreateUser`, `*:DeleteLogGroup`, region pinning, and unsigned image deployment at the OU level.
- **Reference.** AWS Landing Zone Accelerator (LZA) is the agency-friendly starting point; it ships pre-baked SCPs and security baselines mapped to NIST SP 800-53.

### Azure

- **Vending.** Use Azure Landing Zones (the Cloud Adoption Framework reference) to vend Management Group hierarchy with `platform/`, `landingzones/`, `decommissioned/`, `sandbox/`. Subscriptions are the environment unit; the AI platform team owns workload subscriptions, security owns the management subscription.
- **Networking.** Hub-spoke topology with Azure Firewall in the hub; spokes per environment. Private Endpoints for OpenAI, Key Vault, Storage, Cosmos DB.
- **Logging.** Activity Logs and Diagnostic Settings stream to a central Log Analytics workspace; Microsoft Sentinel for SIEM if available.
- **Azure Policy.** Built-in initiatives: NIST SP 800-53 R5, CIS Microsoft Azure Foundations Benchmark, Microsoft cloud security benchmark. Apply at Management Group level.
- **Reference.** The Azure Landing Zones accelerator on GitHub (`Azure/ALZ-Bicep` or Terraform variant) is the recommended starting point.

### Google Cloud

- **Vending.** Use the Cloud Foundation Toolkit (Terraform) or Project Factory to vend a Resource Hierarchy with folders for `bootstrap`, `common`, `production`, `nonproduction`, `development`. Projects are the environment unit; security owns logging and audit projects.
- **Networking.** Shared VPC with a host project per environment tier; Private Service Connect for Vertex AI, Cloud Storage, BigQuery. VPC Service Controls perimeters for Tier-2/3 data.
- **Logging.** Aggregated sinks to a central project; Data Access logs enabled for Vertex AI and any AI services.
- **Organization Policy.** Constraints: `iam.allowedPolicyMemberDomains`, `compute.requireOsLogin`, `compute.vmExternalIpAccess`, `iam.disableServiceAccountKeyCreation`, `compute.skipDefaultNetworkCreation`. Apply at organization or folder level.
- **Reference.** The Google Cloud Foundation blueprint (`terraform-example-foundation`) is the recommended starting point and is well-documented for federal/state agencies.

## Sandbox-specific patterns

The sandbox is the environment most teams underinvest in. Done right, it removes 80% of the friction Track 4 developers hit.

- **Self-service provisioning.** A developer should be able to claim a personal namespace (or sub-account, or sub-project) without filing a ticket. Tag it with the developer's identity and a 7-day TTL by default.
- **Pre-installed tooling.** SSO, the agency's package mirror, the approved container registry, the CI/CD runner pool, and the AI service endpoints already configured. New developers should not need to repeat platform setup.
- **Synthetic data set.** A blessed synthetic dataset that mirrors the shape of agency data (same schemas, same structure, no real PII). The Review Committee approves the synthetic set once; thereafter developers use it freely.
- **Loud cost surface.** Sandbox environments should show the developer the running cost in real time. Surprise bills are an adoption killer; visible cost teaches the right habits.
- **TTL and reaping.** Anything in sandbox older than 30 days without activity gets a "delete in 7 days" notice. Anything older than 90 days dead is auto-deleted unless the owner extends.

## Staging-specific patterns

- **Refreshed from production-shape data.** Sanitized snapshots from production (or production-like) data, refreshed nightly. The sanitization pipeline is itself a Tier-2 use case and goes through Review Committee.
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

Agencies whose cloud provisioning is delayed by 6+ weeks (a common government scenario) should not wait. Stand up a local Docker Compose sandbox that mimics the eventual cloud sandbox: same SSO if Auth0 or Okta is available, same image registry if a self-hosted Harbor or GitLab registry is available, same observability stack via OTel + Jaeger + Loki. Track 4 labs run against the local sandbox until the cloud comes online. The platform team should plan a one-week migration when the cloud sandbox is ready.

## Related

- [Identity & Access](/phase-3-infrastructure/identity-access/) — the SSO and workload identity that lives inside the landing zone
- [Container Orchestration](/phase-3-infrastructure/container-orchestration/) — what runs inside the workload subnets
- [Security Baseline](/phase-3-infrastructure/security-baseline/) — the policies the landing zone enforces
- [Risk Classification](/phase-1-governance/risk-classification/) — the tier model the tag policy references

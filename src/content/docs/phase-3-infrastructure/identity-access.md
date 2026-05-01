---
title: Identity & Access
description: SSO via Entra ID / Okta / Auth0, workload identity (managed identity / IAM roles / workload identity federation), and RBAC scope design for AI workloads.
sidebar:
  order: 4
---

The identity layer decides who can do what — and "who" includes both humans and the software that calls AI services on their behalf. Agencies that get identity right have a one-day onboarding ramp, a clear audit trail, and the ability to revoke access in seconds. Agencies that get it wrong end up with shared service accounts, hard-coded API keys checked into git, and no way to answer "who used the model to generate this output?"

The right pattern is two layers: federated SSO for humans and short-lived workload identity for software wherever the provider supports it. Most major clouds and identity-provider products support this pattern. Some direct API providers still use API keys; the goal is to make those exceptions explicit, scoped, rotated, and stored in a managed secret store.

## Two identity surfaces

| Surface           | Who                                    | How they prove identity                         | Lifetime of credential |
| ----------------- | -------------------------------------- | ----------------------------------------------- | ---------------------- |
| Human SSO         | Developers, managers, reviewers        | OIDC/SAML federation from agency IdP            | Session (hours)        |
| Workload identity | CI/CD jobs, services, AI orchestrators | Cloud-issued token bound to a workload identity | Minutes (auto-rotated) |

The unifying rule: **avoid long-lived credentials wherever an identity-native option exists**. No shared admin passwords, no static service account keys, no API tokens in environment files. When an API key is unavoidable, use the exception pattern later on this page.

## Identity provider choice

Agencies usually start with the identity provider they already have. Entra ID, Okta, Auth0, Google Workspace, Ping, a state identity service, or another SAML/OIDC provider can work if it supports MFA, lifecycle management, groups, audit logs, and application federation.

### Microsoft Entra ID (formerly Azure AD)

Common fit if the agency runs Microsoft 365 or Azure. Supports SAML and OIDC out of the box; integrates natively with Azure resources via Managed Identity; federates to AWS via SAML and to Google Cloud via Workforce Identity Federation. Conditional access policies are mature.

Strong points: hybrid environments, integrated MFA, and group-based access already wired into HR systems.

### Okta

Common fit for agencies that want a dedicated SSO platform or are not centered on Microsoft. Strong directory integration, mature SCIM provisioning, broad SaaS catalog. Often paired with a non-Microsoft email platform.

Strong points: lifecycle management for SaaS access and a broad partner ecosystem for government identity patterns such as PIV/CAC support.

### Auth0

Common fit for consumer- or constituent-facing identity (residents, applicants, public-portal users) alongside staff identity. Now part of Okta but distinct product line.

Strong points: developer-friendly API and support for B2C scenarios, including public portals where the approved use case requires one.

Many agencies run two IdPs deliberately: one for staff and another for constituents. The platform should not collapse them; staff identity and constituent identity are different trust domains and should remain separate.

## Workload identity (cloud-specific)

Software calling AI APIs needs to authenticate. **Prefer short-lived workload identity wherever the provider supports it.** Every major cloud provides a way to issue short-lived, identity-bound credentials to workloads.

### AWS

- **IAM roles for service accounts (IRSA)** for EKS workloads.
- **IAM roles for tasks** for ECS / Fargate / App Runner.
- **EC2 instance profiles** for VMs.
- **OIDC federation** for GitHub Actions / GitLab CI / external CI runners — the CI job exchanges its OIDC token for a short-lived AWS role.

The model: workload assumes a role; AWS issues temporary credentials; credentials expire automatically. Bedrock and other AWS AI services authorize on the role, not on a key.

### Azure

- **Managed identity (system-assigned or user-assigned)** for Azure resources (Container Apps, AKS, App Service, VMs).
- **Workload identity federation** for AKS pods, GitHub Actions, and any external workload.
- **Service principal with certificate** as a fallback when managed identity is not available — never with client secret.

The model: workload has a managed identity; Azure AD issues tokens; Azure OpenAI and other services authorize the identity directly. RBAC is assigned at the resource scope.

### Google Cloud

- **Workload Identity Federation** for GKE workloads (GKE pods are bound to GCP service accounts via Kubernetes service accounts).
- **Workload Identity Federation** for external workloads (GitHub Actions, AWS, Azure, on-prem).
- **Attached service accounts** for Cloud Run, Cloud Functions, GCE VMs.

The model: avoid service account keys entirely. Vertex AI authorizes on the attached or federated identity.

### Cross-cloud baseline

If the platform spans clouds (e.g., the orchestrator runs on AWS but calls Vertex AI), use **OIDC federation between clouds where supported** rather than a static key. Support varies by service, tenant, and SDK. If federation is not available, use a tightly controlled secret-broker pattern: per-environment secret, scoped access, central audit logging, and rotation owned by the platform team.

## RBAC scope design

The mistake to avoid: granting "developer" or "admin" at account-wide scope. The correct pattern is **fine-grained, time-bounded, justified access** with a small set of standard roles.

A workable starter role set:

| Role                | Scope                                      | What it can do                                                                           |
| ------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `platform-admin`    | All non-prod                               | Configure landing zone, IAM, networking. Tightly held — 3–5 people max.                  |
| `platform-operator` | Per environment                            | Deploy via CI/CD, view logs and metrics, restart workloads. The day-to-day on-call role. |
| `developer`         | Sandbox only                               | Push code, run experiments, deploy to personal namespace.                                |
| `reviewer`          | Read-only across all envs                  | Read code, logs, metrics. For the review path, audit, and incident response.             |
| `data-steward`      | Per data domain                            | Approve which workloads can read which classified datasets.                              |
| `break-glass`       | All environments, alarmed and time-bounded | Emergency-only; checked out of a vault with two-person approval.                         |

Every role grant is:

- **Mapped to an identity group** in the IdP (not granted directly to a user).
- **Time-bounded.** No routine standing admin in production. Use just-in-time elevation where available (Entra PIM, AWS IAM Access Analyzer + ABAC, GCP IAM Conditions) or a documented manual approval path for smaller agencies.
- **Logged.** Role assumption events flow to the central log sink.

## Group structure

Build the IdP groups around the platform, not around the org chart. A working pattern:

- `platform-admins` — the small set of people who run Phase 3.
- `platform-operators-{env}` — operators per environment.
- `developers-{team}` — per-team developer groups.
- `ai-reviewers` — Review Committee or review-group members and equity/legal designees.
- `data-stewards-{domain}` — owners of specific data domains.
- `champions` — Track 5 champions, with sandbox elevated permissions during their term.
- `break-glass` — auditable, two-person.

HR-driven groups (department, division) are useful for license assignment but not for AI platform access. Keep them separate.

## Conditional access and MFA

Every IdP supports conditional access policies. The Phase 3 baseline:

- MFA required for all human access (TOTP minimum; PIV/CAC where mandated).
- Compliant device required for production access.
- Geographic restrictions if the agency's mandate is geographically bound.
- Session lifetime: 8 hours for sandbox, 4 hours for staging/production; refresh requires re-MFA.

Workload identity is exempt from human MFA but should be bound to a specific workload identity claim (issuer, subject) — never accept a generic federated token.

## Service-to-service authorization (AI APIs)

Workloads call AI services. Cloud-hosted AI services commonly support identity-based authorization:

- **AWS Bedrock.** Authorize on IAM role; resource policies on Knowledge Bases / Agents; Bedrock Guardrails attached to the role.
- **Azure OpenAI.** Authorize on managed identity; RBAC roles `Cognitive Services OpenAI User` (inference) and `Cognitive Services OpenAI Contributor` (deploy models).
- **Google Vertex AI.** Authorize on attached service account; predefined roles `aiplatform.user`, `aiplatform.predictor`. Customer-Managed Encryption Keys for Tier-3.
- **Anthropic API direct.** Use a per-environment API key stored in the cloud's secrets manager; rotate through the approved runbook or CI/CD; log key use where provider audit logs support it. The agency's workload identity retrieves the key, then makes the API call.
- **OpenAI direct.** Same pattern as Anthropic.

The direct API cases are the exception pattern: per-environment key, least privilege available from the provider, stored in a managed secret store, rotated on a documented schedule, audited where possible, and never committed to code, local `.env` files, chat, tickets, or CI variables. The platform's [secrets management](/phase-3-infrastructure/secrets-management/) page covers rotation.

## Onboarding and offboarding

The litmus test of an identity setup is how fast it handles change.

- **Onboarding.** A new developer should be productive within one day: SSO works, sandbox provisioned, CI/CD runners trusted. Anything longer indicates manual gates that should be automated.
- **Role change.** A developer moving to a new team gets new groups via SCIM provisioning from HR, and the old group is removed within an hour.
- **Offboarding.** When HR marks a person as departed, all access — SSO, cloud, CI/CD, AI APIs — is revoked within minutes. Test this. Most agencies have one or two paths that don't get revoked automatically; find them now, not after an incident.

## Common identity failures

- **Long-lived API keys in code.** Detected by secret scanners but only after the leak. The right fix is workload identity where supported, or the managed-secret exception pattern where direct API keys are unavoidable.
- **Shared admin accounts.** "We all use `aws-admin`" is a finding in any audit. Replace with named roles immediately.
- **No break-glass plan.** When the IdP is down, can the on-call still operate? Document and test the break-glass path; alarm on its use.
- **Constituent identity bleeding into staff identity.** Resident logins and staff logins should never share a tenant. If an Auth0 tenant has both, separate them.
- **Forgetting CI/CD.** GitHub Actions / GitLab Runners that hold long-lived cloud keys are the #2 leak path. Federate them.

## Related

- [Cloud Sandbox](/phase-3-infrastructure/cloud-sandbox/) — where the IdP is wired into the landing zone
- [Operations Lifecycle & Resilience](/phase-3-infrastructure/operations-lifecycle/) — access recertification and break-glass testing cadence
- [CI/CD Pipeline](/phase-3-infrastructure/cicd-pipeline/) — the federated identity used by the build system
- [Secrets Management](/phase-3-infrastructure/secrets-management/) — where the few unavoidable long-lived secrets live
- [Procurement Guardrails](/phase-1-governance/procurement-guardrails/) — IdP selection happens here

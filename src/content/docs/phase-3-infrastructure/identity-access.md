---
title: Identity & Access
description: SSO via Entra ID / Okta / Auth0, workload identity (managed identity / IAM roles / workload identity federation), and RBAC scope design for AI workloads.
sidebar:
  order: 3
---

The identity layer decides who can do what — and "who" includes both humans and the software that calls AI services on their behalf. Agencies that get identity right have a one-day onboarding ramp, a clear audit trail, and the ability to revoke access in seconds. Agencies that get it wrong end up with shared service accounts, hard-coded API keys checked into git, and no way to answer "who used the model to generate this output?"

The right pattern is two layers: federated SSO for humans and short-lived workload identity for software. Both are available on every major cloud and through every major identity-provider product; the choice is which IdP, not whether to use one.

## Two identity surfaces

| Surface           | Who                                    | How they prove identity                         | Lifetime of credential |
| ----------------- | -------------------------------------- | ----------------------------------------------- | ---------------------- |
| Human SSO         | Developers, managers, reviewers        | OIDC/SAML federation from agency IdP            | Session (hours)        |
| Workload identity | CI/CD jobs, services, AI orchestrators | Cloud-issued token bound to a workload identity | Minutes (auto-rotated) |

The unifying rule: **no long-lived credentials for either surface**. No shared admin passwords, no static service account keys, no API tokens in environment files. Both surfaces have well-supported alternatives on every cloud.

## Identity provider choice

Agencies typically pick one of three IdPs. The choice is usually decided before Phase 3 begins (often by the existing email/collaboration platform); Phase 3 wires it in.

### Microsoft Entra ID (formerly Azure AD)

Default if the agency runs Microsoft 365 or Azure. Supports SAML and OIDC out of the box; integrates natively with Azure resources via Managed Identity; federates to AWS via SAML and to Google Cloud via Workforce Identity Federation. Conditional access policies are mature.

Strong points: best-in-class for hybrid environments, integrated MFA, and group-based access already wired into HR systems.

### Okta

Default for agencies that want best-in-class SSO without a Microsoft commitment. Strong directory integration, very mature SCIM provisioning, broad SaaS catalog. Often paired with a non-Microsoft email platform.

Strong points: highest-quality lifecycle management for SaaS access; strong partner ecosystem for government identity (PIV/CAC support, FedRAMP-authorized at multiple impact levels).

### Auth0

Best for agencies that need consumer- or constituent-facing identity (residents, applicants, public-portal users) alongside staff identity. Now part of Okta but distinct product line.

Strong points: developer-friendly API; strong support for B2C scenarios; good for the contestation/appeals portal that Tier-3 use cases require.

Many agencies run two IdPs deliberately: Entra or Okta for staff, Auth0 (or a separate Okta tenant) for constituents. The platform should never collapse them; staff identity and constituent identity are different trust domains and should remain separate.

## Workload identity (cloud-specific)

Software calling AI APIs needs to authenticate. **Never use long-lived API keys.** Every cloud provides a way to issue short-lived, identity-bound credentials to workloads.

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

If the platform spans clouds (e.g., the orchestrator runs on AWS but calls Vertex AI), use **OIDC federation between clouds** rather than a static key. Each cloud's federation primitive accepts the other clouds' OIDC tokens. The setup is one-time and removes a class of credential leak entirely.

## RBAC scope design

The mistake to avoid: granting "developer" or "admin" at account-wide scope. The correct pattern is **fine-grained, time-bounded, justified access** with a small set of standard roles.

A workable starter role set:

| Role                | Scope                                      | What it can do                                                                           |
| ------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `platform-admin`    | All non-prod                               | Configure landing zone, IAM, networking. Tightly held — 3–5 people max.                  |
| `platform-operator` | Per environment                            | Deploy via CI/CD, view logs and metrics, restart workloads. The day-to-day on-call role. |
| `developer`         | Sandbox only                               | Push code, run experiments, deploy to personal namespace.                                |
| `reviewer`          | Read-only across all envs                  | Read code, logs, metrics. For Review Committee, audit, and incident response.            |
| `data-steward`      | Per data domain                            | Approve which workloads can read which classified datasets.                              |
| `break-glass`       | All environments, alarmed and time-bounded | Emergency-only; checked out of a vault with two-person approval.                         |

Every role grant is:

- **Mapped to an identity group** in the IdP (not granted directly to a user).
- **Time-bounded.** No standing admin in production. Use just-in-time elevation (Entra PIM, AWS IAM Access Analyzer + ABAC, GCP IAM Conditions).
- **Logged.** Role assumption events flow to the central log sink.

## Group structure

Build the IdP groups around the platform, not around the org chart. A working pattern:

- `platform-admins` — the small set of people who run Phase 3.
- `platform-operators-{env}` — operators per environment.
- `developers-{team}` — per-team developer groups.
- `ai-reviewers` — Review Committee members and equity/legal designees.
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

Workloads call AI services. Each major AI service supports identity-based authorization:

- **AWS Bedrock.** Authorize on IAM role; resource policies on Knowledge Bases / Agents; Bedrock Guardrails attached to the role.
- **Azure OpenAI.** Authorize on managed identity; RBAC roles `Cognitive Services OpenAI User` (inference) and `Cognitive Services OpenAI Contributor` (deploy models).
- **Google Vertex AI.** Authorize on attached service account; predefined roles `aiplatform.user`, `aiplatform.predictor`. Customer-Managed Encryption Keys for Tier-3.
- **Anthropic API direct.** Use a per-environment API key stored in the cloud's secrets manager; rotate via CI/CD; log key use through Anthropic's audit log. The agency's workload identity issues the call to retrieve the key, then makes the API call.
- **OpenAI direct.** Same pattern as Anthropic.

The Anthropic and OpenAI direct cases are the only places a long-lived secret lives, and it lives only in the secrets manager — never in code, env files, or CI variables. The platform's [secrets management](/phase-3-infrastructure/secrets-management/) page covers rotation.

## Onboarding and offboarding

The litmus test of an identity setup is how fast it handles change.

- **Onboarding.** A new developer should be productive within one day: SSO works, sandbox provisioned, CI/CD runners trusted. Anything longer indicates manual gates that should be automated.
- **Role change.** A developer moving to a new team gets new groups via SCIM provisioning from HR, and the old group is removed within an hour.
- **Offboarding.** When HR marks a person as departed, all access — SSO, cloud, CI/CD, AI APIs — is revoked within minutes. Test this. Most agencies have one or two paths that don't get revoked automatically; find them now, not after an incident.

## Common identity failures

- **Long-lived API keys in code.** Detected by secret scanners but only after the leak. The right fix is the workload identity pattern, not "remember not to commit secrets."
- **Shared admin accounts.** "We all use `aws-admin`" is a finding in any audit. Replace with named roles immediately.
- **No break-glass plan.** When the IdP is down, can the on-call still operate? Document and test the break-glass path; alarm on its use.
- **Constituent identity bleeding into staff identity.** Resident logins and staff logins should never share a tenant. If an Auth0 tenant has both, separate them.
- **Forgetting CI/CD.** GitHub Actions / GitLab Runners that hold long-lived cloud keys are the #2 leak path. Federate them.

## Related

- [Cloud Sandbox](/phase-3-infrastructure/cloud-sandbox/) — where the IdP is wired into the landing zone
- [CI/CD Pipeline](/phase-3-infrastructure/cicd-pipeline/) — the federated identity used by the build system
- [Secrets Management](/phase-3-infrastructure/secrets-management/) — where the few unavoidable long-lived secrets live
- [Procurement Guardrails](/phase-1-governance/procurement-guardrails/) — IdP selection happens here

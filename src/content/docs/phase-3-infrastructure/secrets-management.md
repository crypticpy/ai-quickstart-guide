---
title: Secrets Management
description: Cloud-native secrets stores (Key Vault, Secrets Manager, Secret Manager), HashiCorp Vault as cross-cloud option, rotation patterns, and secret-zero handling.
sidebar:
  order: 5
---

Almost every credential leak that becomes a public incident has the same root cause: a long-lived secret stored in a place it shouldn't be — a CI variable, an env file, a wiki page, a Slack message. The Phase 3 secrets discipline removes the temptation by making the right path easier than the wrong path: every secret lives in one well-known store, every retrieval is identity-bound, and every rotation has an owner and a tested path.

## Decision: cloud-native vs. HashiCorp Vault

The choice is binary and worth deciding once.

| Choice                                                      | When to pick                                                                                                        | What you lose                                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Cloud-native (Key Vault / Secrets Manager / Secret Manager) | Single-cloud agency; small team; want managed everything                                                            | Cross-cloud secret portability; some advanced features (PKI, dynamic DB credentials) |
| HashiCorp Vault                                             | Multi-cloud, hybrid, or on-prem; need dynamic credentials, PKI, or transit encryption; team has operations capacity | Adds a system to operate; commercial features cost money                             |

Most agencies should start with the cloud-native option. It is simpler, fully managed, and meets every Phase 3 requirement on its own. Switch to (or add) Vault later only if a specific need surfaces — typically dynamic database credentials, certificate issuance, or a multi-cloud orchestration plane.

## Cloud-native patterns

### AWS — Secrets Manager + Parameter Store

- **AWS Secrets Manager** for API keys, database credentials, third-party OAuth tokens. Built-in rotation for RDS, Aurora, DocumentDB, Redshift; custom rotation via Lambda for everything else.
- **AWS Systems Manager Parameter Store** for configuration values and lower-sensitivity parameters, including SecureString when appropriate. Use Secrets Manager for API keys that need rotation, audit focus, or vendor integration.
- **Authorization.** IAM role grants `secretsmanager:GetSecretValue` scoped to specific secret ARNs. No wildcards in production.
- **Encryption.** All secrets encrypted with a customer-managed KMS key (CMK), not the AWS-managed default. Tier-3 workloads use a CMK with key policy restricting decrypt to specific roles.
- **Rotation.** Enable automatic rotation; default 30 days for credentials that support rotation, 90 days for static API keys (with manual replacement).

### Azure — Key Vault

- **Azure Key Vault** holds secrets, keys, and certificates. Standard tier for most use cases; Premium tier (HSM-backed) for Tier-3 if FIPS 140-2 Level 3 is required.
- **Authorization.** Use Azure RBAC (not legacy access policies). `Key Vault Secrets User` for read; tighter custom roles for production.
- **Network.** Private endpoint or service endpoint; disable public access in non-sandbox environments.
- **Rotation.** Built-in rotation policy for managed-identity-issued credentials; certificates auto-renew via Key Vault's integration with public CAs and ACME.
- **Soft-delete and purge protection.** Required (default in newer regions); prevents accidental or malicious destruction.

### Google Cloud — Secret Manager

- **Google Secret Manager** holds secrets versioned and encrypted by default with Google-managed keys; CMEK supported.
- **Authorization.** Predefined roles `secretmanager.secretAccessor` (read), `secretmanager.secretVersionManager` (rotate). Bind at the secret level for least privilege.
- **Rotation.** Rotation periods configurable; rotation triggers via Pub/Sub topic that a custom Cloud Function processes for non-built-in services.
- **Replication.** Default is automatic multi-region; pick user-managed replication if data residency requires.

## HashiCorp Vault patterns

When the agency decides Vault is justified:

- **Single Vault cluster** in the most-trusted environment (often the security account/subscription/project), accessed by all environments via cross-account/cross-cloud network paths.
- **Auth methods.** Kubernetes auth for cluster workloads; OIDC for humans; cloud auth methods (AWS IAM, Azure MSI, GCP IAM) for workloads outside Kubernetes.
- **Dynamic credentials** are the killer feature. Database/secret engines that mint short-lived credentials per workload at request time eliminate the rotation problem entirely.
- **PKI engine** for internal certificate authority — issues short-lived service certificates for mTLS.
- **Transit engine** for application-level encryption (encryption-as-a-service) without exposing keys to applications.

Operating Vault is non-trivial: HA storage backend, unsealing strategy, audit log handling, upgrade discipline. It requires meaningful platform operations capacity. If that capacity does not exist, stay with cloud-native.

## Secret-zero handling

"Secret zero" is the credential a workload uses to retrieve other secrets. The whole architecture stands or falls on it.

The preferred answer: **the secret zero is the cloud's workload identity itself**. The workload doesn't have a starting password — it has a cloud-issued, identity-bound credential it gets at startup automatically. From there it can authorize to the secrets store.

- **AWS:** IAM role attached to the compute resource. EC2 instance profile, ECS task role, EKS IRSA, Lambda execution role. The metadata service hands the workload credentials at startup; the workload uses them to call Secrets Manager.
- **Azure:** Managed identity assigned to the resource. Container Apps, AKS, App Service, VMs. The IMDS endpoint hands a token; the workload uses it to call Key Vault.
- **Google:** Attached service account. Cloud Run, GKE, GCE. The metadata service issues tokens; the workload uses them to call Secret Manager.
- **External (CI runners, on-prem):** OIDC federation back to the cloud, exchanging the runner's OIDC token for a cloud-issued credential. No starting secret in the runner.

If the architecture requires a literal "starting secret" stored in a workload's environment, treat it as a temporary exception: document the owner, scope, rotation path, expiry date, and migration plan to workload identity.

## Rotation discipline

Rotation matters more than length or complexity. The table below gives starter defaults to confirm against agency security policy, contract language, and vendor capability. Every secret needs:

- A defined rotation period (30 / 60 / 90 / 365 days).
- An automated rotation path (or, if manual, a calendar reminder and an explicit owner).
- A rotation-tested-recently flag — if the last rotation was a year ago and rotation has never actually been exercised, it doesn't work.

Common rotations:

| Secret type                | Rotation period | Mechanism                                              |
| -------------------------- | --------------- | ------------------------------------------------------ |
| Database credential        | 30 days         | Cloud-native rotation function or Vault dynamic creds  |
| Anthropic / OpenAI API key | 90 days         | Manual replace; rotation test quarterly                |
| OAuth client secret        | 180 days        | Coordinated with IdP partner                           |
| Service certificate        | ≤ 1 year        | ACME / cloud-issued / Vault PKI; auto-renew at 80% TTL |
| Encryption key (CMK)       | 1 year          | Cloud-native key rotation; automatic re-encrypt        |
| Workload identity token    | Minutes         | Auto by cloud SDK                                      |

Calendar a quarterly "rotation drill": pick one rotated secret at random, verify the rotation path executes, and confirm the workload survives. The drills find rotation paths that were configured once and quietly broke.

## Application access patterns

Pick the simplest pattern that the runtime supports and the security team can audit:

| Pattern | When to use | Notes |
| --- | --- | --- |
| Runtime secret reference or mount | Managed services such as Container Apps, App Runner/ECS, Cloud Run, or Kubernetes with a secrets driver | Keeps app code simple; watch environment-variable exposure in crash dumps and debug tooling |
| Sidecar or init container | Kubernetes or container platforms with strong sidecar support | Useful when the app should not call the secret API directly |
| SDK retrieval with workload identity | Apps that need refresh without restart or dynamic secret selection | Acceptable when access is least-privilege, audited, cached carefully, and never logged |

For AI workloads specifically: if a direct provider API key is unavoidable, the workload retrieves or receives the per-environment key through one of these patterns, constructs the SDK client, and keeps the raw key out of logs, traces, function signatures, and error messages.

## Key management

Encryption keys deserve a separate discipline from API key secrets.

- **Use customer-managed keys (CMKs)** for any data classified as Tier-2 or Tier-3.
- **Separate KMS hierarchy.** Production CMKs are in a different scope than non-prod; keys are not movable across environments.
- **Key policies** restrict use to specific roles. The DBA has access to the database key; the application has access to its application-tier key; nobody has access to all keys.
- **Audit log every Decrypt.** Quiet anomaly detection on unusual decrypt patterns.
- **HSM tier** (AWS CloudHSM, Azure Key Vault Managed HSM, Google Cloud HSM) for FIPS 140-2 Level 3 requirements; otherwise the standard tier is sufficient and cheaper.

## Constituent-data secrets

Constituent personal data sometimes ends up in places that are not application secrets but are sensitive: vector store API keys for an index containing PII, model fine-tuning artifacts, evaluation snapshots. Treat these as Tier-3 secrets:

- Stored only in CMK-encrypted secret stores in the production environment.
- Access logged at every read.
- Rotation tested quarterly.
- Inventory tracked separately from regular secrets.

## What does NOT belong in the secrets store

- Configuration that isn't sensitive (feature flags, region names, log levels). Use a configuration system (Parameter Store with non-secure strings, App Configuration, Cloud Storage with versioning).
- TLS certificates for public endpoints. Use the cloud's load-balancer-integrated certificate manager.
- Code or schema. Source control owns code; the secrets store should be small and high-value.

A bloated secrets store is a sign to review ownership and duplication. Watch for orphaned secrets, environment copies that drift, unclear owners, and configuration values that do not belong in the secrets store.

## Common secrets failures

- **API keys in CI variables.** They sit, unrotated, for years, with broad pipeline access. Replace with secrets-store retrieval at deploy.
- **Operators read secrets routinely.** If on-call sees the database password during normal operation, the access is too broad. Operators should use just-in-time elevation that issues short-lived credentials.
- **Encryption keys in the same store as the things they encrypt.** Defeats the purpose. Keys live in KMS (HSM-backed); secrets reference key IDs.
- **A "shared dev secret" everyone uses.** Replace with per-developer sandbox identities backed by per-developer scoped secrets.
- **Production secrets in dev.** Devs should never need them. If the dev environment requires a production credential to function, the architecture is wrong.

## Related

- [Identity & Access](/phase-3-infrastructure/identity-access/) — the workload identity that authorizes secret access
- [CI/CD Pipeline](/phase-3-infrastructure/cicd-pipeline/) — how secrets are retrieved at deploy time
- [Security Baseline](/phase-3-infrastructure/security-baseline/) — the encryption and key management standards
- [Risk Classification](/phase-1-governance/risk-classification/) — the tier model that drives CMK and rotation requirements

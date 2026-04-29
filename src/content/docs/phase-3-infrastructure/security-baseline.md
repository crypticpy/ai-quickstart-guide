---
title: Security Baseline
description: DLP for AI workloads, data classification labels, network segmentation, egress control, and per-tier policy enforcement across AWS, Azure, and GCP.
sidebar:
  order: 7
---

The security baseline is the set of controls that apply to every workload by default — automatically, in code, at provisioning time. The principle is **secure-by-default, opt-in to relax**, not the other way around. A developer who does nothing special should land in a posture that is safe for Tier-1 workloads. Moving to Tier-2 or Tier-3 should require explicit, reviewed configuration changes that are themselves auditable.

This page describes the baseline. It is informed by NIST SP 800-53 R5 (the federal moderate baseline), CISA Secure Cloud Business Applications (SCuBA) guidance, NIST SP 800-207 (zero trust), and the cloud-specific CIS benchmarks.

## Data classification

Before security policy makes sense, the agency needs to know what it is protecting. Labels:

| Label        | Examples                                                    | Sample handling rules                                                                                                                   |
| ------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Public       | Press releases, published reports, public datasets          | No special controls beyond integrity                                                                                                    |
| Internal     | Internal docs, non-PII operational data                     | Authenticated access, audit log, encryption in transit                                                                                  |
| Confidential | PII, FERPA, HIPAA, CJI, FTI, sensitive employment           | CMK encryption, restricted access by role, no AI service training/sharing, audit log every read                                         |
| Restricted   | Tier-3 / high-stakes (criminal, immigration, child welfare) | Confidential rules + private-endpoint only, no public AI vendor unless explicitly cleared, contestation pathway, longer audit retention |

Implementation: each cloud's data catalog or tagging system carries the label. Workloads inherit the label of the data they handle. Storage that doesn't have a label can't be accessed by AI services.

- **AWS:** Resource tags `data-classification=...`; S3 bucket policies and KMS key policies condition on tag.
- **Azure:** Microsoft Purview information labels and sensitivity classifications; Defender for Cloud enforces by label.
- **Google:** Data Catalog tags + DLP API for inspection; Sensitive Data Protection runs on storage routinely.

## DLP for AI workloads

AI workloads create a new DLP surface: a model can re-emit data that was given to it as context. Three controls together:

### 1. Pre-flight DLP scanning

Before any data goes to a foundation model, it passes through a DLP service that detects classified data and either redacts, blocks, or escalates. The cloud-native options:

- **AWS:** Amazon Macie (S3-resident scanning), AWS Bedrock Guardrails (in-flight redaction during model invocation).
- **Azure:** Microsoft Purview DLP, Azure AI Content Safety, Azure OpenAI's built-in content filters.
- **Google:** Cloud DLP / Sensitive Data Protection (in-flight de-identification), Vertex AI safety filters.

The platform's [AI orchestration layer](/phase-5-platform/) wraps these so application code does not have to call DLP separately.

### 2. Output filtering

After the model responds, an output filter scans for sensitive data leakage (e.g., the model emitting a portion of training data, or echoing back PII it should not surface). The same DLP services support output mode.

### 3. Logging policy

Prompt and response logs are themselves classified. Tier-2/3 prompts may include the highest-classification data the agency handles. Logs are encrypted with the same CMK as the source data, retention is set to legal minimum (often 90 days for Tier-2; longer for Tier-3 contestation), and access is restricted to incident response and audit roles.

## Encryption

Layered encryption across three states:

- **At rest.** All storage encrypted; CMK-encrypted for Confidential and Restricted data. KMS key policies bind to specific roles.
- **In transit.** TLS 1.2+ everywhere. Internal traffic between services uses mTLS where supported (service mesh, cloud-native private endpoint TLS).
- **In use.** For Tier-3 workloads, evaluate confidential computing — AWS Nitro Enclaves, Azure confidential VMs (AMD SEV-SNP / Intel TDX), Google Cloud Confidential VMs / Confidential GKE Nodes. Adds 5–10% performance cost but materially raises the bar on memory-scraping attacks.

## Network segmentation

The default posture is **deny by default, allow by exception, log everything.**

### Inbound

- All workloads run in private subnets.
- Public traffic enters through a single shared ingress: cloud-native WAF + Load Balancer.
- WAF rule sets: OWASP Top 10 baseline + AI-specific rate limiting (per-IP, per-token-spend) + bot management.
- Internal services (admin dashboard, observability UIs) are not exposed publicly. Access is through SSO + private network or zero-trust proxy (Cloudflare Access, Tailscale, Cloud Identity-Aware Proxy).

### Outbound (egress)

The most important AI-specific control. AI workloads typically want to call external APIs; that capability, unconstrained, is also how exfiltration happens.

- **Egress allowlist** by destination (FQDN + port). Approved AI vendor endpoints, package mirror, log shipping, observability provider. Everything else: denied.
- **Egress proxy** (Squid, cloud-native NGFW, or service mesh egress gateway) so all egress is centrally observable and policy-controllable.
- **TLS interception** for Tier-2/3 workloads where legally permitted, so policy can inspect content. Coordinate with privacy and legal before enabling.
- **DNS controls.** Route 53 Resolver DNS Firewall, Azure DNS Private Resolver with allowlists, Cloud DNS with response policies. Sinkhole known-bad domains; alarm on lookups for unknown domains.

### East-west

Within an environment, segmentation prevents a compromised workload from reaching everything else.

- **Cloud-native segmentation:** Security Groups (AWS), NSGs (Azure), Firewall Rules (GCP) on the smallest practical scope.
- **Service mesh** (Istio, Linkerd, AWS App Mesh, Azure Service Mesh add-on) for mTLS and L7 policy if the platform has matured to Kubernetes.
- **Private endpoints** for managed services (Storage, Databases, AI services). Public endpoints disabled at the resource level for production.

## Per-tier policy enforcement

The risk tier from [Phase 1](/phase-1-governance/risk-classification/) maps to enforced policy:

| Control                | Tier 1 (low)                 | Tier 2 (medium)                           | Tier 3 (high)                                         |
| ---------------------- | ---------------------------- | ----------------------------------------- | ----------------------------------------------------- |
| Data classification    | Public/Internal allowed      | Confidential allowed with DLP             | Restricted; private endpoints only                    |
| AI vendor surface      | Approved list                | Approved list + Review Committee sign-off | Approved + private-endpoint deployment + bias testing |
| Encryption keys        | Cloud-managed                | CMK                                       | CMK with HSM backing where required                   |
| Egress                 | Allowlist                    | Allowlist + inspection                    | Allowlist + inspection + content policy               |
| Logging                | Standard retention (30 days) | Extended retention (90 days)              | Long retention (per contestation period; ≥1 year)     |
| Network exposure       | Internal SSO behind WAF      | Same + per-route auth                     | Internal-only; no public ingress                      |
| Deploy approval        | CI/CD green                  | Named approver                            | Two-person + Review Committee record                  |
| Confidential computing | Not required                 | Recommended                               | Required if data classification dictates              |

The mapping is enforced as policy-as-code: Azure Policy / AWS SCP + Config Rules / GCP Org Policy + Policy Controller. A tag of `tier=3` automatically applies the Tier-3 control set; non-compliant configurations are denied at admission.

## CIS / SCuBA / FedRAMP alignment

Adopt the appropriate cloud's CIS benchmark as a starting baseline:

- **AWS:** CIS AWS Foundations Benchmark v3.0+. Use AWS Config conformance pack to evaluate continuously.
- **Azure:** CIS Microsoft Azure Foundations Benchmark v2.1+ via Microsoft Cloud Security Benchmark in Defender for Cloud.
- **Google:** CIS Google Cloud Platform Foundation Benchmark v3.0+ via Security Command Center.

Federal agencies aligning with CISA SCuBA: secure configuration baselines for M365 / Google Workspace / Salesforce / etc. Phase 3 implements the cloud-platform side; SCuBA covers the SaaS side.

FedRAMP Moderate or High authorization is a longer journey, but the baseline above maps cleanly to the controls and is a useful starting point.

## Vulnerability and exposure management

- **Image scanning** as a CI/CD gate (covered in [CI/CD pipeline](/phase-3-infrastructure/cicd-pipeline/)).
- **Runtime scanning** of running workloads via the cloud's runtime protection (Defender for Containers, GuardDuty, Security Command Center).
- **External attack surface management.** Use the cloud's external surface tooling (AWS attack surface, Defender EASM, GCP) or a third-party (Censys, Tenable EASM) to find unintended exposures.
- **Patching.** Image refresh on a 30-day cadence at minimum; critical CVE patches within 7 days.

## AI-specific threat model additions

Beyond the standard cloud threat model, AI workloads need:

- **Prompt injection.** Untrusted input that tries to override system instructions. Mitigations: structured prompts (system + user roles), output validation, never let user input reach a tool-use parameter without sanitization.
- **Model output exfiltration.** The model emits sensitive data from its context. Mitigations: output DLP filter, never include raw secrets in prompts, scope retrieval to the user's own permissions.
- **Excessive agency.** A tool-using agent takes destructive actions. Mitigations: tool allowlists per use case, tool actions logged with full input/output, write actions require human approval at Tier-2+, dry-run mode for any destructive tool.
- **Training-data leakage** (where the agency contributes data). Mitigations: data non-use clause in procurement, no agency data sent to model providers' training systems.
- **Model substitution.** The vendor swaps the underlying model; behavior changes. Mitigations: contract clause requires 30 days notice and re-evaluation access (covered in [Procurement Guardrails](/phase-1-governance/procurement-guardrails/)).

## Continuous compliance

Manual audits don't keep up. Run continuous compliance:

- Cloud-native compliance dashboards (AWS Audit Manager, Microsoft Purview Compliance Manager, Google Assured Workloads).
- Policy violations alert in real time, not on a quarterly basis.
- Quarterly compliance review reviews trends, not point-in-time snapshots.

## Common security baseline failures

- **"We'll add encryption later."** It is much harder to add CMK encryption to existing storage than to enable it from day one. Set the baseline before any data lands.
- **No egress controls.** The default of "all egress allowed" is a Tier-3 incident waiting to happen.
- **Tags as documentation, not enforcement.** Tags only matter if policy enforces on them. Wire policy to tags from day one.
- **Compliance review separate from operations.** When the security team only sees the platform once a quarter, problems compound. Continuous compliance signals are the security team's daily view.
- **Public model API as the only AI option for Tier-3 work.** Tier-3 should default to private-endpoint-deployed AI services. Re-architect when this comes up — do not weaken the policy.

## Related

- [Cloud Sandbox](/phase-3-infrastructure/cloud-sandbox/) — landing zone where these controls are baked in
- [Identity & Access](/phase-3-infrastructure/identity-access/) — the identity layer this baseline relies on
- [Risk Classification](/phase-1-governance/risk-classification/) — the tier model the policy enforces
- [Legislative Compliance](/phase-1-governance/legislative-compliance/) — the legal mandates this baseline operationalizes

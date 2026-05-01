---
title: Security Baseline
description: DLP for AI workloads, data classification labels, network segmentation, egress control, and per-tier policy enforcement across AWS, Azure, and GCP.
sidebar:
  order: 8
---

The security baseline is the set of controls that apply to every workload by default. Mature teams enforce these controls automatically, in code, at provisioning time. Smaller teams can start with a checklist and naming/tagging convention, then automate as they repeat the pattern. The principle is **secure-by-default, opt-in to relax**, not the other way around. A developer who does nothing special should land in a posture that is safe for Tier-1 workloads. Moving to Tier-2 or Tier-3 should require explicit, reviewed configuration changes that are themselves auditable.

This page describes the baseline. It is informed by NIST SP 800-53 R5 (the federal moderate baseline), CISA Secure Cloud Business Applications (SCuBA) guidance, NIST SP 800-207 (zero trust), and the cloud-specific CIS benchmarks.

## Data classification

Before security policy makes sense, the agency needs to know what it is protecting. Labels:

| Label | Examples | Sample handling rules |
| --- | --- | --- |
| Public / non-sensitive | Press releases, published reports, public datasets | No special controls beyond integrity |
| Internal sensitive | Internal docs, non-PII operational data, drafts, operational metrics | Authenticated access, audit log, encryption in transit |
| Confidential / protected | PII, FERPA, HIPAA, CJI, FTI, sensitive employment | CMK encryption, restricted access by role, no AI service training/sharing, audit log every read |
| Restricted / high-impact | Tier-3 / high-stakes contexts such as criminal justice, immigration, child welfare | Confidential rules + private endpoint or approved private connectivity where feasible, no public AI vendor unless explicitly cleared, contestation pathway, longer audit retention |

Implementation: each cloud's data catalog or tagging system carries the label. Workloads inherit the label of the data they handle. In mature environments, unlabeled storage cannot be accessed by AI services. If tags and policies are not automated yet, use naming conventions and a review checklist until policy-as-code exists.

- **AWS:** Resource tags `data-classification=...`; S3 bucket policies and KMS key policies condition on tag.
- **Azure:** Microsoft Purview information labels and sensitivity classifications; Defender for Cloud enforces by label.
- **Google:** Data Catalog tags + DLP API for inspection; Sensitive Data Protection runs on storage routinely.

## DLP and safety controls for AI workloads

AI workloads create a new DLP surface: a model can re-emit data that was given to it as context. Treat DLP as an architecture made of several controls, not one product checkbox. Provider safety filters complement DLP; they do not replace data classification, access control, and careful prompt construction.

### 1. Data discovery and classification

Before a workload is connected to a dataset, classify the source and document what labels may flow into the prompt, retrieval index, logs, and evaluation snapshots. Cloud tools can help find and classify sensitive data at rest:

- **AWS:** Amazon Macie for S3-resident discovery and classification; data catalog tags and bucket policies for enforcement.
- **Azure:** Microsoft Purview sensitivity labels, data map, and DLP policies.
- **Google:** Sensitive Data Protection and Data Catalog tags for inspection and classification.

### 2. Pre-prompt redaction or blocking

Before any data goes to a foundation model, it passes through a DLP service that detects classified data and either redacts, blocks, or escalates. The cloud-native options:

- **AWS:** Bedrock Guardrails and custom redaction services can help with in-flight policy; Macie remains primarily a discovery/classification component for S3 data.
- **Azure:** Microsoft Purview DLP, Azure AI Content Safety, Azure OpenAI content filters, and app-level redaction can be combined based on workload.
- **Google:** Sensitive Data Protection can de-identify content; Vertex AI safety filters help with model-safety policy.

The platform's [AI orchestration layer](/phase-5-platform/) wraps these so application code does not have to call DLP separately.

### 3. Output leakage checks

After the model responds, an output filter scans for sensitive data leakage (e.g., the model echoing back PII it should not surface). This may reuse the same DLP services, provider safety filters, or application-level detectors, but it requires explicit integration in the orchestration layer.

### 4. Logging policy

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
- **Content-aware egress inspection** for Tier-2/3 workloads where lawful, technically feasible, and approved by privacy, security, and legal. TLS interception can create privacy, records, client-certificate, and security risks; alternatives include destination allowlists, private endpoints, provider audit logs, DLP before prompt assembly, and workload-level policy.
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
| Data classification    | Public / non-sensitive and internal sensitive allowed | Confidential / protected allowed with DLP | Restricted / high-impact; private endpoint or approved private connectivity where feasible |
| AI vendor surface      | Approved list                | Approved list + review path approval      | Approved + private deployment or approved private connectivity + bias testing |
| Encryption keys        | Cloud-managed                | CMK                                       | CMK with HSM backing where required                   |
| Egress                 | Allowlist                    | Allowlist + inspection                    | Allowlist + inspection + content policy               |
| Logging                | Standard retention (30 days) | Extended retention (90 days)              | Long retention (per contestation period; ≥1 year)     |
| Network exposure       | Internal SSO behind WAF      | Same + per-route auth                     | Internal-only; no public ingress                      |
| Deploy approval        | CI/CD green                  | Named approver                            | Two-person + review path record                       |
| Confidential computing | Not required                 | Recommended                               | Required if data classification dictates              |

The mature mapping is enforced as policy-as-code: Azure Policy / AWS SCP + Config Rules / GCP Org Policy + Policy Controller. A tag of `tier=3` can automatically apply the Tier-3 control set; non-compliant configurations are denied at admission. A smaller agency can start with the same mapping as a review checklist and move the most repeated controls into policy-as-code over time.

## CIS / SCuBA / FedRAMP alignment

Adopt the appropriate cloud's CIS benchmark as a starting baseline:

- **AWS:** CIS AWS Foundations Benchmark v3.0+. Use AWS Config conformance pack to evaluate continuously.
- **Azure:** CIS Microsoft Azure Foundations Benchmark v2.1+ via Microsoft Cloud Security Benchmark in Defender for Cloud.
- **Google:** CIS Google Cloud Platform Foundation Benchmark v3.0+ via Security Command Center.

Federal agencies aligning with CISA SCuBA: secure configuration baselines for M365 / Google Workspace / Salesforce / etc. Phase 3 implements the cloud-platform side; SCuBA covers the SaaS side.

FedRAMP Moderate or High authorization is a separate authorization journey. The baseline above can support the control narrative and evidence collection, but it does not establish authorization by itself.

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

- [Environment Strategy & Promotion Path](/phase-3-infrastructure/environment-strategy/) — how baseline controls differ across sandbox, development, staging, and production
- [Operations Lifecycle & Resilience](/phase-3-infrastructure/operations-lifecycle/) — CVE triage, exceptions, records, and decommissioning controls
- [Cloud Sandbox](/phase-3-infrastructure/cloud-sandbox/) — landing zone where these controls are baked in
- [Identity & Access](/phase-3-infrastructure/identity-access/) — the identity layer this baseline relies on
- [Risk Classification](/phase-1-governance/risk-classification/) — the tier model the policy enforces
- [Legislative Compliance](/phase-1-governance/legislative-compliance/) — the legal mandates this baseline operationalizes

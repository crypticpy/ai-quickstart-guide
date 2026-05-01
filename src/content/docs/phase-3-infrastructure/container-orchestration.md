---
title: Container Orchestration
description: Choosing between managed container services and full Kubernetes; staging vs. production separation; admission control; per-cloud (AWS, Azure, GCP) recommendations.
sidebar:
  order: 7
---

The orchestration layer is where the AI workload actually runs. The good news: every major cloud has at least two reasonable options, and the differences between them are smaller than the AI vendor marketing implies. The question for Phase 3 is not "which cloud's Kubernetes is best" but "do we need full Kubernetes at all, or does the managed container service handle this?"

For most agencies starting out, the answer is **start with managed**. Move to full Kubernetes only when the platform's actual workload patterns require it — typically when running multi-team, multi-tenant clusters with custom networking, GPU scheduling, or specialized operators that the managed offering does not support.

## Decision: managed vs. full Kubernetes

| Choice                                                              | When to pick                                                                           | Operational burden |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------ |
| Managed container service (Container Apps / App Runner / Cloud Run) | Single team, small service count, no GPU scheduling, no service mesh, no custom networking | Low |
| Managed Kubernetes (AKS / EKS / GKE)                                | Multiple teams, mature platform team, mesh required, GPU workloads, custom controllers | Medium to high |
| Self-managed Kubernetes                                             | Rare; reserved for air-gapped on-prem with no managed option                           | Very high |

A useful test: if the agency does not yet have a platform engineer who has run Kubernetes in production for a year, choose managed. The managed service is almost always sufficient for the first 12–18 months and migration to Kubernetes later is well-understood.

## Per-cloud managed option

### AWS — App Runner / ECS Fargate

- **App Runner** for stateless HTTP services with auto-scaling, custom domains, VPC connector. Easiest path; deploy from container image or source repo.
- **ECS on Fargate** when you need finer control: sidecars, service discovery, more network options, scheduled tasks.
- **Lambda** for thin glue and event handlers — keep the AI orchestration core off Lambda for portability.
- **Bedrock** for inference is a separate service the workload calls; it is not part of the orchestration choice.

### Azure — Container Apps

- **Azure Container Apps** is the default. Built on Kubernetes (KEDA, Dapr, Envoy) but exposes a managed-service surface. Auto-scales to zero; supports background jobs and event-driven workloads.
- **Azure Functions** for thin glue.
- **Azure App Service** for agencies already standardized on it, especially simple web apps or .NET-heavy stacks. Container Apps is the default for new portable container workloads.
- **Azure OpenAI** for inference is called from the workload, not orchestrated.

### Google Cloud — Cloud Run

- **Cloud Run** is the default. Container-native, scales to zero, integrates well with Cloud Build / Artifact Registry / Vertex AI.
- **Cloud Run jobs** for batch and one-off work.
- **Cloud Functions** for thin glue.
- **Vertex AI Endpoints** for inference is called from the workload.

The managed services on all three clouds converge on the same shape: container image in, HTTP service out, auto-scaling, integrated logging and identity, sub-minute deploys. The platform code is the same; only the deploy command and a handful of config knobs differ.

## When to upgrade to managed Kubernetes

Trigger conditions:

- More than two teams sharing infrastructure with hard isolation requirements.
- Workloads that require GPU scheduling (training, fine-tuning, large-batch inference).
- Service mesh requirements (mTLS everywhere, fine-grained traffic policy, multi-cluster).
- Specialized controllers (cert-manager beyond what the cloud provides, ArgoCD for GitOps, custom operators).
- Cost optimization at scale where node-pool packing matters.

For all three managed Kubernetes services, the agency-friendly pattern:

- **AKS:** use the Azure Linux node OS; integrate with Entra ID for cluster admin; enable Defender for Containers; private cluster mode in production.
- **EKS:** use Bottlerocket nodes; IRSA for workload identity; private cluster mode; enable EKS Pod Identity.
- **GKE:** use GKE Autopilot if the team is small (Google operates the nodes); standard mode if you need node-level control. Enable Workload Identity and Binary Authorization.

## Reference architecture (portable shape)

The diagram is the same on every cloud. Per environment:

```
Public ingress (WAF + CDN)
  → Load balancer
    → Container runtime (Container Apps / App Runner / Cloud Run / Kubernetes)
       ├── AI orchestration service (the platform)
       ├── Application services (per use case)
       └── Background workers
    → Private endpoints to cloud-native AI services where supported
    → Public third-party AI APIs only through approved egress controls
    → Private endpoints to data stores
    → Egress through inspection (Firewall / Squid / cloud-native NGFW)
```

The AI orchestration service is the platform component (Phase 5) that fans out to the AI vendor of choice. It usually runs in the container runtime rather than pure serverless because it holds connections, caches, and rate-limit state that benefit from longer-lived processes. Thin event handlers and low-risk Tier-1 automations can still be serverless when that is the simplest managed option.

## Staging vs. production separation

Workloads should look identical in staging and production from a container/IaC standpoint. The differences are:

| Surface            | Staging                               | Production                                  |
| ------------------ | ------------------------------------- | ------------------------------------------- |
| Compute size       | 1 replica, smaller instance           | ≥3 replicas, autoscaled                     |
| Scaling floor      | Often scaled-to-zero outside hours    | Always-warm minimum                         |
| Database           | Sanitized snapshot, refreshed nightly | Live production database, restricted access |
| AI service quota   | Lower rate limit, lower spend cap     | Production rate limit                       |
| Public exposure    | Behind agency VPN or test domain      | Public domain with WAF and rate-limiting    |
| Approval to deploy | Auto on green CI                      | Named approver + signed image + eval gate   |

Use the same IaC for both. Differences are values in the variables file, not branched code. Drift is the enemy.

## Admission control

The container runtime is the last gate. Even if everything before it failed, admission control should refuse to run an unsigned image or a workload that violates policy.

For Kubernetes runtimes:

- **Kyverno** or **Gatekeeper** as policy engine.
- Required policies: image signed by agency's OIDC issuer, no `:latest` tags, no privileged containers, all containers run as non-root, resource requests and limits set, restricted-PSS profile or stricter, no host network / host PID / host IPC.

For managed (non-Kubernetes) runtimes:

- Equivalent checks happen in the deploy stage of CI/CD before invoking the platform's deploy API.
- Policy-as-code via OPA/Conftest against the IaC plan output.

## Network posture

Workloads run in private subnets. No workload has a public IP. Public ingress is via:

- **Cloud-native WAF** (AWS WAF, Azure Front Door, Google Cloud Armor).
- **CDN** for static assets if applicable.
- **Load balancer** terminating TLS, forwarding to the container runtime over private network.

Egress is allowlisted. The AI orchestration service has explicit egress to:

- The chosen AI vendor's public endpoints (Anthropic, OpenAI) — or no public egress at all if the platform uses cloud-native AI services with private endpoints.
- The agency's package mirror (PyPI proxy, npm proxy, container registry).
- Telemetry endpoints (the observability provider, if SaaS).

Everything else is denied by default. The egress policy is reviewed quarterly.

## Image provenance and registry

- One central registry per environment tier: a non-prod registry and a prod registry. Promotion is a registry-to-registry copy, never a rebuild.
- The registry verifies signatures on push and on pull (where the runtime supports it).
- SBOM and provenance attestations live as OCI artifacts attached to the image.
- Tag images with the immutable build digest; `:latest` and floating tags are banned in production.

Per cloud:

- **AWS:** ECR with image signing via Notation or Cosign; cross-account replication for prod.
- **Azure:** Azure Container Registry with content trust; geo-replication for prod.
- **Google:** Artifact Registry with Binary Authorization for verification at deploy.

## Cost and scaling

AI workloads have spiky compute and very spiky token cost. Configure:

- **Container autoscaling** on CPU + memory + concurrent requests + queue depth (depending on workload shape).
- **Scale-to-zero** in sandbox and staging, and for production batch jobs or non-user-facing work where latency and availability requirements allow it. Keep user-facing production services warm enough to meet their SLOs.
- **Budget alarms** distinct from the cloud-wide budget — per-workload, per-environment.
- **Concurrency limits** to bound the maximum cost per minute. AI services bill per token; an unbounded concurrency leak can produce a large bill before alarms fire.

## Common orchestration failures

- **Choosing Kubernetes too early.** A 5-service platform on AKS/EKS/GKE pays full operational cost without using full Kubernetes capability. Stick with managed until a hard requirement forces the change.
- **Mixing serverless and containers in the orchestration core.** The orchestration service ends up split between Lambda functions and a container, and state synchronization becomes hard. Pick one for the core.
- **No pod/container resource limits.** A misbehaving model call can pin CPU and starve other workloads. Set limits.
- **Production exposed without WAF.** Public Tier-2/3 ingress should require WAF or the agency's approved equivalent. Tier-1 and internal workloads still benefit from WAF where policy and cost allow.
- **No rollback test.** Every deploy path should have a tested rollback path. Test it monthly.

## Related

- [CI/CD Pipeline](/phase-3-infrastructure/cicd-pipeline/) — what builds and signs the images this page runs
- [Identity & Access](/phase-3-infrastructure/identity-access/) — workload identity for the running containers
- [Security Baseline](/phase-3-infrastructure/security-baseline/) — egress, segmentation, encryption
- [Phase 5 — Modular Platform](/phase-5-platform/) — what runs inside the orchestration layer

---
title: Environment Strategy & Promotion Path
description: A practical sandbox, development, staging, and production operating model for AI workloads, with small, standard, and large agency paths.
sidebar:
  order: 3
---

Cloud infrastructure becomes useful when teams know where work belongs, how it moves forward, and what evidence is required before it reaches real users. This page gives agencies a practical operating model for separating sandbox, development, staging, and production spaces without requiring a complex enterprise architecture on day one.

This is advice, not a mandate. The right implementation depends on staffing, procurement, current cloud contracts, data sensitivity, and the risk tier of the use case. The durable principle is simple: keep production clearly separated, use lower environments for learning and validation, and make promotion evidence-based instead of personality-based.

## Plain-English version

At minimum, an agency needs:

- A **sandbox** where people can learn and experiment without real sensitive data.
- A **development space** where the build team integrates code, prompts, data connectors, and tests.
- A **staging or test space** that looks enough like production to validate security, quality, performance, and operations.
- A **production space** that runs real workloads for real users with monitoring, access control, support, and rollback.

Small organizations may combine sandbox and development at first. They should still keep production separate. Medium organizations should separate environments by resource group, project, workspace, or subscription where possible. Large organizations usually separate by account, subscription, project, management group, folder, or organizational unit, with centralized logging and security oversight.

<div class="aqg-diagram" role="img" aria-label="Environment promotion path from sandbox to development to staging to production and operations review">
  <p class="aqg-diagram__title">Environment promotion path</p>
  <div class="aqg-flow" style="--steps: 5;">
    <div class="aqg-node aqg-node--blue">
      <span class="aqg-node__eyebrow">Learn</span>
      <strong class="aqg-node__title">Sandbox</strong>
      <p class="aqg-node__body">Synthetic or approved sample data. Fast experiments, labs, and prototypes.</p>
    </div>
    <div class="aqg-node aqg-node--violet">
      <span class="aqg-node__eyebrow">Build</span>
      <strong class="aqg-node__title">Development</strong>
      <p class="aqg-node__body">Code, prompts, retrieval, tests, and integrations come together.</p>
    </div>
    <div class="aqg-node aqg-node--gold">
      <span class="aqg-node__eyebrow">Validate</span>
      <strong class="aqg-node__title">Staging/Test</strong>
      <p class="aqg-node__body">Production-like checks for evals, security, data handling, and operations.</p>
    </div>
    <div class="aqg-node aqg-node--red">
      <span class="aqg-node__eyebrow">Serve</span>
      <strong class="aqg-node__title">Production</strong>
      <p class="aqg-node__body">Real users, approved data, monitoring, support, and rollback.</p>
    </div>
    <div class="aqg-node aqg-node--green">
      <span class="aqg-node__eyebrow">Improve</span>
      <strong class="aqg-node__title">Operations review</strong>
      <p class="aqg-node__body">Feedback, cost, drift, incidents, and provider changes feed the next cycle.</p>
    </div>
  </div>
  <p class="aqg-diagram__caption">Small agencies may combine sandbox and development, but production should remain a clearly governed space before real data or real users enter the workflow.</p>
</div>

## Environment model

| Environment | Purpose | Data allowed | Typical owner | Promotion question |
| --- | --- | --- | --- | --- |
| Sandbox | Learning, prototypes, Track 4 labs, tool trials | Synthetic, public, or approved sample data | Program lead or platform owner | Is this worth turning into a real build? |
| Development | Active implementation and integration | Synthetic or sanitized data; limited internal data if approved | Delivery team | Does the change work with tests and evals? |
| Staging/Test | Production-like validation | Sanitized production-shape data, approved test users | Delivery team plus security/platform | Is this safe and ready for controlled launch? |
| Production | Real users and real work | Approved data for the use case and risk tier | Business owner plus operations owner | Is this operating within agreed limits? |

The exact names matter less than the separation. Some agencies call the second environment "dev," "non-prod," or "test." What matters is that staff know where experimentation ends, where production-like validation begins, and where real residents, cases, records, or operational decisions are affected.

## Scaling paths

| Agency path | Reasonable starting point | What to ask for when scaling |
| --- | --- | --- |
| Small or no dedicated IT | Approved SaaS tenant or one cloud sandbox; named admin; MFA/SSO where available; no real sensitive data | Separate production workspace/project before launch; vendor-admin logs; exportable audit logs; budget alerts; documented deletion path |
| Standard or medium | Separate sandbox/dev/staging/prod resource groups, projects, workspaces, or subscriptions; shared identity; centralized logs | Infrastructure-as-code; CI/CD promotion gates; environment-specific secrets; security-owned logs; repeatable provisioning |
| Large or regulated | Separate cloud accounts/subscriptions/projects under management groups/OUs/folders; centralized security, logging, policy, and network controls | Platform team ownership; policy-as-code; private endpoints; formal change windows; disaster recovery exercises |

This guide should not push a five-person agency into an enterprise landing-zone program before it has a viable use case. It should also avoid implying that a large agency can run production AI from a shared sandbox. The paint-by-numbers approach is to start with the smallest environment separation that prevents obvious harm, then strengthen the model as risk and usage increase.

## Cloud and SaaS mapping

Use the vocabulary your provider already uses:

| Concept | Azure example | AWS example | Google Cloud example | SaaS-only example |
| --- | --- | --- | --- | --- |
| Organization boundary | Tenant / management group | Organization / OU | Organization / folder | Enterprise account / admin tenant |
| Environment boundary | Subscription or resource group | Account or VPC | Project or folder | Workspace / project / environment |
| Network boundary | VNet / subnet / private endpoint | VPC / subnet / VPC endpoint | VPC / subnet / Private Service Connect | IP allowlist / private link / tenant settings |
| Policy boundary | Azure Policy / RBAC | SCP / IAM / Config | Org Policy / IAM / Policy Controller | Admin policy / role / audit setting |
| Logging boundary | Log Analytics / Sentinel | CloudTrail / CloudWatch / Security Lake | Cloud Logging / Security Command Center | Admin audit logs / SIEM export |

Provider-specific terms change and features move. Use this table to ask the right questions, then verify the current provider documentation or vendor design before implementation.

## Minimum viable separation

If the agency is starting small, use this baseline:

- Production is not the same account, project, workspace, or resource group as sandbox if the platform supports separation.
- Sandbox does not contain real PII, PHI, CJI, student records, tax records, benefit records, employment records, secrets, or live credentials.
- Every environment has a named owner, budget owner, data rule, access list, and deletion path.
- Secrets are different per environment and never copied from production into sandbox.
- Logs and costs are visible to the person accountable for the environment.
- Promotion to production requires a recorded go/no-go decision, even if the review is lightweight.

This is enough for many small agencies to begin responsibly. It is not enough for high-impact or regulated workloads, but it prevents the most common early failures.

## Promotion path

Use the same idea for apps, prompts, model configuration, retrieval indexes, infrastructure, and policy-as-code:

| Step | What happens | Evidence to capture |
| --- | --- | --- |
| Sandbox to development | A prototype becomes a real build candidate | Intake record, owner, risk tier estimate, data rule |
| Development to staging | The team thinks the change works | Tests pass, evals pass, security scan clean enough to proceed, change notes |
| Staging to production | The agency is ready for real users | Production-readiness sign-off, rollback plan, monitoring dashboard, support owner |
| Production operation | The service keeps earning trust | SLO review, feedback review, cost review, drift review, incident records |

For Tier-1 internal tools, this can be a short checklist. For Tier-2 and Tier-3 use cases, the evidence should be more formal and retained with the project record.

## Gate checklist

Before a change reaches production, confirm the appropriate subset of these gates:

- Functional tests pass.
- AI eval suite passes against the approved threshold.
- Prompt, model, retrieval, and tool changes are versioned.
- Dependency and container vulnerability scans are reviewed.
- SBOM is generated or updated for production-bound builds.
- Infrastructure plan is reviewed; unexpected drift is resolved or accepted.
- Secrets are stored in the approved secrets manager for the target environment.
- Logs, metrics, traces, cost telemetry, and feedback channels are live.
- Security, privacy, records, accessibility, and procurement conditions are satisfied for the risk tier.
- Rollback, pause, or feature-flag path is documented.

These gates are not equally heavy for every use case. The discipline is to decide the gate set up front and record why any gate is deferred.

## Environment rules

Each environment should have a short rule card. Keep it practical:

| Rule | Sandbox | Development | Staging/Test | Production |
| --- | --- | --- | --- | --- |
| Data | Synthetic, public, or approved sample | Synthetic or sanitized | Sanitized production-shape | Approved real data only |
| Access | Broad for approved learners/builders | Delivery team | Delivery, security, product owner | Least privilege; audited |
| Deploys | Manual or automated | CI preferred | CI/CD only | CI/CD with approval |
| Secrets | Sandbox-only | Dev-only | Staging-only | Production-only |
| Network | Approved endpoints | Approved endpoints | Production-like egress | Locked-down egress |
| Logs | Basic admin/cloud logs | Structured logs | Production-like logs | Security-owned retention |
| Cost | Low cap and auto-cleanup | Team budget | Launch budget | Service budget and alerts |
| Retention | Short TTL | Short TTL | Test retention | Records/legal schedule |

This table is often the single most useful artifact for non-technical sponsors. It shows that "environment separation" is not an abstract architecture preference; it is a set of concrete rules.

## Routine operations

Environment setup is not finished when the first workload deploys. Assign a maintenance cadence before production launch.

| Cadence | What to review | Typical owner |
| --- | --- | --- |
| Daily or per incident | Critical alerts, failed deploys, runaway cost, security events | Operations/platform owner |
| Weekly | Eval failures, user feedback, cost by use case, open vulnerabilities, failed jobs | Product owner and technical owner |
| Monthly | Dependency updates, base image refresh, access changes, prompt/model changes, dashboard quality | Delivery team plus security |
| Quarterly | Access recertification, drift review, disaster recovery tabletop, vendor/model review, policy exceptions | Sponsor, Review Committee, platform/security |
| Annually or major change | Architecture review, procurement refresh, records/privacy validation, decommissioning decisions | Sponsor and governance owners |

Routine maintenance is where many AI pilots fail after the launch demo. A model provider changes behavior, a dependency develops a critical CVE, token cost spikes, logs are inaccessible, or user feedback piles up without review. Treat these as normal operations work, not surprises.

## Monitoring, drift, and feedback loop

AI services need the usual production monitoring plus AI-specific signals:

- Availability, latency, error rate, and saturation.
- Token usage, cost per request, and cost by use case.
- Eval score by version, prompt, model, retrieval source, and tool configuration.
- User feedback rate and negative-feedback themes.
- Refusal rate, content-filter rate, DLP events, and policy blocks.
- Retrieval quality, stale-source rate, and missing-source reports.
- Provider/model change notices and re-evaluation results.

The loop should be explicit:

1. Production telemetry and user feedback create a review item.
2. The owner classifies it as bug, model/prompt issue, data issue, training issue, or policy issue.
3. The fix is tested in development and staging.
4. Evals are updated if the issue revealed a missing test case.
5. The change is promoted with evidence.

Without this loop, teams confuse "we launched an AI tool" with "we can operate an AI service."

## Rollback and pause

Every production AI workload needs a pause plan. Rollback may mean:

- Revert application code to the previous release.
- Revert a prompt template or system instruction.
- Revert model slug or provider configuration.
- Disable a tool/action behind a feature flag.
- Fall back to search-only or draft-only mode.
- Narrow access to a pilot group.
- Pause the service and route work back to the manual process.

Document the rollback owner, trigger, action, and communication path before launch. For small agencies, this can be one page. For high-impact services, rehearse it.

## Vendor and partner questions

When a vendor or implementation partner designs the environment, ask:

- How are sandbox, development, staging, and production separated?
- Which boundary is used: account, subscription, project, resource group, workspace, tenant, or namespace?
- How are secrets separated and rotated across environments?
- How is production access approved, logged, and reviewed?
- What data is allowed in each environment?
- How are CVEs, dependency updates, base images, and SBOMs handled after launch?
- How are prompt, model, retrieval, and tool changes versioned and promoted?
- What telemetry will we see: logs, traces, evals, cost, user feedback, and audit events?
- What is the rollback or pause plan?
- What maintenance work is included after the initial build, and what remains the agency's responsibility?

These questions are intentionally not enterprise-only. They help a small agency know what to ask for even when a vendor does the work.

## Common failure modes

- **Sandbox becomes production by accident.** A prototype gets useful, real data creeps in, and no one ever performs a readiness review.
- **Development and staging are too different.** The system passes tests in staging but fails in production because network, identity, secrets, or data shape differ.
- **Production has no owner after launch.** The project team disbands and no one reviews feedback, cost, logs, or provider changes.
- **Prompts and model settings are changed manually.** Behavior changes without a reviewable record or rollback path.
- **Security scan results pile up.** CVE checks exist, but nobody owns triage and remediation.
- **No drift review.** Infrastructure, prompts, retrieval indexes, and vendor behavior slowly diverge from the approved design.

## Related

- [Cloud Sandbox Provisioning](/phase-3-infrastructure/cloud-sandbox/) - landing-zone patterns and per-cloud examples.
- [CI/CD Pipeline](/phase-3-infrastructure/cicd-pipeline/) - gates that make promotion repeatable.
- [Security Baseline](/phase-3-infrastructure/security-baseline/) - controls that apply by environment and risk tier.
- [Observability Foundation](/phase-3-infrastructure/observability/) - telemetry, evals, drift, and cost visibility.
- [Operations Lifecycle & Resilience](/phase-3-infrastructure/operations-lifecycle/) - recurring maintenance, backup/restore, exceptions, records, and decommissioning.
- [Environment Setup Courseware](/phase-3-infrastructure/environment-setup-courseware/) - facilitator plan and deck sources for teaching this model.

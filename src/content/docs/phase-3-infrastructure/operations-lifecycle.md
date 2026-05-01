---
title: Operations Lifecycle & Resilience
description: Practical post-launch operations for AI systems, including maintenance, access review, backup and restore, cost controls, records, provider change, and decommissioning.
sidebar:
  order: 10
---

Getting an AI workload into production is not the finish line. The service still needs ordinary operations discipline plus a few AI-specific practices: eval drift review, prompt and model change control, data-retention decisions, provider change monitoring, and a clear way to pause or retire the system.

This page is the "keep it healthy" layer. It is intentionally practical. A small agency may run these as a monthly checklist with a vendor. A medium agency may assign owners in a shared operations calendar. A large agency may automate much of it through platform tooling, policy-as-code, SIEM alerts, and change-management workflows.

## Minimum operating model

Every production AI service should have:

- A named business owner and technical owner.
- A support path and escalation path.
- Monitoring for quality, cost, safety, and availability.
- A rollback or pause plan.
- A maintenance calendar.
- A records, retention, and deletion rule.
- A retirement condition.

If an agency cannot name these owners, the service is not ready for broad production use. It may still be a valid pilot, but it should be labeled and bounded as one.

<div class="aqg-diagram" role="img" aria-label="AI operations lifecycle loop showing monitor, review, improve, rehearse, verify, and retire">
  <p class="aqg-diagram__title">AI operations lifecycle</p>
  <div class="aqg-cycle">
    <div class="aqg-node aqg-node--green">
      <span class="aqg-node__eyebrow">1</span>
      <strong class="aqg-node__title">Monitor</strong>
      <p class="aqg-node__body">Quality, safety, cost, reliability, feedback, and access signals.</p>
    </div>
    <div class="aqg-node aqg-node--blue">
      <span class="aqg-node__eyebrow">2</span>
      <strong class="aqg-node__title">Review</strong>
      <p class="aqg-node__body">Weekly, monthly, and quarterly operating checks with named owners.</p>
    </div>
    <div class="aqg-node aqg-node--violet">
      <span class="aqg-node__eyebrow">3</span>
      <strong class="aqg-node__title">Improve</strong>
      <p class="aqg-node__body">Fix bugs, tune prompts, update evals, refresh data, and close risks.</p>
    </div>
    <div class="aqg-node aqg-node--gold">
      <span class="aqg-node__eyebrow">4</span>
      <strong class="aqg-node__title">Rehearse</strong>
      <p class="aqg-node__body">Test rollback, restore, incident, break-glass, and manual fallback paths.</p>
    </div>
    <div class="aqg-node aqg-node--red">
      <span class="aqg-node__eyebrow">5</span>
      <strong class="aqg-node__title">Verify</strong>
      <p class="aqg-node__body">Confirm records, access, CVEs, provider changes, and policy exceptions.</p>
    </div>
    <div class="aqg-node aqg-node--green">
      <span class="aqg-node__eyebrow">6</span>
      <strong class="aqg-node__title">Retire when ready</strong>
      <p class="aqg-node__body">Decommission cleanly when value, risk, cost, or vendor context changes.</p>
    </div>
  </div>
  <p class="aqg-diagram__caption">The lifecycle repeats for as long as the service is in use. A small agency can run it as a checklist; larger teams can automate more of the evidence.</p>
</div>

## Lifecycle controls

| Control | Small starting point | Standard target | Larger-agency hardening |
| --- | --- | --- | --- |
| Maintenance cadence | Monthly checklist with named owner | Weekly/monthly operations calendar | Automated evidence collection and quarterly review board |
| Access review | Quarterly review of user/admin list | Group-based access recertification | Just-in-time production access and privileged access management |
| CVE/dependency review | Vendor or owner checks critical alerts monthly | CI scans plus monthly triage | Continuous vulnerability management with SLA tracking |
| Backup/restore | Confirm vendor export or manual restore path | Scheduled backups and restore test | DR exercise with recovery objectives |
| Cost controls | Budget alerts and owner notification | Per-use-case dashboards and hard-stop options | Anomaly detection and automated throttles |
| Drift review | Manual review of feedback and eval failures | Scheduled evals and drift worksheet | Production canaries, alerting, and model-change simulations |
| Records/retention | Document what is retained and where | Retention mapped to records schedule | Legal hold, eDiscovery, and per-user retrieval workflows |
| Decommissioning | Named retirement trigger | Decommission checklist | Formal archival, deletion proof, and contract exit workflow |

This table is not a maturity contest. It lets agencies pick the version they can operate honestly.

## Routine maintenance cadence

| Cadence | Work to do | Evidence |
| --- | --- | --- |
| Weekly | Review incidents, failed evals, negative feedback, cost anomalies, safety/DLP events | Dashboard snapshot or review note |
| Monthly | Review CVEs, dependency updates, base images, prompt/model changes, access changes, and open policy exceptions | Operations calendar entry |
| Quarterly | Recertify access, run drift review, test break-glass, review provider/model notices, inspect records retention, run a tabletop for incident/rollback | Signed review note |
| Annually or major change | Revisit architecture, vendor terms, records schedule, disaster recovery, retirement condition, and budget model | Annual service review |

Small agencies can combine these into one monthly or quarterly meeting. The important part is that the meeting produces decisions, owners, and follow-up dates.

## Access recertification and break-glass

Production AI services deserve a recurring access review because logs, prompts, outputs, and admin panels may expose sensitive information.

At least quarterly:

- Confirm every production admin still needs access.
- Confirm every developer, operator, reviewer, and vendor account maps to a named person or approved workload identity.
- Remove stale accounts, unused groups, and departed staff.
- Review privileged activity and break-glass usage.
- Confirm the break-glass procedure still works.

Break-glass access should be emergency-only, time-bounded, logged, and reviewed after use. For small teams, this may be a sealed or vault-stored admin account with two-person approval. For larger teams, use privileged access management or just-in-time elevation.

## Backup, restore, and disaster recovery

AI services have more state than teams expect. Back up and test restore for:

- Application databases.
- Prompt registry or prompt configuration.
- Model-routing configuration.
- Retrieval indexes and source-document manifests.
- Eval suites and results.
- Audit logs, when records rules require retention.
- User feedback, if it drives service improvement or incident review.

Backups that have never been restored are assumptions. Run at least one restore test before broad production launch and repeat on a risk-based cadence. For Tier-1 internal tools, a manual restore rehearsal may be enough. For Tier-2/3, document recovery time objective, recovery point objective, and who can approve fallback to manual operations.

## Cost anomaly and runaway controls

AI workloads can run up cost quickly through long prompts, agent loops, repeated retries, retrieval expansion, or broad user adoption. Put cost controls close to the system:

- Per-use-case budget and owner.
- Warning and critical alerts.
- Token and tool-call limits.
- Retry limits and circuit breakers.
- Agent iteration caps.
- Rate limits by user, service, and environment.
- Feature flag or hard-stop option for runaway usage.

The first response to a cost anomaly is usually to narrow scope, reduce model tier, disable an expensive feature, or pause a workflow while the owner reviews. Do not wait for the monthly invoice.

## Data lifecycle and records

AI systems produce operational records that may matter later: prompts, responses, retrieved-source IDs, eval results, feedback, audit logs, generated documents, and decision-support outputs. They should not accidentally become a permanent shadow repository.

For each production use case, document:

- What prompts and responses are stored, sampled, redacted, hashed, or omitted.
- Whether AI outputs are official records, drafts, working notes, or system logs.
- How records requests, FOIA/PRA requests, eDiscovery, and legal holds are handled locally.
- How long each artifact is retained.
- Who can retrieve artifacts for audit, incident review, or resident contestation.
- How data is deleted at contract end or service retirement.

This guide cannot decide local public-records law for an agency. It should force the right conversation with records, legal, privacy, and the business owner before launch.

## Synthetic data upkeep

Synthetic data is not a one-time fixture. It should stay useful as real workflows change.

Maintain synthetic datasets by:

- Matching the shape and edge cases of real workflow data without copying real people.
- Versioning datasets alongside labs, evals, and starter projects.
- Adding synthetic examples when incidents, UAT, or feedback reveal missing cases.
- Removing examples that imply a legal or policy rule the agency has not approved.
- Keeping test data clearly labeled so it cannot be mistaken for production records.

For higher-risk workflows, the synthetic data review should include a domain expert, not only a developer.

## Adversarial and misuse testing

Every AI service should be tested against expected misuse before launch. Keep this practical:

- Prompt injection attempts.
- Requests for confidential or restricted data.
- Attempts to make the tool exceed its authority.
- Attempts to bypass human review.
- Sensitive-topic edge cases.
- Bad source documents in retrieval.
- Ambiguous user instructions.

For Tier-1 internal tools, a short misuse checklist is usually enough. For Tier-2/3 or public-facing tools, add adversarial cases to the eval suite and review them before production launch. When a misuse case succeeds, either fix the system, narrow the scope, add human review, or defer launch.

## Provider and model change management

AI providers change model catalogs, default behavior, SDKs, pricing, rate limits, and data-residency options. Treat provider change as an operating risk:

- Subscribe to provider release notes or contract notices.
- Record model IDs, deployment names, versions, regions, and fallback choices.
- Re-run evals before changing model tier, provider route, safety setting, or retrieval configuration.
- Review cost and latency after provider changes.
- Confirm procurement and data-use terms still match the approved use.
- Keep a fallback path when a model is deprecated or a region becomes unavailable.

The [AI Orchestration module](/phase-5-platform/ai-orchestration-module/) owns the technical registry and adapter pattern. Operations owns the review cadence.

## Policy exceptions

Exceptions are normal. Untracked exceptions are how systems drift.

Every exception should record:

- The rule being excepted.
- Why the exception is needed.
- Scope: workload, environment, data class, and time period.
- Risk owner and mitigation.
- Expiration or review date.
- Approval path.

Examples: temporary direct API key use while workload identity is unavailable, delayed CVE remediation because the vendor patch is not ready, or extra prompt/response retention during a legal review. Exceptions should expire by default.

## Decommissioning

Retiring an AI system is part of the lifecycle, not a failure. A system may be replaced, absorbed into a vendor product, lose its sponsor, become too expensive, or depend on a model route that is no longer approved.

Before shutdown:

- Notify users and support teams.
- Export records that must be retained.
- Delete or archive prompts, indexes, logs, and generated outputs according to policy.
- Revoke service accounts, API keys, secrets, and vendor access.
- Remove scheduled jobs, budget alerts, and dashboards.
- Confirm contract exit, data deletion, and subprocessor obligations.
- Record lessons learned.

Decommissioning should leave fewer secrets, fewer bills, fewer stale records, and a clear audit trail.

## Vendor and partner questions

When a vendor operates some or all of the service, ask:

- What maintenance is included after launch?
- Who triages CVEs, dependencies, base images, and provider notices?
- How often are access lists reviewed?
- How are backups tested, and what are the recovery objectives?
- What records can the agency export, search, retain, or delete?
- How are prompt/model changes approved and rolled back?
- How are cost anomalies detected and contained?
- What happens if the model, region, vendor, or service is deprecated?
- What evidence will the agency receive for audits, records requests, and incident reviews?
- What is the decommissioning and data deletion process?

These are not "large agency only" questions. They are how smaller organizations buy operational maturity they may not have in-house.

## Related

- [Environment Strategy & Promotion Path](/phase-3-infrastructure/environment-strategy/) - where environment separation and promotion gates are defined.
- [Identity & Access](/phase-3-infrastructure/identity-access/) - access review and break-glass patterns.
- [CI/CD Pipeline](/phase-3-infrastructure/cicd-pipeline/) - CVE, SBOM, signing, and eval gates.
- [Observability Foundation](/phase-3-infrastructure/observability/) - dashboards, logs, evals, and cost signals.
- [AI Orchestration Module](/phase-5-platform/ai-orchestration-module/) - prompt/model registry, evals, provider adapters, and cost tracking.
- [Production Readiness Checklist](/phase-6-starter-projects/production-readiness/) - the launch gate these operations support.

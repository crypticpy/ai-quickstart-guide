---
title: 90-Day Quickstart Checklist
description: Week-by-week tasks for the first 90 days. Designed so a small IT team can show tangible progress without getting lost in research.
sidebar:
  order: 2
---

This checklist turns the guide into a first-90-days operating plan. It assumes the agency starts with scattered interest in AI, no formal governance process, and limited staff time. The goal is not to deploy a major AI system in 90 days. The goal is to create the minimum durable structure: policy, intake, training, sandbox planning, and a small backlog of reviewed use cases.

Use the week-by-week plan as written if you need a default. Compress only when the same people own multiple workstreams and can actually meet; extend when legal, procurement, or security review has fixed calendar constraints.

## At a glance

| Week | Focus | Primary owner | Main output |
| ---- | ----- | ------------- | ----------- |
| 1 | Name the mandate | Executive sponsor | Sponsor memo and working group roster |
| 2 | Baseline readiness | AI program lead | Readiness score and top gaps |
| 3 | Set use rules | Legal + HR + program lead | Draft Acceptable Use Policy |
| 4 | Define risk tiers | Legal + security + data owner | Risk matrix and review thresholds |
| 5 | Create governance cadence | Executive sponsor | AI Review Committee charter |
| 6 | Launch intake | Program lead + department managers | Intake form and first use-case backlog |
| 7 | Start training | Training lead | Track 1 cohort scheduled |
| 8 | Prepare leaders and managers | Training lead + sponsor | Leadership and manager briefings |
| 9 | Seed champions | Department heads | Champions list and office-hour cadence |
| 10 | Start infrastructure planning | IT/cloud lead | Sandbox target design and procurement path |
| 11 | Set security baseline | Security + cloud lead | Data, identity, logging, and egress controls |
| 12 | Pick starter candidates | Review Committee | Shortlist of reviewed starter projects |
| 13 | Publish the 90-day readout | Program lead + sponsor | Report, next-quarter plan, and decision requests |

## Week 1: Name the mandate

| Item | Details |
| ---- | ------- |
| Owners | Executive sponsor, CIO/IT director, AI program lead |
| Time estimate | 3-5 hours total |
| Use | [Pick Your Path](/getting-started/pick-your-path/), [Pre-Funding Checklist](/getting-started/pre-funding-checklist/) |
| Done when | A named executive sponsor has assigned an AI program lead, approved a 90-day scope, and identified a small working group with IT, legal, HR/training, security, data, and one operational department. |

Write a one-page sponsor memo: why the agency is starting, what is in scope for 90 days, what is out of scope, and who can make decisions. Do not start with a large committee. Start with a working group small enough to meet weekly.

**Small:** One sponsor, one program lead, one IT/security lead, one department manager, and legal consulted as needed.

**Standard:** Add HR/training, procurement, data governance, and communications.

**Large:** Create an executive steering group, but keep the working group separate so drafting and coordination do not stall.

## Week 2: Baseline readiness

| Item | Details |
| ---- | ------- |
| Owners | AI program lead, working group |
| Time estimate | 4-6 hours, including one scoring meeting |
| Use | [Readiness Assessment](/getting-started/readiness-assessment/), [Maturity Model](/getting-started/maturity-model/) |
| Done when | The assessment is scored, the top five gaps are named, and each gap has an owner or an explicit decision to defer. |

Run the readiness assessment as a group, not as a solo survey. The value is in the discussion: where policy is unclear, where infrastructure is missing, where training is uneven, and where departments already use AI unofficially.

**Small:** Score quickly and focus on the two gaps that block safe experimentation.

**Standard:** Convert gaps into a 90-day action register with owner, date, and decision needed.

**Large:** Score by major department or bureau, then compare patterns before setting priorities.

## Week 3: Draft acceptable-use rules

| Item | Details |
| ---- | ------- |
| Owners | Legal, HR, AI program lead |
| Time estimate | 5-8 hours plus review time |
| Use | [Acceptable Use Policy](/phase-1-governance/acceptable-use-policy/), [Legislative Compliance](/phase-1-governance/legislative-compliance/) |
| Done when | A draft AUP names approved and prohibited uses, data-handling limits, training expectations, reporting channels, and the interim approver for exceptions. |

Start with staff behavior, not technology. Staff need to know which tools are approved, what data may be entered, when a human must review output, and how to ask for help without being punished for curiosity.

**Small:** Adopt a short interim AUP and revisit it after the first quarter.

**Standard:** Route the AUP through legal, HR, security, labor relations if applicable, and department leadership.

**Large:** Align the AUP with enterprise data classification, records retention, public disclosure, and civil-rights review processes.

## Week 4: Define risk tiers

| Item | Details |
| ---- | ------- |
| Owners | Legal, security, privacy/data owner, program lead |
| Time estimate | 4-7 hours |
| Use | [Risk Classification](/phase-1-governance/risk-classification/), [Procurement Guardrails](/phase-1-governance/procurement-guardrails/) |
| Done when | The agency has a plain-language tier model that says which AI uses are low, medium, and high risk, plus what review each tier requires. |

Keep the first version practical. The tier model should help a manager decide whether a use case can proceed with light review or needs legal, privacy, equity, procurement, and security review before any pilot.

**Small:** Use three tiers and default public-facing or benefits-impacting uses to high risk.

**Standard:** Add procurement clauses for data non-use, model substitution notice, audit logs, and security attestations.

**Large:** Map tiers to existing enterprise risk, privacy impact assessment, cybersecurity, and legislative reporting frameworks.

## Week 5: Charter the AI Review Committee

| Item | Details |
| ---- | ------- |
| Owners | Executive sponsor, program lead |
| Time estimate | 5-8 hours |
| Use | [Review Committee](/phase-1-governance/review-committee/) |
| Done when | The committee has a chair, voting members, quorum, meeting cadence, intake review process, records location, escalation path, and first meeting date. |

The committee should be able to say "yes, with conditions" as often as it says "no." Its job is to make AI use legible, reviewed, and supportable, not to turn every idea into a legal proceeding.

**Small:** Combine committee and working group for the first 90 days, with legal/security sign-off on higher-risk items.

**Standard:** Establish a monthly committee plus weekly staff triage by the program lead.

**Large:** Create sub-review paths for privacy, security, accessibility, civil rights, and procurement so the full committee does not become a bottleneck.

## Week 6: Launch use-case intake

| Item | Details |
| ---- | ------- |
| Owners | AI program lead, department managers |
| Time estimate | 4-6 hours to configure and announce; 1-2 hours weekly triage |
| Use | [AI Use Case Intake Form](/phase-2-education/use-case-intake/), [Track 7: Middle Managers](/phase-2-education/track-7-middle-managers/) |
| Done when | Staff know where to submit AI ideas, each submission receives a provisional risk tier, and the first 10-20 ideas are logged for triage. |

Ask for real workflows, not generic suggestions. Good intake describes the current process, pain point, data involved, affected people, human review plan, and how success would be measured.

**Small:** Use a shared inbox or form export if no workflow system exists.

**Standard:** Track status values: received, needs clarification, under review, approved for discovery, deferred, rejected, and deployed.

**Large:** Integrate intake with portfolio management, privacy impact assessment, architecture review, and procurement intake.

## Week 7: Start AI Foundations training

| Item | Details |
| ---- | ------- |
| Owners | Training lead, program lead, department heads |
| Time estimate | 2-4 hours prep; 2 hours per learner for the first cohort |
| Use | [Track 1: AI Foundations](/phase-2-education/track-1-foundations/), [Change Management](/phase-2-education/change-management/) |
| Done when | The first cohort is scheduled, attendance is tracked, and the course explains the AUP, risk tiers, intake process, and where approved tools live. |

The first cohort should include managers, analysts, public-facing staff, IT, legal/procurement partners, and likely champions. Training should make staff safer and more useful immediately.

**Small:** Run one live cohort and record it for later onboarding.

**Standard:** Schedule recurring cohorts and require completion before staff use Tier-2 or Tier-3 tools.

**Large:** Segment by role and department, then publish completion dashboards for leadership follow-up.

## Week 8: Prepare leaders and managers

| Item | Details |
| ---- | ------- |
| Owners | Executive sponsor, training lead, HR |
| Time estimate | 3-5 hours prep; 75 minutes per briefing/session |
| Use | [Track 2: Leadership Briefings](/phase-2-education/track-2-leadership/), [Track 7: Middle Managers](/phase-2-education/track-7-middle-managers/), [Job Impact Messaging](/phase-2-education/job-impact-messaging/) |
| Done when | Leaders can explain the AI program in consistent language, and managers have talking points for staff concerns, shadow AI, and workflow ideas. |

Managers are the adoption layer. If they cannot answer basic questions, staff will either avoid the program or work around it. Give managers simple language and a place to escalate concerns.

**Small:** Hold one combined leadership/manager session.

**Standard:** Separate executive briefing from manager workflow-audit training.

**Large:** Cascade through departments using trained facilitators and a shared message kit.

## Week 9: Seed the champions network

| Item | Details |
| ---- | ------- |
| Owners | Program lead, department heads |
| Time estimate | 3-5 hours to recruit; 1 hour per month ongoing |
| Use | [Track 5: AI Champions Network](/phase-2-education/track-5-champions/), [Sustainability](/phase-2-education/sustainability/) |
| Done when | Each priority department has named champions, champions know their role, and office hours or a peer channel is scheduled. |

Champions are not unofficial approvers. They help peers use approved tools, surface good use cases, and notice where training or policy is unclear.

**Small:** Recruit 3-5 champions across the agency.

**Standard:** Recruit 1-2 champions per department with monthly office hours.

**Large:** Create a champions community of practice with facilitation support, recognition, and a feedback loop into governance.

## Week 10: Start sandbox planning

| Item | Details |
| ---- | ------- |
| Owners | IT/cloud lead, security, procurement |
| Time estimate | 6-10 hours for target design and procurement path |
| Use | [Cloud Sandbox](/phase-3-infrastructure/cloud-sandbox/), [Identity and Access](/phase-3-infrastructure/identity-access/), [Secrets Management](/phase-3-infrastructure/secrets-management/) |
| Done when | The agency has chosen a sandbox path, named required controls, identified procurement blockers, and assigned an owner for provisioning. |

The sandbox should be permissive for tools and strict for data. Prototypes should use synthetic, public, or approved low-sensitivity data until controls are in place.

**Small:** Start with local Docker or a tightly scoped cloud sandbox if procurement is slow.

**Standard:** Provision a separate cloud account/subscription/project with SSO, budgets, logging, and resource tags.

**Large:** Use enterprise landing-zone patterns, policy-as-code, private endpoints, and central observability from day one.

## Week 11: Set the security baseline

| Item | Details |
| ---- | ------- |
| Owners | Security, privacy/data owner, cloud lead |
| Time estimate | 5-8 hours for baseline decisions |
| Use | [Security Baseline](/phase-3-infrastructure/security-baseline/), [Observability](/phase-3-infrastructure/observability/), [CI/CD Pipeline](/phase-3-infrastructure/cicd-pipeline/) |
| Done when | Minimum controls are documented for data classification, identity, logging, secrets, egress, retention, and per-tier enforcement. |

Write the baseline before the first prototype handles sensitive data. It is easier to grant exceptions later than to retrofit logging, secrets, and access control after a tool becomes popular.

**Small:** Require SSO, no sensitive data in prototypes, named owners, audit logs where available, and manual review before sharing outputs externally.

**Standard:** Add managed secrets, budget alerts, central logs, vulnerability scanning, and deployment approval gates.

**Large:** Add policy-as-code, signed builds, private networking, DLP, SIEM integration, and formal control mapping.

## Week 12: Pick starter candidates

| Item | Details |
| ---- | ------- |
| Owners | AI Review Committee, program lead, department sponsors |
| Time estimate | 4-6 hours |
| Use | [Selection Guide](/phase-6-starter-projects/selection-guide/), [Starter Projects](/phase-6-starter-projects/), [ROI Calculator](/resources/roi-calculator/) |
| Done when | The committee has shortlisted 2-3 starter candidates with sponsor, risk tier, data needs, user group, expected value, and next discovery step. |

Choose for learning and feasibility, not headlines. The best first starter usually has internal users, low sensitivity, clear human review, visible time savings, and a cooperative sponsor.

**Small:** Pick one low-risk internal assistant or document workflow.

**Standard:** Compare 3-5 candidates using value, risk, readiness, and sponsor strength.

**Large:** Build a portfolio mix: one low-risk internal tool, one operational workflow, and one longer-range high-value candidate that needs more governance work.

## Week 13: Publish the 90-day readout

| Item | Details |
| ---- | ------- |
| Owners | AI program lead, executive sponsor |
| Time estimate | 5-8 hours |
| Use | [Quarterly Report](/resources/quarterly-report/), [Gantt and Dependencies](/resources/gantt-and-dependencies/), [Upgrading the Program](/resources/upgrading/) |
| Done when | Leadership receives a short report covering decisions made, training progress, intake pipeline, risks, blockers, starter candidates, and the next-quarter ask. |

The readout should make the next decision easy. State what changed in 90 days, what remains blocked, what funding or authority is needed, and which workstream owns the next quarter.

**Small:** Ask for continued program-lead time, limited tool budget, and authority to run one starter discovery.

**Standard:** Ask for sandbox provisioning, role-based training expansion, and approval to begin the selected starter project.

**Large:** Ask for a funded program increment covering platform team staffing, enterprise controls, procurement vehicles, and department adoption support.

## Minimum 90-day evidence pack

Keep these artifacts in one shared location:

- Sponsor memo and working group roster.
- Readiness assessment results and gap register.
- Draft or approved AUP.
- Risk classification matrix.
- AI Review Committee charter and meeting notes.
- Use-case intake log.
- Training attendance and upcoming cohort schedule.
- Champions roster and office-hour schedule.
- Sandbox/security baseline decisions.
- Starter-project shortlist.
- 90-day readout and next-quarter plan.

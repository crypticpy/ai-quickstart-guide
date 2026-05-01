---
title: Environment Setup Courseware
description: Facilitator plan, activities, and deck sources for teaching sandbox, development, staging, and production environment setup.
sidebar:
  order: 11
---

Use this courseware when technical leads, managers, vendors, sponsors, and governance reviewers need a shared mental model for AI environment setup. The goal is not to turn every attendee into a cloud architect. The goal is to help the room understand what must be separated, what evidence is needed before production, and what to ask for when a vendor or central IT team owns the implementation.

Pair this courseware with [Environment Strategy & Promotion Path](/phase-3-infrastructure/environment-strategy/) and [Cloud Sandbox Provisioning](/phase-3-infrastructure/cloud-sandbox/).

## Learning objectives

By the end, participants should be able to:

- Explain the difference between sandbox, development, staging/test, and production.
- Pick a reasonable small, standard, or large environment separation path.
- Identify what data is allowed in each environment.
- Describe the gates between development, staging, and production.
- Ask useful vendor or central-IT questions about security, monitoring, CVEs, drift, and maintenance.
- Name the recurring operational work required after launch.

## Audience

Invite the people who will make, approve, operate, or inherit the environment:

- AI program lead or sponsor.
- IT/cloud/platform lead, even if part-time.
- Security, privacy, records, and procurement reviewers.
- Product owner for the first starter project.
- Vendor or implementation partner, if one is involved.
- Department manager for the first use case.

For a small agency, this can be a 60-minute working meeting with five people. For a medium or large agency, run it as a 90-minute workshop and leave with a documented target model.

## Option A: 60-minute basics session

Use when the audience mainly needs orientation and a practical vocabulary.

| Time | Segment | Output |
| --- | --- | --- |
| 0-10 min | Why environment separation matters | Shared risk framing |
| 10-25 min | Sandbox, development, staging, production | Plain-language model |
| 25-40 min | Small/standard/large paths | Local fit discussion |
| 40-50 min | Promotion gates and routine operations | First gate checklist |
| 50-60 min | Vendor/IT questions and next steps | Assigned follow-ups |

Deck source: [Environment Setup Basics](/deck-sources/phase-3/environment-setup-basics.md).

## Option B: 90-minute design workshop

Use when the agency is ready to choose an operating model for Phase 3.

| Time | Segment | Output |
| --- | --- | --- |
| 0-10 min | Confirm use case and risk tier | Scope statement |
| 10-25 min | Map current environments | Current-state diagram |
| 25-45 min | Choose target boundaries | Target environment model |
| 45-60 min | Define promotion gates | Gate checklist |
| 60-75 min | Define operations cadence | Maintenance calendar |
| 75-90 min | Record decisions and open asks | Action list |

Deck source: [Environment Design Workshop](/deck-sources/phase-3/environment-design-workshop.md).

## Activity 1: Environment boundary map

Ask the group to fill this in for the first AI workload:

| Question | Local answer |
| --- | --- |
| What is the first use case or starter project? | [answer] |
| What risk tier is expected? | [Tier 1/2/3] |
| Where will sandbox work happen? | [workspace/account/project/resource group] |
| Where will development work happen? | [workspace/account/project/resource group] |
| Where will staging/test happen? | [workspace/account/project/resource group] |
| Where will production happen? | [workspace/account/project/resource group] |
| Who owns each environment? | [names/roles] |
| What data is allowed in each environment? | [data rule] |
| What logs and cost views are available? | [system/link] |

For small agencies, it is acceptable if some answers are "vendor workspace" or "existing cloud tenant." The important thing is to name the boundary and the owner.

## Activity 2: Promotion gate sketch

Have the group decide which gates apply before the first production launch:

| Gate | Required now? | Owner | Evidence |
| --- | --- | --- | --- |
| Functional tests | [yes/no/defer] | [owner] | [link/note] |
| AI eval suite | [yes/no/defer] | [owner] | [link/note] |
| Security scan and CVE review | [yes/no/defer] | [owner] | [link/note] |
| SBOM or dependency inventory | [yes/no/defer] | [owner] | [link/note] |
| Privacy/data review | [yes/no/defer] | [owner] | [link/note] |
| Observability dashboard | [yes/no/defer] | [owner] | [link/note] |
| Feedback channel | [yes/no/defer] | [owner] | [link/note] |
| Rollback/pause plan | [yes/no/defer] | [owner] | [link/note] |

The goal is not to require everything for every pilot. The goal is to avoid accidental omissions.

## Activity 3: Maintenance calendar

Ask the group to assign owners for:

- Weekly feedback, cost, alert, and eval review.
- Monthly dependency, CVE, prompt/model, and access review.
- Quarterly drift, disaster recovery, vendor/model, and exception review.
- Incident-triggered retrospective and runbook update.

If nobody can own a recurring task, the launch plan should either narrow the use case, use a managed service with clearer support terms, or defer production.

## Materials to prepare

- Current Approved AI Tools List.
- Draft or adopted risk-tier matrix.
- Any existing cloud or SaaS environment names.
- Current identity provider and access process.
- Current security scanning or vulnerability management process.
- Budget owner and expected spend range.
- Vendor or central IT architecture notes, if available.

## Facilitation notes

Keep the session practical. Avoid turning it into a debate over ideal enterprise architecture. When the room gets stuck, ask:

- What is the smallest separation that keeps real data and production users safe?
- What would we need to see before a sponsor should approve launch?
- What would we need from a vendor if we cannot build this ourselves?
- What will someone still need to review every week or month after launch?

## Outputs

At the end of the session, save:

- Environment boundary map.
- Promotion gate checklist.
- Operations calendar.
- Open vendor/IT questions.
- Decision on whether Phase 3 is sandbox-only, standard, or production-ready for the first use case.

## Related templates

The [Template Library](/resources/template-library/) includes copy-ready templates for environment separation, promotion gates, operations calendars, production-readiness evidence, model/prompt change records, and drift/feedback review.

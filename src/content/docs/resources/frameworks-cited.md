---
title: Frameworks Cited
description: Versioned references for the frameworks the playbook draws from (NIST AI RMF, OMB M-25-21, OMB M-25-22, SLSA, SPACE) with notes on where each is load-bearing.
sidebar:
  order: 6
---

> **Why this page exists.** Each phase of the playbook cites at least one external framework as research basis. This page consolidates those citations in one place, with version numbers, and explains specifically where each framework is load-bearing in the guide. The goal is twofold: make the citations auditable for an agency that needs to defend its choices to a board or legislature, and make it obvious where the playbook will need an update when a framework version changes. Verify policy memoranda and standards against the publisher's current page before relying on them in an official memo.

> **Last reviewed: April 30, 2026.** Re-check publisher pages before citing these frameworks in a formal policy, procurement package, grant response, or legislative report.

## NIST AI RMF 1.0

- **Full title:** Artificial Intelligence Risk Management Framework (AI RMF 1.0)
- **Publisher:** National Institute of Standards and Technology (NIST), US Department of Commerce
- **Version cited:** 1.0
- **Published:** January 2023
- **URL:** https://nist.gov/itl/ai-risk-management-framework

### Where it is load-bearing in the playbook

- The [Acceptable Use Policy](/phase-1-governance/acceptable-use-policy/) borrows the four-function structure (Govern, Map, Measure, Manage) for organizing policy obligations.
- The [Risk Classification](/phase-1-governance/risk-classification/) tier definitions take the AI RMF's "trustworthy AI characteristics" (validity, reliability, safety, security, accountability, transparency, privacy, fairness with bias managed) as the dimensions a Review Committee evaluates against.
- The [Review Committee Charter](/phase-1-governance/review-committee/) explicitly references the Govern function as the agency-level posture the committee owns.

### What changes when NIST updates the framework

NIST's Generative AI Profile (NIST AI 600-1, July 2024) supplements RMF 1.0 with generative-AI-specific risks. The playbook references the GenAI profile in the [Phase 1 governance overview](/phase-1-governance/) but the substantive obligations still derive from RMF 1.0. If NIST publishes an AI RMF 2.0 with structural changes, the four-function structure cited above will need to be re-mapped to the new structure across at least three Phase 1 pages.

## OMB Memorandum M-25-21

- **Full title:** Accelerating Federal Use of AI through Innovation, Governance, and Public Trust
- **Publisher:** Office of Management and Budget, Executive Office of the President
- **Version cited:** M-25-21 (previously M-24-10)
- **Published:** April 2025
- **URL:** https://www.whitehouse.gov/wp-content/uploads/2025/02/M-25-21-Accelerating-Federal-Use-of-AI-through-Innovation-Governance-and-Public-Trust.pdf
- **Supersession note:** M-25-21 (April 2025) supersedes M-24-10 from the prior administration. M-25-22 supersedes M-24-18. M-25-21 keeps the Chief AI Officer role, the public AI use case inventory, and the high-impact AI risk practices, while shifting tone toward acceleration and innovation. Citations in this playbook now point to M-25-21; M-24-10 is preserved below as the historical predecessor.

### Where it is load-bearing in the playbook

- The [Review Committee Charter](/phase-1-governance/review-committee/) maps the playbook's "Agency AI Official" role to M-25-21's required Chief AI Officer designation. This makes the same governance work satisfy both the playbook and the federal mandate (where it applies, or where a state agency adopts the federal language by reference, as the [large state case study](/resources/case-study-large-state/) did).
- The [Risk Classification](/phase-1-governance/risk-classification/) page draws its "high-impact AI" categories directly from M-25-21's definitions, with one rename: the playbook calls them Tier 3 to keep the language consistent across all six phases.
- The public AI use case inventory required by M-25-21 corresponds to the inventory column in the playbook's risk-classification template.

### What changes when OMB updates the memorandum

M-25-21 is policy that can change with administration. The playbook's content survives changes to the _enforcement_ of M-25-21 because the underlying controls (AI accountable official, inventory, risk management plan, contestation pathway) also appear in state/local policy patterns and procurement expectations. See the [Legislative Tracker](/resources/legislative-tracker/). If M-25-21 is rescinded or materially changed, update the citation and legal applicability notes rather than removing the underlying governance practice automatically.

### Historical predecessor: M-24-10

M-24-10 (March 2024, "Advancing Governance, Innovation, and Risk Management for Agency Use of Artificial Intelligence") was rescinded and replaced by M-25-21 in April 2025. Many state laws and statewide policies were drafted against M-24-10's language and still reference it by name. When you see "M-24-10" in a state statute or in a 2024-vintage agency policy, treat it as the predecessor of M-25-21 for federal purposes; the substantive control set carried over. Original URL: https://www.whitehouse.gov/wp-content/uploads/2024/03/M-24-10-Advancing-Governance-Innovation-and-Risk-Management-for-Agency-Use-of-Artificial-Intelligence.pdf

## OMB Memorandum M-25-22

- **Full title:** Driving Efficient Acquisition of Artificial Intelligence in Government
- **Publisher:** Office of Management and Budget, Executive Office of the President
- **Version cited:** M-25-22 (previously M-24-18)
- **Published:** April 2025
- **URL:** https://www.whitehouse.gov/wp-content/uploads/2025/02/M-25-22-Driving-Efficient-Acquisition-of-Artificial-Intelligence-in-Government.pdf
- **Supersession note:** M-25-22 supersedes M-24-18 from the prior administration. The procurement clause structure carries over; the new memo emphasizes commercial AI acquisition speed and competition.

### Where it is load-bearing in the playbook

- The [Procurement Guardrails](/phase-1-governance/procurement-guardrails/) page derives its three-section addendum (A, B, C) directly from M-25-22's procurement requirements: Section A covers M-25-22's baseline obligations (data rights, vendor representations, performance reporting); Section B covers the additional obligations for high-impact AI; Section C covers the bias-testing and audit-access provisions M-25-22 requires for the highest-risk procurements.
- The [Stack Selection](/phase-4-dev-stack/stack-selection/) decision tree references M-25-22's preference for open-weight models where feasible, alongside the agency's own technical and security criteria.

### What changes when OMB updates the memorandum

M-25-22, like M-25-21, is policy. Many of its procurement obligations are also being adopted (or are likely to be adopted) by state procurement offices using their own statutory authority. The playbook's procurement addendum stays useful even if M-25-22 is replaced, because most state-level procurement reform parallels its structure.

## SLSA — Supply Chain Levels for Software Artifacts

- **Full title:** Supply-chain Levels for Software Artifacts
- **Publisher:** Open Source Security Foundation (OpenSSF)
- **Version cited:** v1.0
- **Published:** April 2023 (v1.0); minor updates to specification ongoing
- **URL:** https://slsa.dev/spec/v1.0/

### Where it is load-bearing in the playbook

- The [CI/CD Pipeline](/phase-3-infrastructure/cicd-pipeline/) page recommends SLSA Level 2 as the baseline for AI services and Level 3 for Tier-3 use cases. The recommendation is based on what's achievable with reasonable engineering effort on a managed CI/CD platform (GitHub Actions, GitLab CI), not the maximum SLSA level theoretically possible.
- The [Reference Implementation](/phase-4-dev-stack/reference-implementation/) ships with SLSA Level 2 build provenance configured by default.
- The [large state case study](/resources/case-study-large-state/) discusses the legislative oversight angle: SLSA attestations are the kind of supply-chain evidence that legislative committees increasingly want to see.

### What changes when SLSA updates the specification

SLSA's specification gets updates over time. If a future SLSA version adds a level or restructures the existing levels, the recommendations in CI/CD Pipeline and Reference Implementation will need to be re-pinned, but the principle (use the highest level achievable with reasonable engineering effort) is durable.

## SPACE — Software Productivity, Activity, Communication, Efficiency

- **Full title:** The SPACE of Developer Productivity
- **Publishers:** Nicole Forsgren, Margaret-Anne Storey, Chandra Maddila, Thomas Zimmermann, Brian Houck, Jenna Butler
- **Version cited:** Original ACM Queue article
- **Published:** March 2021
- **URL:** https://queue.acm.org/detail.cfm?id=3454124

### Where it is load-bearing in the playbook

- The [Track 4 Developer Upskilling](/phase-2-education/track-4-developers/) outcomes (and the metrics by which the playbook claims AI assistance "works" for developers) are framed in SPACE terms (Satisfaction, Performance, Activity, Communication / collaboration, Efficiency / flow), not in the more common (and more misleading) line-of-code or velocity metrics.
- The [AI-Assisted Development](/phase-4-dev-stack/ai-assisted-development/) page argues against measuring AI tool effectiveness by lines of code accepted, and proposes SPACE-based measurement instead. The argument is direct from the original SPACE paper.

### What changes when SPACE evolves

SPACE is a research framework, not a standard, so it does not get versioned in the formal sense. The five dimensions are a durable framing for developer productivity. If a successor or complementary framework emerges, incorporate it as a complement rather than automatically replacing the measurement approach.

## Frameworks referenced but not load-bearing

These appear in the playbook but the playbook's content does not structurally depend on them. They are cited for completeness and to give an agency a known starting point if they want to go deeper.

| Framework                             | Where it appears                                                | Why it's not load-bearing                                                                                                                |
| ------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| ISO/IEC 42001 (AI management systems) | [Phase 1 governance overview](/phase-1-governance/)             | Cited as an option for agencies that want a certifiable AI management system; the playbook's controls satisfy 42001 but don't require it |
| ADKAR (change management)             | [Curriculum Map](/phase-2-education/)                           | Cited as the change-management lens for the seven training tracks; the tracks would still work without explicit ADKAR mapping            |
| Kirkpatrick (training evaluation)     | [Curriculum Map](/phase-2-education/)                           | Cited as the four-level evaluation framework for training outcomes; replaceable by any L1-L4 evaluation framework                        |
| OWASP Top 10 for LLM Applications     | [Security Baseline](/phase-3-infrastructure/security-baseline/) | Cited as the canonical list of LLM-specific security risks; updates as OWASP publishes new versions                                      |
| US AI Bill of Rights (Blueprint)      | [Phase 1 governance overview](/phase-1-governance/)             | Cited as a values statement; not directly cited in any control requirement                                                               |

## How to cite this guide

When citing the playbook in your own agency's documentation, the recommended pattern is:

> _AI Quickstart Strategy Guide, Version 1.1 (Expert Panel Revisions). Used under CC BY-SA 4.0; code samples under MIT. Adapted for {{Agency name}}._

Citations to the underlying frameworks should be to the frameworks themselves (URLs above), not to this page; this page is a roll-up reference, not a primary source.

## See also

- [Legislative Tracker](/resources/legislative-tracker/): for the laws (which change faster than the frameworks above)
- [Phase 1: Governance](/phase-1-governance/): where most of these frameworks land in practice
- [Maturity Model](/getting-started/maturity-model/): frames the whole playbook in Crawl/Walk/Run/Fly terms

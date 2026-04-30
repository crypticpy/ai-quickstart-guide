---
title: Legislative Tracker
description: Where to look for current AI legislation, plus an agency-side compliance checklist that maps a small set of laws to the controls already in this playbook.
sidebar:
  order: 7
---

> **What this is, and is not.** This is not a maintained legal tracker and it is not legal advice. State AI legislation moves faster than a documentation site can keep up. Instead, this page does two things: (1) point you to maintained external trackers that are updated more frequently, and (2) give you a one-pass compliance checklist that maps common AI-law obligations to controls already documented in this playbook. The checklist is the durable part; the underlying laws will change, but the questions you have to answer about your agency rarely change.

> **Last reviewed: April 30, 2026.** Verify bill status, effective dates, and public-agency scope against counsel, your legislature, and at least one maintained external tracker before relying on a specific law in an official memo.

## Maintained external trackers

These are useful sources to bookmark. Cross-check them against your legislature, attorney general, procurement office, or counsel before citing a law in an official memo.

### IAPP — Global AI Law and Policy Tracker

The International Association of Privacy Professionals maintains a global tracker covering federal, state, and international AI legislation, with status and effective-date context. **Go here when:** you need a broad summary of where active AI bills stand across the US and major foreign jurisdictions.

URL: https://iapp.org/resources/article/global-ai-legislation-tracker/

### NCSL — Artificial Intelligence: 2025 Legislation

The National Conference of State Legislatures publishes an AI legislation database, organized by topic such as government use, healthcare, responsible use, discrimination, and private-sector use. It is a strong state-government source. **Go here when:** you need a state-by-state cut of bills with status and short summaries.

URL: https://www.ncsl.org/financial-services/artificial-intelligence-legislation-database

### Multistate.ai — AI bills database

A searchable database of state-level AI bills, with bill text, sponsors, and committee status. **Go here when:** you need full bill text and you don't yet know which state(s) are introducing similar language.

URL: https://www.multistate.ai/

> **Don't trust any single tracker.** Cross-check at least two of the above whenever you're about to cite a specific law in a memo. Trackers occasionally lag behind real signings, especially in states that don't electronically publish to a stable URL.

## The "what applies to us" checklist

Most agencies don't need to track every state's AI law. They need to know which laws apply to them and what each one requires that they aren't already doing. The checklist below organizes that analysis around six durable questions.

### 1. Are we in scope of a state-level AI act?

Several jurisdictions have material AI laws or AI-specific obligations to monitor as of April 30, 2026. Verify current status before relying on this table:

| Jurisdiction  | Law or policy                         | Status to verify                                          | Public-agency relevance                                                       | Headline obligation                                                              |
| ------------- | ------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Colorado      | Colorado AI Act (SB 24-205, delayed by SB25B-004) | Requirements delayed to June 30, 2026 by SB25B-004 | Relevant where public agencies deploy covered high-risk AI                     | Risk management program, impact assessments, consumer notices                    |
| Texas         | TRAIGA (HB 149)                       | Effective January 1, 2026 per Texas Legislature reports   | Relevant for specific governmental-entity provisions and consumer interactions | Disclosure to constituents, prohibited social scoring, biometric limits, AG enforcement |
| California    | SB 942 (AI transparency)              | Effective January 1, 2026 for covered providers/licensees | Mostly indirect for agencies that procure or use covered generative AI systems | Detection tools and content-provenance disclosures from covered providers        |
| New York City | Local Law 144                         | In force for automated employment decision tools          | Relevant for covered hiring tools                                             | Bias audit + notice for automated employment decision tools                      |
| Federal       | OMB M-25-21 + OMB M-25-22             | April 2025 memoranda                                      | Covered federal agencies directly; state/local agencies only if incorporated by grant, contract, state policy, or local rule | Chief AI Officer, use case inventory, high-impact AI practices, federal acquisition controls |

**Action for your agency:**

- [ ] Identify which of the above is in force in your jurisdiction (or has been adopted by reference in your statewide IT policy)
- [ ] Confirm the law's "public agency" scope language applies to _your_ agency (state vs local vs special district matters)
- [ ] Note the effective date and pre-effective compliance milestones (some laws require notice 90+ days before deployment)
- [ ] Re-check this list every 90 days, using one of the maintained trackers above

### 2. Do any of our use cases meet the "high-risk" or "consequential" threshold?

Most modern AI laws apply only when AI affects employment, housing, credit, education, healthcare, government benefits, criminal justice, or insurance. The playbook's [Risk Tier Determination](/phase-1-governance/risk-classification/) framework was designed to map cleanly onto these statutory thresholds.

**Action:**

- [ ] Run the [Risk Tier Determination](/phase-1-governance/risk-classification/) on every AI use case in your inventory
- [ ] For any use case classified Tier 3, double-check whether the use also fits the statutory definition of "high-risk" or "consequential decision" in your jurisdiction (the statutory language is usually narrower than Tier 3, but where the statute is broader, the statute wins)
- [ ] Document the classification and the statutory match in the use case's row of your AI inventory

### 3. Have we adopted the M-25-21 / M-25-22 controls (or our state's equivalent)?

M-25-21 (April 2025) supersedes M-24-10 from the prior administration. M-25-22 supersedes M-24-18. These memoranda bind covered federal agencies directly. For state and local agencies, treat them as useful reference models unless a grant, contract, state policy, or local rule incorporates them. The four headline controls worth mapping are:

| Control                                                 | Where in the playbook                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Designate a Chief AI Officer (or Agency AI Official)    | [Review committee charter](/phase-1-governance/review-committee/)                                                                                 |
| Maintain a public AI use case inventory                 | The use-case inventory column in [Risk Classification](/phase-1-governance/risk-classification/)                                                  |
| Risk management plan for high-impact AI                 | The Tier 3 obligations in [Risk Classification](/phase-1-governance/risk-classification/) + the [AUP](/phase-1-governance/acceptable-use-policy/) |
| Public notice and contestation pathway for impactful AI | Tier 3 disclosure list + [legislative compliance](/phase-1-governance/legislative-compliance/) page                                               |

**Action:**

- [ ] Map each control to the existing artifact in your agency. Where it's missing, open a remediation ticket against the linked playbook section.

### 4. Where do procurement contracts need AI-specific language?

Most AI laws place obligations on the _deploying_ agency, but the cleanest way for an agency to meet those obligations is to push them into the vendor contract. The playbook's [Procurement Addendum](/phase-1-governance/procurement-guardrails/) has three sections (A, B, C) calibrated to risk tier.

**Action:**

- [ ] Identify every active vendor contract that touches AI (including renewals where the vendor recently added AI features)
- [ ] For each, confirm the appropriate addendum section is signed (A for Tier 1, A+B for Tier 2, A+B+C for Tier 3)
- [ ] Add a calendar reminder for each contract's renewal date so the addendum gets re-evaluated against current law

### 5. Are we ready to answer a public records request about AI?

A growing share of public records requests now ask specifically about AI use, vendor contracts, decision logs, and bias audits. Your records-management policy may not yet anticipate this.

**Action:**

- [ ] Confirm AI decision logs are retained per the schedule in the [AUP](/phase-1-governance/acceptable-use-policy/) (30 days Tier 1 / 1 year Tier 2 / 7 years Tier 3 by default; adjust to your records schedule)
- [ ] Confirm vendor contracts and addenda are retained as standard contract records
- [ ] Confirm bias audit reports (where required) are retained as agency reports; these are _especially_ prone to being kept only by the vendor, which creates a public-records gap

### 6. Who tells us when the law changes?

The single most common compliance failure is not the law being missed; it's the law being missed _six months after it was already on the books_. Decide, in writing, who in your agency owns this.

**Action:**

- [ ] Designate one named person (typically the Agency AI Official, the privacy officer, or the deputy attorney general's representative) as the "law-watch" owner
- [ ] That person commits to reviewing IAPP / NCSL / Multistate every 90 days and reporting changes to the AI Review Committee
- [ ] The 90-day review is a standing agenda item on the Review Committee meeting

## Quarterly review checklist

Use this short list at the start of every Review Committee meeting that includes a legislative-update agenda item.

- [ ] Any new state-level AI law signed since last review? (IAPP / NCSL)
- [ ] Any change in effective date for laws we're already tracking?
- [ ] Any of our use cases newly in scope of a law (e.g., a Tier 2 use case re-classified to Tier 3)?
- [ ] Any vendor contract whose AI feature set materially changed (which can move it into a stricter section of the addendum)?
- [ ] Any pending federal guidance that's likely to be adopted by reference in our state?
- [ ] Any public records request received in the last 90 days that pointed at AI specifically?

## See also

- [Frameworks Cited](/resources/frameworks-cited/): versioned references for NIST AI RMF, OMB M-25-21 (formerly M-24-10), OMB M-25-22 (formerly M-24-18), SLSA, SPACE
- [Legislative compliance (Phase 1)](/phase-1-governance/legislative-compliance/): the per-state compliance matrix that lives next to the Phase 1 governance content
- [Procurement guardrails](/phase-1-governance/procurement-guardrails/): the contract addendum referenced above

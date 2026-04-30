---
title: AI Procurement Guardrails
description: Contract clauses, vendor questionnaires, and red flags informed by federal guidance and adapted for state and local procurement.
sidebar:
  order: 5
---

Most agency AI exposure is purchased, not built. By the time IT sees a vendor demo, procurement has often already begun, and the contract on offer was drafted by the vendor's lawyers. This page gives you the addendum, the questionnaire, and the red flags so the contract is rewritten before signature, not after the first incident.

> **Use this as a default starting position.** Procurement guardrails are a core Phase 1 control for AI-bearing purchases, but these exact clauses are model language, not universal legal requirements. Federal agencies must follow applicable federal acquisition policy. State and local agencies should adapt this language to their own procurement rules, grant conditions, and counsel's direction.

## How this page scales for your agency

| Path | Minimum useful version | Add when capacity exists |
| --- | --- | --- |
| Small / no IT department | Ask the ten vendor questions before any AI purchase, prohibit sensitive data in unapproved tools, and attach a short data non-use / deletion / incident notice rider when possible | Use a shared purchasing cooperative rider or counsel-approved addendum for renewals |
| Medium | Attach Sections A and B to AI-bearing SaaS, route Tier-2 and Tier-3 purchases through the Review Committee, and keep vendor answers with the contract file | Add renewal reviews and a scoring penalty for vendors that materially edit the addendum |
| Large | Maintain standard AI clauses, privacy/security schedules, audit rights, and high-impact riders by tier | Add model/version change controls, independent testing rights, and federal LLM procurement requirements where applicable |

## What changed in 2025

OMB Memorandum **M-25-22** ("Driving Efficient Acquisition of Artificial Intelligence in Government") replaced the earlier federal AI procurement guidance. It is binding for covered federal agencies and useful as a reference model for state and local buyers, especially around cross-functional review, privacy, IP/data rights, lock-in reduction, testing, documentation, and monitoring.

State laws including **Texas TRAIGA** and **Colorado SB24-205** add notice, high-risk AI, biometric, and accountability concerns that procurement can help operationalize. Federal LLM procurement also changed after EO 14319 and OMB M-26-04, which add truth-seeking and ideological-neutrality expectations for federal LLM contracts. Agencies that are not directly covered can treat those federal LLM requirements as reference points unless their own law, grant, or contract incorporates them.

## The AI Procurement Addendum

Use this addendum for contracts under which a vendor will provide AI services or AI-bearing software, including no-cost trials and click-through SaaS that touch agency data. If you cannot attach the whole addendum, start with the vendor questionnaire and the Section A data terms.

> Treat the addendum as your default negotiating position. Vendor refusals are not automatic disqualifiers for every small purchase, but they should be documented and reviewed before agency data is exposed.

### Section A — Starter clauses (all tiers)

| Clause                                     | What it requires                                                                                                                         | Why                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Data non-use for training**              | Agency data shall not be used to train, fine-tune, or improve public or commercial models, including derivative or aggregated forms, without explicit written approval | M-25-22 requires federal agencies to address government data use; state/local agencies should make this explicit |
| **Data residency and sovereignty**         | Agency data shall be processed and stored in {{Required Region}} and shall not be transferred to {{Excluded Jurisdictions}} where required by law, policy, grant, or risk tier | Some data classes have location or transfer limits; other agencies can use this clause when needed |
| **Sub-processor disclosure**               | Vendor shall maintain and disclose a current list of sub-processors with access to agency data; agency may object to a sub-processor     | LLM vendors frequently route through 3+ sub-processors                         |
| **Data deletion on termination**           | Agency data and any derivatives shall be deleted within 30 days of contract termination, with written attestation                        | Many vendors retain "for up to 90 days" by default; tighten this               |
| **Security baseline**                      | Vendor shall maintain at minimum {{FedRAMP Moderate / SOC 2 Type II / StateRAMP Moderate}} certification for systems holding agency data | Anchor the security floor to a recognized standard                             |
| **Incident notification**                  | Vendor shall notify agency in writing within {{Incident Notice Window, e.g., 72 hours}} of any security or privacy incident affecting agency data | Match state breach law, grant terms, and agency policy                         |
| **Cooperation with public-records / FOIA** | Vendor shall cooperate with agency to identify and produce records held by the vendor that are subject to public-records law             | Cloud / SaaS records are routinely missed in PRA / FOIA responses              |
| **Termination for non-compliance**         | Agency may terminate without penalty for material breach of any clause in this Addendum, including any clause Section B or C             | Gives the agency real leverage when a vendor's practices change post-signature |

### Section B — Tier-2 and above, when proportionate

| Clause                                    | What it requires                                                                                                                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Model and version disclosure**          | Vendor shall identify the model(s) used (including base model, fine-tuning method, version) and notify the agency in writing 30 days before any material model change               |
| **Decision logging**                      | Where proportionate to the tier, the vendor shall log inputs, model version, output, timestamp, and user/action context; logs are agency property and exportable                    |
| **Hallucination / error rate disclosure** | Vendor shall provide documented error rates, evaluation methodology, and known failure modes relevant to the agency's use case                                                      |
| **Human-in-the-loop attestation**         | Vendor shall not represent or imply that staff using the system are absolved of human review responsibility                                                                         |
| **Sanctions / export-control / excluded-party screen** | No model used to serve agency data shall be hosted by, fine-tuned by, or routed through a vendor, sub-processor, or jurisdiction excluded by {{Applicable Sanctions, Entity, Export-Control, Grant, or State Procurement Reference}} |
| **Federal LLM procurement add-on, where applicable** | For federal LLM contracts, vendor shall provide documentation needed to evaluate truth-seeking and ideological-neutrality expectations under EO 14319 / OMB M-26-04 |

### Section C — Tier-3 / high-impact uses

| Clause                                     | What it requires                                                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bias and disparate-impact testing**      | Vendor shall conduct or cooperate with bias testing where the use case affects employment, benefits, enforcement, housing, health, education, or another protected domain, using methodology approved by the agency |
| **Algorithmic accountability cooperation** | Vendor shall cooperate in any algorithmic accountability or impact assessment required by applicable state or local law (e.g., Colorado AI Act)          |
| **Audit access**                           | Agency or its independent auditor shall have read access to model evaluation results, training-data documentation, and decision logs                     |
| **Public-notice cooperation**              | Vendor shall provide plain-language descriptions of model behavior suitable for inclusion in the agency's public notice                                  |
| **Contestation cooperation**               | When a person contests an AI-driven decision, vendor shall provide the inputs, model version, output, and any human review notes within {{Response SLA}} |
| **Indemnification for IP and bias claims** | Vendor shall indemnify agency for third-party claims arising from training-data IP infringement or documented disparate impact in vendor models          |

## The vendor questionnaire (pre-RFP)

Send this questionnaire before you write the RFP. Answers expose vendors that are not ready to serve government, before you commit procurement time.

1. **Model identity.** What base models do you use (provider, version)? Do you fine-tune? On what data?
2. **Data residency.** Where (region, country) is agency data processed and stored? Who are your sub-processors?
3. **Training-data status.** Is agency data ever used, in any form, to train, evaluate, fine-tune, or improve any model, yours or a third party's? If so, can it be opted out?
4. **Logs and exports.** Are decision logs available to the agency? In what format? Can they be exported on demand and on termination?
5. **Hallucination rate.** What is the documented error rate of this system on tasks similar to ours? How was it measured?
6. **Bias testing.** Have you tested for disparate impact on protected classes for this use case? On what dataset? Will you share the methodology and results?
7. **Security certification.** What recognized certification do you maintain (FedRAMP, StateRAMP, SOC 2)? At what level?
8. **Incident history.** Have you experienced a security or privacy incident affecting government customers in the past 36 months? What was the response?
9. **Sanctions, export-control, and jurisdictional risk.** Disclose all sub-processors, hosting providers, model providers, and data-processing locations that could trigger {{Applicable Sanctions, Entity, Export-Control, Grant, or State Procurement Reference}}.
10. **References.** Identify three current government customers operating at our scale or larger. May we contact them?

A vendor that cannot answer 1–3 in writing should not handle agency or sensitive data until the gap is resolved.

## Red flags

- The contract says "may use de-identified or aggregated data to improve services." That may still create training-use, reidentification, records, or confidentiality risk; require explicit agency approval.
- The vendor demo uses public data ("we'll just use this Wikipedia article") and pivots to "of course it'll work on your data" without specifying tenant or data-handling.
- The vendor refuses to identify sub-processors, citing competitive sensitivity.
- The vendor's security questionnaire response is "we are SOC 2 compliant" without specifying type, scope, or certification body.
- The vendor markets the product as "no human-in-the-loop required" or "fully automated decision-making" for what is plainly a Tier-3 use case.
- The vendor's terms include unilateral right to amend with 30 days' notice. (Common in click-through SaaS; unacceptable for government.)
- The vendor will not cooperate with public-records requests, citing trade-secret protection.
- The pricing is per-API-call with no agency-side rate-limiting controls. (Cost surprises follow.)
- The vendor's contact list for incident response is generic ("support@") rather than a named accountable engineer.

## Procurement workflow

1. **Department identifies a need** and submits the AI use-case intake (Phase 2 deliverable).
2. **Tier classification** by the Review Committee determines which clauses apply (A, A+B, or A+B+C).
3. **Pre-RFP vendor questionnaire** sent to candidate vendors. Disqualifying answers are documented.
4. **RFP issued** with the AI Procurement Addendum attached and required by reference.
5. **Vendor responses reviewed** for Addendum acceptance. Refusals or material edits should be documented and can be a scoring criterion where procurement rules allow.
6. **Contract drafted** with the Addendum incorporated as Schedule {{Schedule Letter}}; conflicts in vendor terms resolved in favor of the Addendum.
7. **Legal and Review Committee sign-off** before procurement signature.
8. **Renewal review.** Addendum is re-reviewed at every renewal; pricing changes alone do not extend a non-compliant contract.

## Special cases

### No-cost pilots and free trials

Vendors will sometimes offer a no-cost pilot to bypass procurement review. Treat any pilot that touches agency data as a contract; the addendum applies. A pilot with no addendum becomes a precedent that is harder to undo than the original purchase.

### Click-through SaaS

Staff signing up for a free SaaS tool with their work email can create a contract under the click-through terms. Where you have IT controls, block click-through purchases of AI-bearing tools at the policy level (DNS, single-sign-on, expense reimbursement). Where you do not, make the rule simple: no agency or sensitive data in unapproved tools, and bring useful tools to the AI owner for review.

### Cooperative purchasing

When buying off a state or NASPO cooperative agreement, verify that the cooperative's master contract includes the addendum or equivalent. If not, the agency-level addendum still applies and is presented as a rider to the cooperative purchase order.

### Bundled software with embedded AI

A traditional SaaS suite that adds AI features mid-contract still triggers the addendum the moment those features are enabled on agency data. Procurement and IT must monitor renewals and feature flags for this.

## What you ship from this page

- Adopted AI Procurement Addendum (Sections A, B, C) attached to your standard contract template
- Pre-RFP vendor questionnaire in your procurement library
- Red-flag checklist used by procurement and legal before signature
- A workflow that ties tier classification to which clauses apply, with a smaller Section A-only path for low-risk small purchases

## Related

- [Risk Classification Matrix](/phase-1-governance/risk-classification/): drives which addendum sections apply
- [AI Acceptable Use Policy](/phase-1-governance/acceptable-use-policy/): Section 8 references this addendum
- [Review Committee Charter](/phase-1-governance/review-committee/): committee reviews vendor offerings before procurement signs

## References

- OMB M-25-22, Driving Efficient Acquisition of Artificial Intelligence in Government (April 2025; supersedes M-24-18; binding for covered federal agencies and useful for state/local procurement design)
- OMB M-25-21, Accelerating Federal Use of AI through Innovation, Governance, and Public Trust (April 2025; supersedes M-24-10)
- EO 14319 and OMB M-26-04 (federal LLM procurement guidance)
- NIST AI RMF Govern, Map, Measure, and Manage functions; supplier and third-party risk considerations
- Texas TRAIGA, Colorado SB24-205, California SB 942, California AB 2013
- StateRAMP and FedRAMP authorization registries
- GSA AI Acquisition Resource Hub

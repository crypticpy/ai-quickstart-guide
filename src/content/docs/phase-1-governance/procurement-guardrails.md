---
title: AI Procurement Guardrails
description: Contract clauses, vendor questionnaires, and red flags aligned with OMB M-25-22 — adapted for state and local procurement.
sidebar:
  order: 5
---

Most agency AI exposure is purchased, not built. By the time IT sees a vendor demo, procurement has often already begun, and the contract on offer was drafted by the vendor's lawyers. This page gives you the addendum, the questionnaire, and the red flags so the contract is rewritten before signature, not after the first incident.

## What changed in 2025

OMB Memorandum **M-25-22** ("Driving Efficient Acquisition of Artificial Intelligence in Government") replaced the earlier procurement guidance and is the controlling federal reference for federally-funded AI acquisitions. State laws including **Texas TRAIGA** and **Colorado SB24-205** added additional clauses around bias testing, decision logs, and consumer notice. Several states also bar vendors with foreign-adversary ties (per evolving federal entity lists).

Even if your acquisition is not federally funded, M-25-22's clause structure is the de-facto reference for U.S. government AI procurement. Adopting it now keeps you compatible with future federal pass-through funding.

## The AI Procurement Addendum

Attach this addendum to **every** contract under which a vendor will provide AI services or AI-bearing software, including no-cost trials and click-through SaaS. The addendum overrides any conflicting language in the vendor's standard agreement.

> Treat the addendum as non-negotiable. Vendors that refuse it are telling you something important about their data-handling practices.

### Section A — Always required (all tiers)

| Clause                                     | What it requires                                                                                                                         | Why                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Data non-use for training**              | Agency data shall not be used to train, fine-tune, or evaluate the vendor's models, including derivative or aggregated forms             | Default vendor terms often allow this; M-25-22 requires explicit opt-out       |
| **Data residency and sovereignty**         | Agency data shall be processed and stored in {{Required Region}} and shall not be transferred to {{Excluded Jurisdictions}}              | Some vendors route through prohibited regions by default                       |
| **Sub-processor disclosure**               | Vendor shall maintain and disclose a current list of sub-processors with access to agency data; agency may object to a sub-processor     | LLM vendors frequently route through 3+ sub-processors                         |
| **Data deletion on termination**           | Agency data and any derivatives shall be deleted within 30 days of contract termination, with written attestation                        | Many vendors retain "for up to 90 days" by default; tighten this               |
| **Security baseline**                      | Vendor shall maintain at minimum {{FedRAMP Moderate / SOC 2 Type II / StateRAMP Moderate}} certification for systems holding agency data | Anchor the security floor to a recognized standard                             |
| **Incident notification**                  | Vendor shall notify agency in writing within 72 hours of any security or privacy incident affecting agency data                          | Aligns with most state breach laws; tighter than vendor defaults               |
| **Cooperation with public-records / FOIA** | Vendor shall cooperate with agency to identify and produce records held by the vendor that are subject to public-records law             | Cloud / SaaS records are routinely missed in PRA / FOIA responses              |
| **Termination for non-compliance**         | Agency may terminate without penalty for material breach of any clause in this Addendum, including any clause Section B or C             | Gives the agency real leverage when a vendor's practices change post-signature |

### Section B — Tier-2 and above

| Clause                                    | What it requires                                                                                                                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Model and version disclosure**          | Vendor shall identify the model(s) used (including base model, fine-tuning method, version) and notify the agency in writing 30 days before any material model change               |
| **Decision logging**                      | For any AI-driven recommendation surfaced to staff, the vendor shall log inputs, model version, output, and timestamp; logs are agency property and exportable                      |
| **Hallucination / error rate disclosure** | Vendor shall provide documented error rates, evaluation methodology, and known failure modes relevant to the agency's use case                                                      |
| **Human-in-the-loop attestation**         | Vendor shall not represent or imply that staff using the system are absolved of human review responsibility                                                                         |
| **Foreign-adversary exclusion**           | No model used to serve agency data shall be hosted by, fine-tuned by, or routed through any vendor or sub-processor identified on the most recent {{Federal Entity List Reference}} |

### Section C — Tier-3 only

| Clause                                     | What it requires                                                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bias and disparate-impact testing**      | Vendor shall conduct or cooperate with bias testing on the use case prior to deployment and annually, using methodology approved by the agency           |
| **Algorithmic accountability cooperation** | Vendor shall cooperate in any algorithmic accountability or impact assessment required by applicable state or local law (e.g., Colorado AI Act)          |
| **Audit access**                           | Agency or its independent auditor shall have read access to model evaluation results, training-data documentation, and decision logs                     |
| **Public-notice cooperation**              | Vendor shall provide plain-language descriptions of model behavior suitable for inclusion in the agency's public notice                                  |
| **Contestation cooperation**               | When a person contests an AI-driven decision, vendor shall provide the inputs, model version, output, and any human review notes within {{Response SLA}} |
| **Indemnification for IP and bias claims** | Vendor shall indemnify agency for third-party claims arising from training-data IP infringement or documented disparate impact in vendor models          |

## The vendor questionnaire (pre-RFP)

Send this questionnaire before you write the RFP. Answers expose vendors that are not ready to serve government, before you commit procurement time.

1. **Model identity.** What base models do you use (provider, version)? Do you fine-tune? On what data?
2. **Data residency.** Where (region, country) is agency data processed and stored? Who are your sub-processors?
3. **Training-data status.** Is agency data ever used, in any form, to train, evaluate, fine-tune, or improve any model — yours or a third party's? If so, can it be opted out?
4. **Logs and exports.** Are decision logs available to the agency? In what format? Can they be exported on demand and on termination?
5. **Hallucination rate.** What is the documented error rate of this system on tasks similar to ours? How was it measured?
6. **Bias testing.** Have you tested for disparate impact on protected classes for this use case? On what dataset? Will you share the methodology and results?
7. **Security certification.** What recognized certification do you maintain (FedRAMP, StateRAMP, SOC 2)? At what level?
8. **Incident history.** Have you experienced a security or privacy incident affecting government customers in the past 36 months? What was the response?
9. **Foreign-adversary risk.** Disclose all sub-processors, hosting providers, and model providers headquartered in or controlled from {{Excluded Jurisdictions}}.
10. **References.** Identify three current government customers operating at our scale or larger. May we contact them?

A vendor that cannot answer 1–3 in writing should not be in the procurement.

## Red flags

- The contract says "may use de-identified data to improve services." De-identification is reversible; this is a training-data opt-in by another name.
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
5. **Vendor responses reviewed** for Addendum acceptance. Refusals or material edits are themselves a scoring criterion.
6. **Contract drafted** with the Addendum incorporated as Schedule {{Schedule Letter}}; conflicts in vendor terms resolved in favor of the Addendum.
7. **Legal and Review Committee sign-off** before procurement signature.
8. **Renewal review** — Addendum is re-reviewed at every renewal; pricing changes alone do not extend a non-compliant contract.

## Special cases

### No-cost pilots and free trials

Vendors will sometimes offer a no-cost pilot to bypass procurement review. Treat any pilot that touches agency data as a contract — the addendum applies. A pilot with no addendum becomes a precedent that is harder to undo than the original purchase.

### Click-through SaaS

Staff signing up for a free SaaS tool with their work email _creates_ a contract under the click-through terms. Block click-through purchases of AI-bearing tools at the IT-policy level (DNS, single-sign-on, expense reimbursement). Provide a sanctioned alternative.

### Cooperative purchasing

When buying off a state or NASPO cooperative agreement, verify that the cooperative's master contract includes the addendum or equivalent. If not, the agency-level addendum still applies and is presented as a rider to the cooperative purchase order.

### Bundled software with embedded AI

A traditional SaaS suite that adds AI features mid-contract still triggers the addendum the moment those features are enabled on agency data. Procurement and IT must monitor renewals and feature flags for this.

## What you ship from this page

- Adopted AI Procurement Addendum (Sections A, B, C) attached to your standard contract template
- Pre-RFP vendor questionnaire in your procurement library
- Red-flag checklist used by procurement and legal before signature
- A workflow that ties tier classification to which clauses apply

## Related

- [Risk Classification Matrix](/phase-1-governance/risk-classification/) — drives which addendum sections apply
- [AI Acceptable Use Policy](/phase-1-governance/acceptable-use-policy/) — Section 8 references this addendum
- [Review Committee Charter](/phase-1-governance/review-committee/) — committee reviews vendor offerings before procurement signs

## References

- OMB M-25-22 — Driving Efficient Acquisition of Artificial Intelligence in Government (controlling federal reference)
- OMB M-24-10 — Advancing Governance, Innovation, and Risk Management for Agency Use of AI
- NIST AI RMF — Acquire / Procure subcategories
- Texas TRAIGA, Colorado SB24-205, California SB 942
- StateRAMP and FedRAMP authorization registries
- GSA AI Acquisition Resource Hub

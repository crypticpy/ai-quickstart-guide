---
title: "Session 3.4 — AI Procurement Guardrails"
description: 90-minute working session that produces the agency's draft AI Procurement Addendum for vendor RFPs and contracts.
sidebar:
  order: 4
---

Session 3.4 produces the contractual instrument that lets the agency procure AI safely. Without it, every vendor contract is negotiated from scratch, which slows procurement and creates inconsistent terms across the agency. With it, vendors know what to expect and procurement staff have standard language to defend.

## Deliverable produced

A draft AI Procurement Addendum (Sections A, B, C) ready for legal review, plus a vendor questionnaire that screens AI vendors before they reach formal procurement.

## Audience and prerequisites

Same Track 3 audience plus the agency's chief procurement officer or designee. Sessions 3.1–3.3 should be complete.

## Pre-work

- Read the [Procurement Guardrails](/phase-1-governance/procurement-guardrails/) page in full.
- Procurement officer brings the agency's standard contract boilerplate for cross-reference.
- General Counsel attends or pre-comments on the model addendum language.

## Materials

- Phase 1 procurement addendum template (Sections A/B/C).
- Vendor questionnaire template.
- Agency's existing IT contract boilerplate.
- The ratified tier matrix and AUP from Sessions 3.1 and 3.2.

## 15-minute context-setting

The addendum has three sections, each tied to a tier:

- **Section A** — applies to all AI procurement (any tier). Data non-use, data residency, exit, basic security.
- **Section B** — additional terms for Tier-2 use cases. Pilot phase, evaluation rights, model substitution notice, price cap.
- **Section C** — additional terms for Tier-3 use cases. Bias testing, audit access, indemnification, explainability requirements.

A vendor selling into a Tier-3 use case signs A + B + C. A Tier-2 vendor signs A + B. A Tier-1 vendor signs A.

## 60-minute working session

### Block A — Section A: universal terms (20 min)

Walk through Section A clause by clause. The room confirms or modifies:

- **Data non-use.** The vendor will not use agency data for model training, fine-tuning, evaluation, or any purpose other than serving the agency. Strict.
- **Data residency.** Where the data and inference happen. Most agencies require U.S. residency at minimum; some require state residency for specific data types.
- **Foreign-adversary model exclusion.** No models trained primarily by entities in countries on the relevant federal restricted list (or state equivalent).
- **Exit and data export.** On termination, the vendor returns agency data in plain, non-proprietary format within 30 days. Embeddings and indices either deleted or returned in documented format.
- **Security baseline.** Standard agency contract security clauses extended for AI specifics.

Open issues for legal review get parked with named owners.

### Block B — Section B: Tier-2 terms (15 min)

- **Pilot phase mandate.** Tier-2 deployment requires a pilot scope (typically 4–8 weeks, named users, named success metrics) before broad rollout.
- **Evaluation rights.** The agency may evaluate the vendor's outputs against agency-defined test cases at any time. The vendor will provide test access at no additional cost.
- **Model substitution notice.** The vendor notifies the agency at least 30 days before swapping the underlying foundation model and provides re-evaluation access.
- **Price cap.** Year-2 price uplift capped (typically 15–25% above Year-1) or the agency may exit without penalty.
- **Decision logs.** The vendor provides decision logs in the agency's records-schedule format with retention per agency requirements.

### Block C — Section C: Tier-3 terms (15 min)

- **Bias testing rider.** The vendor cooperates with pre-deployment bias testing using agency-supplied test sets. Bias-test results are shared with the Review Committee.
- **Audit access.** The agency or its designated auditor has access to model documentation, training data summaries (where available), and operational logs.
- **Explainability.** The vendor provides explainability for each individual decision (or output) in a form the affected person could understand if they contested the decision.
- **Indemnification.** The vendor indemnifies the agency for harm caused by AI bias or specific failure modes covered by the contract — within reasonable bounds, calibrated to the agency's risk appetite. (Vendors will resist; this is a negotiation point.)
- **Records sovereignty.** Agency-generated content remains agency property. The vendor cannot use it for promotional or research purposes without written permission.

### Block D — Vendor questionnaire (10 min)

A pre-procurement screening questionnaire that vendors complete before formal RFP. The questionnaire surfaces deal-breakers early. Build a v0.1 in the room covering:

- What foundation models do you use? Where are they hosted?
- How do you handle data non-use?
- What's your incident response process for model errors or biased outputs?
- Provide three peer-agency references for similar use cases.
- What's the exit cost and timeline?

The questionnaire is often the single highest-leverage governance instrument — vendors who can't answer it don't move forward, saving weeks of procurement time.

## 15-minute ratification

Facilitator reads back the addendum edits and the questionnaire. The output is:

- A clean v0.1 draft of the Procurement Addendum (Sections A/B/C).
- A v0.1 vendor questionnaire ready to attach to RFPs.
- A list of named open items for legal review.
- A target date for chief procurement officer ratification (typically 4 weeks out).

## Common questions and how to handle them

- **"Vendors will refuse these terms."** Some will. Most major Tier-2 vendors have already signed equivalent terms with peer agencies — the addendum is closer to industry standard than vendors will initially claim. The agency can hold position on Section A clauses; Section B and C are negotiation surface.
- **"What about open-source models?"** The addendum applies whether the vendor provides a managed model, an open-source model, or a custom fine-tune. The clauses are about the vendor's commitments, not the model.
- **"Can a vendor sign the addendum and ignore it?"** The contract creates the right to audit and exit. Enforcement requires the agency to actually use those rights. Build the audit cadence into the Review Committee's annual schedule.
- **"What if the existing contract doesn't have any of this?"** When the contract comes up for renewal, attach the addendum. Mid-contract amendments are possible but slower.

## Related

- [Procurement Guardrails](/phase-1-governance/procurement-guardrails/) — source page and full template
- [Session 3.5 — Legislative Compliance Navigator](/phase-2-education/track-3-governance/session-3-5/) — the final session

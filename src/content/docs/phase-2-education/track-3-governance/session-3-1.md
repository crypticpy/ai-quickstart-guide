---
title: "Session 3.1 — AI Risk Tiering Workshop"
description: 90-minute working session that produces the agency-specific draft risk classification matrix.
sidebar:
  order: 1
---

The first Track 3 session is the foundation for the rest. The risk classification matrix is referenced by the AUP, the Review Committee charter, and the procurement addendum — the next three sessions all assume an agreed-upon tier framework. Get this one right and the rest follow quickly.

## Deliverable produced

A draft 3-tier risk classification matrix, customized with the agency's name and a starter set of 8–10 use cases classified by tier. Ready for legal review and committee ratification.

## Audience and prerequisites

- AI Review Committee members or designees: CIO/CISO, legal, HR, equity officer, rotating program owner.
- Pre-read: the [Risk Classification](/phase-1-governance/risk-classification/) page in full.
- Pre-work: each attendee brings 1–2 candidate use cases from their domain to classify in the session.

## Materials

- The Phase 1 risk classification matrix as a printable / editable doc.
- The interactive [Risk Tier Picker](/phase-1-governance/risk-classification/) projected for live use.
- Each attendee's candidate use cases, written down ahead of time.
- Whiteboard or shared editable document for the agency-specific examples table.

## 15-minute context-setting

The facilitator walks the matrix dimensions in 5 minutes:

- Rights / benefits / safety
- Reversibility
- Data sensitivity
- Audience
- Automation level

Then the rule of thumb: if a real person can lose a benefit, a job, custody, housing, freedom, or money because of the AI's output — or because a staff member followed an AI recommendation without independent verification — it's High.

10 minutes of Q&A on the matrix definitions before opening the working portion.

## 60-minute working session

### Block A — Classify the candidates (30 min)

Each attendee presents one candidate use case from their domain in 60 seconds. The room runs the [Risk Tier Picker](/phase-1-governance/risk-classification/) live for each, projected on the wall. The picker proposes a tier; the room confirms, escalates, or — rarely — drops.

Capture **dissent** on the tier in writing. If two attendees disagree on a tier, both views and the rationale for the final call go into the matrix.

The output is a starter table of 8–10 classified use cases that are real to the agency. This is more credible than the generic 15 examples on the Phase 1 page.

### Block B — Identify edge cases (15 min)

Three structured prompts:

1. **What does our agency do that doesn't fit cleanly into the tiers?** Hospitals, courts, schools, and police departments often have categories that benefit from a custom note. Capture these and decide if a written addendum is needed.
2. **What's the right Tier-3 trigger for our agency?** The matrix says "rights, benefits, safety, employment, liberty." Are there agency-specific categories — child welfare cases, parole-board work, eligibility determinations — that should be named explicitly?
3. **What current operations would re-tier under this matrix?** If existing tools deployed before the matrix existed would now classify as Tier-2 or Tier-3, name them. They become the first Review Committee retrospective items.

### Block C — Ratify the matrix (15 min)

The facilitator reads back the agency-specific edits to the matrix. The room confirms each. The output is a clean v1 of:

- The matrix table.
- The agency-specific use case examples (8–10).
- Any agency-specific tier triggers (e.g., "parole-board work is always Tier 3").
- Documented dissent on classifications where it exists.

## 15-minute ratification

The facilitator stamps the version (e.g., "v0.1 — 2026-04-29 working session") and saves to the governance repository. The next steps are:

- General Counsel review (typically 5–10 business days).
- AI Review Committee adoption at the next standing meeting.
- Distribution to department heads as the working classification framework.

The matrix becomes the reference for Sessions 3.2–3.5.

## Common questions and how to handle them

- **"What if a use case is borderline between two tiers?"** Default up. The cost of treating a Tier-1 as Tier-2 is one extra committee discussion. The cost of treating a Tier-2 as Tier-1 is an unreviewed deployment.
- **"Can we add a fourth tier for the truly trivial?"** Almost never worth it. The five-tier matrices in the literature collapse in practice. Keep three.
- **"What if a use case spans multiple tiers depending on use?"** Tier is **per use case**, not per tool. The same vendor LLM can host a Tier-1 meeting summarizer and a Tier-3 eligibility tool. Document each use case separately.
- **"Who owns updating the matrix?"** The Review Committee, with annual review. Major updates require Approving Body ratification (per the [charter](/phase-1-governance/review-committee/)).

## Related

- [Risk Classification](/phase-1-governance/risk-classification/) — the source matrix
- [Risk Tier Picker](/phase-1-governance/risk-classification/) — used live in Block A
- [Session 3.2 — Drafting the AUP](/phase-2-education/track-3-governance/session-3-2/) — depends on this session's output

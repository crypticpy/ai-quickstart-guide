---
title: "Briefing 2.3 — Build vs. Buy vs. Partner"
description: 60-minute briefing on evaluating vendor proposals, understanding lock-in, and choosing the right mix of internal build, vendor purchase, and partnership for Year 1.
sidebar:
  order: 3
---

By Month 3, the agency will have received at least a half-dozen vendor pitches and likely a few unsolicited calls about partnerships with universities, state consortia, or sister jurisdictions. This briefing gives executives a structured framework for evaluating those, including the lock-in and exit costs vendors do not typically surface.

## Audience and prerequisites

Track 2 audience. Briefings 2.1 and 2.2 strongly recommended.

## Decision prompt

> **What's our build / buy / partner mix for Year 1?**

A specific allocation: how many use cases (or what percentage of the AI budget) is built internally, purchased from vendors, or pursued through partnerships. The answer is rarely 100% in any single column.

## Pre-read (5 min)

- The current vendor pitch list (1 line per vendor).
- A summary of agency engineering capacity (FTE count, current backlog, AI-relevant skills).
- A list of available partnerships (peer agencies, universities, state IT shared services).

## 30-minute substance

### Topic 1 — When to build (5 min)

Build internally when:

- The use case is core to agency mission (eligibility scoring, case management) and the agency has the engineering capacity.
- A vendor can't satisfy data sovereignty, residency, or audit requirements.
- The use case is small enough to ship in 4–8 weeks with internal staff.

Do **not** build when:

- The agency has 1–4 IT staff and they are already over-allocated.
- The use case is generic (drafting, summarization, transcription) and a Tier-2 vendor with appropriate contractual controls is available.
- Building would require hiring AI specialists at salaries the agency cannot competitively offer.

### Topic 2 — When to buy (10 min)

Buy when:

- The use case is generic (productivity, drafting, search across a vendor-provided corpus).
- A Tier-2 vendor has been validated by peer agencies and signs the [AI Procurement Addendum](/phase-1-governance/procurement-guardrails/).
- The agency does not have engineering capacity and can absorb the operational dependency.

Lock-in considerations the vendor does not surface:

- **Data export.** What format does the vendor return your data in? Plain markdown is good; proprietary embedding spaces are bad. Get the export clause in writing.
- **Model substitution.** What happens when the underlying foundation model is deprecated? Most vendors silently switch — cite the contractual right to be informed and to opt out.
- **Price uplift.** Year-2 license costs are commonly 20–40% above Year-1. Get the cap in writing or accept the surprise.
- **Termination cost.** What does it cost to leave? If the answer is "we lose all our data," the vendor is not Tier-2 ready.

The [Procurement Guardrails](/phase-1-governance/procurement-guardrails/) page lists the specific contractual clauses to insist on.

### Topic 3 — When to partner (10 min)

Partner when:

- A peer agency has solved the same problem and is willing to share. (State consortia, regional councils of government, or peer cities are the most common venue.)
- A university has research capacity matching the use case and is willing to do hands-on engagement, not just a research paper. (Most useful for evaluation, bias testing, and impact assessment — not for production code.)
- A state IT shared service offers an AI capability under a managed contract. (Common for translation, OCR, and standardized chatbot platforms.)

Partnership pitfalls:

- **Universities deliver papers, not code.** A research paper is not a production system. Confirm the deliverable is operational software, not a publication, before committing.
- **Peer agencies move at peer pace.** "We'll co-build this" rarely matches both agencies' priorities for a full year. Scope partnerships to specific phases (joint procurement, joint evaluation), not full implementation.
- **State shared services lag.** They may be cheaper but they may be six months behind the leading edge. For Tier-1 productivity work, that's fine. For Tier-3 work, it can be inappropriate.

### Topic 4 — Recommended mix (5 min)

For most agencies in Year 1:

- **70% buy.** Tier-1 productivity tools (drafting, summarization, basic RAG) from established Tier-2 vendors. This is the highest-ROI category.
- **20% partner.** Often translation, evaluation, or shared-service capabilities. Fast time-to-value with low engineering cost.
- **10% build.** One core use case where the agency has unique data, unique constraints, and engineering capacity to ship in 4–8 weeks. The "build" pick becomes the [Phase 6 starter project](/phase-6-starter-projects/).

Adjust the percentages by agency size:

- **Large (300+ IT staff).** More build (20–30%); the engineering capacity is real.
- **Small (1–4 IT staff).** Almost no build (0–5%). Skew partnerships up. Don't burn the IT team on AI plumbing they can buy.

## 20-minute structured discussion

1. **Walk the vendor list.** The room reviews each pitch for 60–90 seconds: keep, defer, decline. Most pitches should be defer or decline.
2. **Where are the unique-data plays?** Identify the 1–2 use cases where the agency has data nobody else has — that is where building (or a deeply-scoped partnership) makes the most sense.
3. **What's the partnership posture?** Decide whether the agency joins (or initiates) a peer cohort, signs onto a state shared-service agreement, or stays independent.

## 10-minute decision close

The chair states the build/buy/partner mix, by approximate percentage and by use case category. The decision is captured.

For each "build" pick, a sponsor is named. For each "buy" pick, a procurement lead is named. For each "partner" pick, a relationship owner is named.

## Common questions and how to handle them

- **"Can't we just buy and skip building?"** For most use cases, yes. But the agency loses the opportunity to develop internal AI capacity, and "all-buy" agencies typically pay 2–3× over five years versus a hybrid posture.
- **"Vendor X says they handle all the governance for us."** No vendor handles your governance. They may handle their data-handling and their model controls. The agency still owns tier classification, public notice, contestation, and incident response. Get this clear in the contract.
- **"What about open-source models?"** Open-source has a place — primarily in the build column for cost-sensitive or sovereignty-sensitive use cases. The operational cost of running open-source models in production (GPU infrastructure, inference latency, evaluation) is often higher than the closed-API alternative for agencies of typical size. Run the numbers.
- **"Should we be using AI to handle our procurement decisions?"** No. Vendor scoring with AI is a Tier-3 use case with documented bias risks (see Track 1 Session 1.2). It is not a Year-1 quick win.

## Materials

- 1-page pre-read.
- AI deck source markdown: [Download the deck source](/deck-sources/phase-2/track-2-leadership/briefing-2-3-build-buy-partner.md). Paste or upload it into your preferred AI presentation tool, then localize, verify, and brand the generated deck before use.
- A printable build / buy / partner decision matrix template.
- Decision capture template.

## Async fallback

- 10-minute recorded video.
- 1-page brief.
- Vendor evaluation worksheet.
- Office hour for the executive to walk through their specific vendor pitch list with the AI program lead.

## Related

- [Procurement Guardrails](/phase-1-governance/procurement-guardrails/) — the contractual framework that backs "buy" decisions
- [Briefing 2.4 — The 12-Month Roadmap](/phase-2-education/track-2-leadership/briefing-2-4/) — the next briefing, where the build/buy/partner mix becomes a roadmap
- [Phase 6 — Starter Projects](/phase-6-starter-projects/) — where the "build" pick lands

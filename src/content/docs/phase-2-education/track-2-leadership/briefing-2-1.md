---
title: "Briefing 2.1 — The AI Landscape: Hype vs. Reality"
description: 60-minute executive briefing on what's real, what's hype, and what AI actually costs over a year of operation.
sidebar:
  order: 1
---

The first executive briefing exists to recalibrate. Most directors and CIOs know AI is important. Most do not have a clear-eyed view of what AI costs to run, what genuinely works in government today, and which categories of vendor pitches to dismiss. This 60 minutes makes the difference between a budget conversation grounded in reality and one grounded in vendor decks.

## Audience and prerequisites

Department directors, CIOs, CTOs, deputy city managers, elected officials' staff. Track 1 Session 1.1 recommended but not required.

## Decision prompt

> **What's our AI budget ceiling for Year 1?**

A specific dollar figure, written down, signed off by the chair before the room leaves. The figure may be revisited at the next quarterly review, but a number on the page is the deliverable.

## Pre-read (5 minutes)

A one-page brief sent 48 hours before the briefing:

- One paragraph on the agency's current AI exposure (existing tools, shadow AI, vendor pitches in flight).
- A representative cost breakdown for a single moderate AI use case over 12 months.
- Three competitor / peer-jurisdiction examples with budget figures (cite source and year).

If executives walk in cold, the briefing burns half its time on Awareness work that should have happened beforehand.

## 30-minute substance

### Topic 1 — What's real today (10 min)

Three categories that are working in production at peer agencies, with one or two cited examples each:

- **Drafting and summarization.** Routine correspondence, meeting minutes, board briefings. The most consistent productivity gains come from this category and it is the lowest-risk to deploy.
- **Search and retrieval (RAG).** Searching across policy manuals, procurement codes, case files. High value when the corpus is well-managed; rapidly drops in value when the corpus is stale.
- **Triage and classification.** Routing constituent requests, prioritizing inspection queues, categorizing complaints. Good fit for high-volume, low-stakes routing decisions.

What is **not** working reliably yet, and which leadership should not fund in Year 1:

- Generalized "AI agents" autonomously executing multi-step decisions.
- Predictive scoring for high-stakes decisions (parole, child welfare, eligibility) — works in research, fails in deployment because of bias, drift, and anchoring.
- Voice / video deepfake detection at scale — currently asymmetric in attackers' favor.
- "Chatbot replaces our call center" — high vendor pitch density, low real-world success at agency scale.

### Topic 2 — What it actually costs (10 min)

A single moderate AI use case (RAG-powered policy search across 500 documents, 50 staff users, 12 months of operation):

| Cost line                                    | Year-1 estimate                          |
| -------------------------------------------- | ---------------------------------------- |
| LLM API usage (queries × tokens × price)     | $4,000–$12,000                           |
| Vector database / embedding storage          | $1,200–$3,000                            |
| Document ingestion + maintenance pipeline    | 0.1–0.2 FTE                              |
| Staff time for evaluation, monitoring, drift | 0.05–0.1 FTE                             |
| Procurement and legal review (one-time)      | $5,000–$15,000                           |
| Vendor or platform support contract          | $0–$25,000                               |
| **Approximate annual run rate**              | **$50,000–$120,000** (mostly staff time) |

Two key reframings:

1. **AI cost is mostly staff cost.** The line items that look small (FTE fractions) compound to the largest number. If executives think AI is "free with our cloud subscription," correct this directly.
2. **Year-2 cost is not Year-1 cost halved.** Operational AI tends to widen scope: more documents, more users, new edge cases. Plan for Year-2 to be 1.0–1.5× Year-1, not 0.5×.

### Topic 3 — Three quick wins, three long plays (10 min)

**Quick wins (4–6 month payback):**

- A drafting assistant in a high-volume drafting role (constituent emails, board minutes, standard correspondence).
- A RAG search over a single bounded corpus (the procurement code, the inspector's field manual, the agency's HR policy).
- Document data extraction in a high-volume intake flow (a permit application, a grant application).

**Long plays (12–24 month payback):**

- An internal AI platform (Phase 5 in this guide) — high ROI but takes 12+ months to compound.
- Cross-departmental AI orchestration — needs Phase 3 infrastructure, Phase 4 dev practices, and stable Phase 5 modules first.
- Public-facing chatbot or assistant — typically Tier-3, expensive to govern, slow to deploy responsibly.

The recommendation: **start with one quick win in Q1, ship it in Q2, use that visible success to fund the long plays.**

## 20-minute structured discussion

Three prompts, in order:

1. **Where is shadow AI happening today?** Most agencies have staff using consumer AI tools with sensitive data, against policy. Naming this is the start of the budget conversation.
2. **Which of the quick wins maps to a known operational pain point?** The room's answers become the candidate list for the Phase 6 starter project.
3. **What's the right budget posture for Year 1?** Discuss in absolute dollars, not percentages. The right number is rarely a round figure copied from another agency.

## 10-minute decision close

The chair states the decision in plain language, the AI program lead writes it on the board, and the room confirms.

Decision options the chair typically chooses among:

- **A specific dollar ceiling for Year 1**, with a named approver for any uplift.
- **A staged commitment**: Q1 = $X for governance + one quick win, Q2–Q4 contingent on Q1 progress against named milestones.
- **Defer to a follow-up** — only acceptable if a specific date and information dependency is named in writing.

The takeaway memo is drafted by the AI program lead within 48 hours, signed by the chair, distributed to the executive team and the AI Review Committee.

## Common questions and how to handle them

- **"Why isn't this just a line item in IT?"** Because the cost is mostly governance, training, and operations, not infrastructure. IT can host AI; only the agency can govern, train, and operate it. Budget needs to reflect that.
- **"Vendor X says they can do this for $20K."** Maybe. Ask: $20K covering what — license, support, monitoring, evaluation, integration, the staff time on our side? The full cost is rarely the license figure.
- **"What about the new state law?"** Refer to the [Legislative Compliance](/phase-1-governance/legislative-compliance/) page. The compliance posture affects which use cases are viable, not whether to invest at all.
- **"Why not wait a year for the technology to settle?"** Two answers. First, shadow AI is happening today; waiting institutionalizes a worse posture. Second, the technology is settling enough — what's still volatile is mostly the leading-edge capabilities, not the categories the agency would deploy.

## Materials

- 1-page pre-read.
- AI deck source markdown: [Download the deck source](/deck-sources/phase-2/track-2-leadership/briefing-2-1-ai-landscape-hype-vs-reality.md). Paste or upload it into your preferred AI presentation tool, then localize, verify, and brand the generated deck before use.
- One-page representative cost breakdown.
- Decision capture template (the takeaway memo format).

## Async fallback

- 10-minute recorded video covering Topics 1–3.
- 1-page brief delivered with a decision prompt card.
- 30-minute follow-up office hour for the executive to discuss with the program lead.

## Related

- [Track 2 overview](/phase-2-education/track-2-leadership/) — full track context
- [Briefing 2.2 — Governance as Enabler](/phase-2-education/track-2-leadership/briefing-2-2/) — the next briefing
- [Risk Classification](/phase-1-governance/risk-classification/) — the tier matrix referenced in the discussion

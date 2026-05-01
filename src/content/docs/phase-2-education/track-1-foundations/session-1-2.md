---
title: "Session 1.2 — AI in Government: Real Examples"
description: Eight case stations covering successes and failures of real government AI deployments, with risk and benefit ratings.
sidebar:
  order: 2
---

Session 1.1 introduced the categories. Session 1.2 grounds them in real deployments — what worked, what didn't, and what attendees can learn before their agency makes the same mistakes. The session uses a gallery-walk format so attendees move and discuss, not sit and listen.

## Learning objectives

By the end of this session, every attendee can:

1. Describe at least three real government AI deployments — including at least one that failed publicly.
2. Identify the risk category for each (privacy, bias, accuracy, transparency, accountability).
3. Explain — in their own words — why AI deployments cost real money and require ongoing operations, not one-time spending.

## Audience

Same as Session 1.1: all staff. Pre-requisite: Session 1.1.

## Materials

- AI deck source markdown: [Download the deck source](/deck-sources/phase-2/track-1-foundations/session-1-2-ai-in-government-real-examples.md). Paste or upload it into your preferred AI presentation tool, then localize, verify, and brand the generated deck before use.
- Eight printed case stations, one per real-world deployment. Each is a single page: the agency, the use case, what happened, and the cited reporting source. Stations are posted around the room before the session starts.
- Gallery-walk worksheet for each attendee: rate each station on a 1–3 scale across (a) potential benefit and (b) risk to public trust, plus a short "what would you do differently" line.
- Discussion guide for the facilitator with a recommended order through the stations.

## The eight stations

Use cases are chosen for variety and recency. Update annually as new examples emerge.

1. **Successful: Estonia's e-residency translation pipeline.** Multilingual public-services translation; flagged for human review on legal and benefits content. _Lesson: scoped use, layered review, sustained over years._
2. **Successful: City of San Jose's 311 chatbot triage.** Categorizes incoming requests for routing; staff handle anything ambiguous. _Lesson: AI does triage, humans do decisions._
3. **Failed: Michigan's MIDAS unemployment fraud system.** Algorithmic fraud detection wrongly flagged thousands; settled for $20M. _Lesson: automation of high-stakes decisions without human review._
4. **Failed: Dutch SyRI welfare fraud detector.** Court-ordered shutdown for discriminatory profiling. _Lesson: bias becomes systemic when not pre-tested._
5. **Successful: HHS / NIH biomedical literature search.** RAG-style retrieval over PubMed; researchers verify before citing. _Lesson: AI accelerates lookup; humans validate._
6. **Mixed: U.S. Customs facial-recognition trial.** High accuracy in lab, lower in field, raised civil-liberties concerns. _Lesson: lab metrics ≠ deployment metrics._
7. **Successful: Singapore's GovTech "Pair" AI assistant for civil servants.** Internal-only generative AI sandbox with logging. _Lesson: a contained, well-governed sandbox can scale._
8. **Failed: Allegheny County child-welfare risk score.** Useful research signal, but anchoring effects on caseworkers raised serious equity concerns when used in production. _Lesson: "decision support" is not low-stakes when the support reliably shifts human decisions._

The exact eight should be refreshed annually and adapted by region. Most U.S. agencies should include at least one in-state example (good or bad).

## 30-minute presentation

A short, framing presentation before the gallery walk:

1. **Why we look at failures, not just wins.** Failures reveal the real risks better than success stories do. Successful deployments often look "obvious in retrospect" and don't teach you what to avoid.
2. **The five risk categories.** Privacy. Bias. Accuracy. Transparency. Accountability. Most failures hit two or more. Use the slide to introduce the rating sheet.
3. **AI costs money, every month.** A common misconception: AI is "free with our cloud subscription." It is not. Show one slide breaking down a representative deployment: API costs, data processing, ongoing monitoring, staff time for review. Order-of-magnitude figures, not precise estimates.
4. **What we're going to do for the next 60 minutes.** Walk the gallery, fill in the rating sheet, then discuss the patterns.

## 30-minute gallery walk

Attendees walk in pairs from station to station. At each:

- Read the page (about 60 seconds).
- Discuss with partner: would your agency have caught this risk? Why or why not?
- Mark the rating sheet: benefit (1–3), public-trust risk (1–3), and one line on what you'd do differently.

The facilitator circulates and listens, prompting deeper conversation at stations where pairs are moving too fast.

After 25 minutes, the facilitator calls "everyone back to seats" and runs the discussion.

## 30-minute group discussion

Six structured prompts, in order:

1. **Which station was hardest to rate?** Surface the cases where benefit and risk are both high.
2. **What patterns did you see across the failures?** Common themes: lack of human review, biased training data, deployed without monitoring, scope expanded without re-evaluation.
3. **Who was harmed in the failed deployments?** Rarely the agency leadership. Almost always the people the agency is supposed to serve. Make this explicit.
4. **Which categories of risk would your role notice first?** Caseworkers notice bias differently from analysts. Inspectors notice accuracy differently from communications staff. Each role is a different sensor.
5. **What would have changed the outcome?** Almost always: earlier governance, smaller deployment scope, and a public-facing contestation pathway.
6. **What's one thing the agency should do that we aren't doing yet?** Capture the answers; many of them are real intake-form ideas.

## Closing 5 minutes

Same as Session 1.1: each attendee names one thing they will look at differently as a result of this session — a use case in their work, a vendor pitch they're skeptical of, a question they'll ask before adopting a new tool.

## Common questions and how to handle them

- **"Why are most of the failures U.S. or European?"** That's where the most reporting is. The reporting bias does not mean other countries' systems are working better. Be honest about the limits of the case set.
- **"Aren't these just outliers? Most AI is fine, right?"** Most of the AI in these case studies is fine in the lab. The failures emerge in the deployment context. The point of the session is that lab performance is not the same as deployment performance.
- **"This makes me want to never deploy AI."** Acknowledge — but note that the agency is deploying AI either way. The choice is whether to deploy it deliberately, with governance, or accidentally, through shadow AI. Deliberate beats accidental.

## Async fallback

- Recorded 8-minute framing video.
- A self-paced gallery: eight pages with the same rating sheet.
- Reflection question: _Which case is most relevant to my agency, and why?_
- Discussion forum thread per case study.

## Evaluation

- **Level 1.** Survey question: "How confident are you that you can spot a risky AI use case before it deploys?" — pre/post comparison.
- **Level 2.** One quiz question per risk category in the Session 1.4 quiz.
- **Level 3.** "What's one thing the agency should do that we aren't doing yet" responses are reviewed by the AI program lead and forwarded to the Review Committee. Captured intake forms count as Level 3.

## What to leave out

- A taxonomy of every public AI deployment globally.
- A debate about "is AI good or bad."
- Vendor product comparisons (those are governance / procurement work, not Track 1).
- Specific predictions about which technology will dominate in five years.

## Related

- [Session 1.1 — What AI Actually Is](/phase-2-education/track-1-foundations/session-1-1/) — the prior session
- [Session 1.3 — Your Job + AI](/phase-2-education/track-1-foundations/session-1-3/) — the next session
- [Risk Classification](/phase-1-governance/risk-classification/) — the formal tier system attendees see in Session 1.4
- [Legislative Compliance](/phase-1-governance/legislative-compliance/) — the laws several of these case studies triggered

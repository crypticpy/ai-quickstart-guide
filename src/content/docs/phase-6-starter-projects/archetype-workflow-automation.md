---
title: Archetype — Workflow Automation
description: AI-augmented intake routing, classification, or first-pass review — the highest-impact starter, with the heaviest governance scrutiny.
sidebar:
  order: 6
---

Workflow automation can be the most operationally impactful of the five starter archetypes — and the one with the most governance scrutiny. The pattern is the same across many agencies: a high-volume intake (forms, applications, tickets, complaints, inquiries) needs to be classified, routed, prioritized, or summarized. A human currently does this work; an AI can suggest the answer; a human still ratifies; the team's throughput may improve significantly.

Get this right and the agency moves from "we're trying AI" to "AI is meaningfully changing how the team operates." Get it wrong and the agency ships an AI that quietly miscategorizes intake for weeks before anyone notices.

This is **not the easy starter**. Pick this only if the agency has a clearly bottlenecked intake stream, a real history of human-classified examples, a stakeholder who will ratify decisions, and the discipline to keep humans in the loop. Otherwise, do the [chatbot](/phase-6-starter-projects/archetype-rag-chatbot/) first or narrow this project to shadow mode.

## What the project ships

A web application embedded in (or connected to) an existing intake stream where:

- **Each new intake item** gets an AI-suggested classification, route, or priority.
- **A human reviewer** sees the suggestion with rationale and the underlying intake content.
- **The reviewer ratifies, edits, or rejects** the suggestion — every decision is human-final.
- **Bulk views** let reviewers process a queue efficiently, applying / overriding suggestions in batches.
- **Outcome tracking** lets reviewers / supervisors see how the system's suggestions perform against final dispositions.

Plus the operator surface:

- Eval dashboards for classification accuracy.
- Drift detection (when intake patterns shift, accuracy degrades).
- Rule-based override library (cases where rules trump AI).
- Audit log for every suggestion + ratification + override.

## Why "human-in-the-loop" is the principle

The starter's design rule: **AI suggests, humans decide.** Every classification, route, or priority assignment passes through a human reviewer before it becomes the official record. This is not a temporary safeguard until the AI is "good enough" to act autonomously — it is the design.

Reasons:

- **Adverse action exposure.** A misrouted application can mean a delayed benefit, a missed deadline, or a wrongly-rejected case. The agency may face appeals or worse.
- **Bias risk.** Classifiers learn from historical decisions. If past decisions had bias, the AI inherits it. Human review catches systematic biases that pure metrics don't.
- **Audit and explainability.** "Why was this case routed to enforcement instead of compliance?" gets a human-rationale answer, not "the model said so."
- **Eval realism.** Human ratification rates are themselves the eval signal. When humans accept the AI's suggestion 95% of the time, the AI is useful; when they accept 60%, the AI is hurting.
- **Reversibility.** A human-ratified decision can be appealed and reviewed; an AI-only decision creates new appeal questions.

The agency may add more autonomy in later projects, with documented evidence and explicit governance. Not in the starter.

## When this is the right starter

- A high-volume intake stream exists (hundreds to thousands of items per day or week).
- Classification or routing is bottlenecked on humans; the queue grows.
- Historical examples of human classification exist (months / years of past decisions).
- Misclassification is detectable downstream (e.g., a misrouted case bounces back from the receiving team).
- A senior business owner cares about throughput AND quality.
- The agency's governance, audit, and risk-classification machinery is operating (Phase 1 isn't theoretical).

## When it's not

- The classification is binding (e.g., automatic eligibility decision). Wait for a later, more carefully governed project.
- No historical examples exist. The system has no eval baseline.
- The intake mix changes seasonally or politically and the team can't keep up with model retraining.
- Reviewers are too overloaded to actually review — they'll rubber-stamp suggestions.

## Modules exercised

| Module                                                             | How                                                                |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| [Auth](/phase-5-platform/auth-module/)                             | SSO; reviewers and supervisors as distinct roles                   |
| [RBAC](/phase-5-platform/rbac-module/)                             | Reviewers see their queue; supervisors see all; auditors read-only |
| [API Framework](/phase-5-platform/api-framework-module/)           | Suggestion, ratification, override endpoints                       |
| [Data Grid](/phase-5-platform/data-grid-module/)                   | Reviewer queues, audit views, outcome tracking                     |
| [AI Orchestration](/phase-5-platform/ai-orchestration-module/)     | Classification prompt, RAG over policy, eval, cost                 |
| [Admin Dashboard](/phase-5-platform/admin-dashboard-module/)       | Drift, override patterns, accuracy by reviewer                     |
| [Document Rendering](/phase-5-platform/document-rendering-module/) | Optional: routing letters, determination drafts                    |

## Architecture sketch

```
   Intake source (form, email, queue, API)
                  │
       ┌──────────▼──────────┐
       │  Intake adapter     │   normalize to platform schema
       └──────────┬──────────┘
                  │
       ┌──────────▼──────────┐
       │ AI Orchestration    │   classify / route / prioritize
       │   - retrieve policy │
       │   - prompt with cite│
       │   - structured out  │
       │   - confidence score│
       └──────────┬──────────┘
                  │
       ┌──────────▼──────────┐
       │ Reviewer Queue UI   │   human ratifies / edits / rejects
       └──────────┬──────────┘
                  │
       ┌──────────▼──────────┐
       │ Downstream system   │   the official record
       └──────────┬──────────┘
                  │
       ┌──────────▼──────────┐
       │ Outcome tracking    │   accuracy feedback for eval
       └─────────────────────┘
```

## Classification prompt

The AI's job is **suggesting structured fields**, not free-form analysis. Output is JSON conforming to a schema:

```json
{
  "category": "complaint-housing",
  "subcategory": "rental-deposit-dispute",
  "priority": "standard",
  "route_to": "housing-mediation",
  "confidence": 0.78,
  "rationale": "Intake describes a withheld security deposit and references a 30-day notice...",
  "policy_citations": ["housing-handbook:5.2", "consumer-rights:7.1"],
  "flags": ["statute-of-limitations-near"]
}
```

The schema is enforced. A response that doesn't validate is regenerated.

The prompt instructs:

- "Use the categories listed below. Do not invent a new category."
- "If the intake is ambiguous, return your best guess and flag `ambiguous: true`."
- "Cite the policy section that supports your classification."
- "If the intake doesn't match any category, return `category: 'uncategorized'`."

## Confidence scoring

Every suggestion carries a confidence score. The reviewer queue uses confidence to prioritize attention:

- **High confidence + matches reviewer's own gut** → fast ratification.
- **High confidence + reviewer disagrees** → flag for supervisor review (the model may have learned a wrong pattern).
- **Low confidence** → supervisor or experienced-reviewer review; not the firehose queue.
- **Below a floor** → not surfaced as a suggestion at all; reviewer classifies from scratch.

Confidence is calibrated against historical accuracy. The eval suite tracks accuracy by confidence bucket; if the 0.9-confidence bucket actually has 70% accuracy, calibration is broken and the threshold gets adjusted.

## Eval suite

The most demanding of any starter archetype.

| Group                      | Tests                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Held-out historic**      | A test set of past intake with human-final classifications. Accuracy is the headline metric.                |
| **Confidence calibration** | Are the model's confidence scores well-calibrated against historic accuracy?                                |
| **Edge cases**             | Ambiguous intake; intake with multiple valid categories; should-refuse cases                                |
| **Bias probes**            | Synthetic test set varying demographic-correlated features; accuracy must not vary materially across groups |
| **Adversarial**            | Intake with prompt-injection-like content; system must not be subverted                                     |
| **Drift detection**        | Recent intake (last 30 days) vs. older eval baseline; accuracy stable?                                      |

Starter threshold targets:

- Overall accuracy meets or beats a documented baseline on a held-out set.
- Confidence calibration is close enough that reviewers can use it for triage; investigate buckets where confidence materially overstates accuracy.
- Bias probe variance across protected-attribute slices stays within a locally approved tolerance.
- No known should-refuse case produces an unflagged classification.

A failing production-risk eval should block deploy. A failing bias probe should block launch expansion and trigger a separate review.

## Bias and fairness

This is the archetype that needs the most attention to fairness:

- **Demographic features should not directly enter the prompt unless justified.** Names, addresses, ZIP codes, etc. that correlate with protected attributes either (a) get redacted before the model sees them, or (b) are explicitly evaluated to ensure they do not drive classification unfairly.
- **Bias probes in CI for higher-risk launches.** A synthetic test set where the same intake content is varied across demographic-correlated attributes; classification should be stable within approved tolerances.
- **Outcome monitoring.** Post-launch, classifications are sliced by recipient demographic where data is available; persistent disparities trigger review.
- **Reviewer override patterns.** When reviewers consistently override suggestions for one demographic group, that's a signal — investigate.
- **External review.** For starters with high consequence, an external fairness review (academic partner, civil-rights office) before launch.

The agency's [risk classification policy](/phase-1-governance/risk-classification/) and [review committee](/phase-1-governance/review-committee/) own these checks. Workflow automation is where Phase 1's machinery is exercised hardest.

## Reviewer experience

The reviewer is the most important user. Their UI:

- **Queue view.** Items to review, sorted by priority + confidence.
- **Item detail.** Full intake content + suggestion + rationale + citations.
- **One-click ratify.** Most suggestions are correct; ratification is fast.
- **Edit mode.** Reviewer changes any field with rationale.
- **Reject + reclassify.** Reviewer rejects the suggestion and starts from scratch.
- **Pattern flagging.** "Flag this for supervisor — I see this pattern several times today."
- **Bulk operations.** "Apply suggestion to all 50 high-confidence items in this filter" — with preview and audit.

Reviewer load is monitored. If reviewers can't keep up, the system gets backed up; if they rubber-stamp, quality collapses. The ratio of throughput to override rate is the operating metric.

## Audit trail

Every step is audit-logged:

- Intake received → who, when, source.
- Classification suggested → prompt version, model, retrieval chunks, confidence, rationale.
- Reviewer action → ratified / edited / rejected, with the reviewer's rationale.
- Final disposition → the field values that became the record.
- Downstream outcome → eventual outcome of the case (accuracy feedback for eval).

These logs answer "why was this case classified this way" months or years later. They are the audit answer when an applicant or stakeholder asks.

## Drift monitoring

Intake patterns change. When the world changes, the model trained on yesterday's intake gets less accurate. The dashboard surfaces:

- **Recent accuracy.** Last 7 / 30 / 90 days vs. baseline.
- **Override rate.** Trending up means reviewers disagree with the model more.
- **Category distribution shift.** Are new intake categories appearing? Are old ones rare?
- **Confidence distribution shift.** Is the model getting more or less certain over time?

When drift exceeds thresholds, the operator has options: re-run eval against fresh data, retrain or re-prompt, narrow scope, or pause. The drift response is part of the runbook before launch.

## Cost ceiling

Per-classification cost is small ($0.01–$0.05 with mid-tier models on small inputs). For high-volume intake, the cumulative cost is meaningful but manageable.

For starters: target a small fraction of comparable human-review cost, then validate with real volume. If the system costs more than the work it augments, the project needs scope, model, or process changes before expansion.

## Build sprints (Months 7–10)

| Sprint           | Output                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Month 7 (4 wks)  | Selection memo; eval baseline (human-only accuracy on held-out set); historical examples curated |
| Month 8 (4 wks)  | Classification prompt + retrieval; first eval pass; reviewer UI v1                               |
| Month 9 (4 wks)  | Bias probes; calibration; UAT with reviewer cohort                                               |
| Month 10 (4 wks) | Drift monitoring; rollback rehearsal; production readiness                                       |

## What launching looks like

- Test cohort of 3–5 reviewers in Month 9.
- Initially **shadow mode** — system suggests but reviewers ignore, classifying as usual. Compare suggestions to reviewer choices for accuracy baseline.
- Then **suggest mode** — suggestions visible to reviewers, ratification optional.
- Finally **default-suggest mode** — suggestions are the default; reviewer ratifies or overrides.
- Across cohort expansions, monitor accuracy, override rate, and reviewer satisfaction.

## Common workflow-automation failures

- **Rubber-stamping.** Reviewers under pressure ratify without reading. Mitigations: random spot-checks; supervisor sampling; targeted training; load-balancing reviewer queues.
- **Drift unnoticed.** The system slowly degrades over months because nobody monitors. Drift dashboards and threshold alerts should be part of the launch plan.
- **Bias propagation.** Past biased decisions teach the model to be biased. Bias probes catch it; re-eval after every prompt change.
- **Inappropriate autonomy creep.** Stakeholders ask "can we skip the human review for the high-confidence ones?" Resist for the starter; document the criteria for ever lifting it (it's a separate project).
- **Reviewer churn.** Reviewers leave; new reviewers don't know the override norms. Reviewer onboarding is part of the runbook.
- **Outcome disconnect.** The system classifies; downstream uses the classification; nobody checks if final outcomes (case resolutions) align with classification. Outcome tracking closes the loop.
- **Eval set stale.** The eval set was curated 6 months ago and no longer reflects intake patterns. Refresh quarterly.

## Plain-English Guide to Workflow Automation Terms

- **Human-in-the-loop.** Every AI suggestion passes through a human before becoming the official record.
- **Shadow mode.** The system runs alongside humans without affecting decisions; suggestions are recorded but not surfaced.
- **Confidence calibration.** The property that "confidence 0.9" actually means 90% accurate. Important for triaging review attention.
- **Bias probe.** A test that varies demographic-correlated features in synthetic intake to detect whether the model treats groups differently.
- **Drift.** The phenomenon where a model's accuracy degrades because the world has changed since training/prompt design.
- **Override rate.** The fraction of AI suggestions that reviewers reject or substantially edit. A leading indicator of accuracy.

## Related

- [Phase 6 overview](/phase-6-starter-projects/) — the five archetypes
- [Selection Guide](/phase-6-starter-projects/selection-guide/) — when to pick this archetype
- [Risk Classification Policy (Phase 1)](/phase-1-governance/risk-classification/) — informs the classification tier
- [Review Committee (Phase 1)](/phase-1-governance/review-committee/) — reviews this archetype's bias probes and launch
- [AI Orchestration Module](/phase-5-platform/ai-orchestration-module/) — provides the classification pipeline and eval

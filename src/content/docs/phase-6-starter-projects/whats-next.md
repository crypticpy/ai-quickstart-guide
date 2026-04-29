---
title: What's Next — After the Starter Project
description: Sustainability practices and the decision tree for project number two.
sidebar:
  order: 7
---

Launching the starter project is not the end of Phase 6. The first two weeks after launch are not "done" — on-call is real, the eval suite is catching regressions, the user feedback mechanism is filling up, and the cost dashboard is showing whether the projection matched reality. This is the time the team learns what running an AI product feels like. Do not start the next project. Finish this one's first incident response and first cost reconciliation before turning attention elsewhere.

## Two-week stability watch

The two-week post-launch window is a deliberate cooling period. The team is not adding features. They are watching, responding, and writing down what they see. The discipline of staying focused on one launched system — instead of jumping to the next idea — is itself a skill the agency is building.

## Month 12 retrospective

The Phase 6 month-by-month sequence ends with a Month-12 retrospective. It produces three artifacts that travel out of Phase 6 into Year 2.

- **Lessons-learned document.** What the platform team needs to fix; what the application team did well; what the agency would do differently next time.
- **Platform punch list.** Concrete bugs and gaps the starter surfaced in the Phase 5 modules. Prioritized for the platform team's next quarter.
- **Second-project queue.** Candidate archetypes for project number two, ranked using the criteria below.

## Ranking project number two

When the team chooses the second project, the choice is informed by what the starter taught them. A short decision tree, in priorities-not-Mermaid form:

- **Was the platform-exercise goal under-served?** Pick a project that hits the modules the starter didn't. If the starter was a chatbot, the second is workflow automation — it exercises RBAC and audit harder, and forces the platform's harder edges.
- **Was the user-trust goal under-served?** Pick a higher-visibility project with stronger evals and clearer user benefit. Confidence in AI inside the agency is built by visible wins, not quiet ones.
- **Was capacity over-extended?** Pause for a quarter. Run a [domain lab (Track 6)](/phase-2-education/track-6-domain-labs/) for the next archetype before committing to a second build. The team needs runway, not another sprint.
- **Did the legislative or regulatory environment shift?** Re-rank candidates against current Tier-2 / Tier-3 risk thresholds. A project that scored well six months ago may now require controls the agency hasn't built.

## Sustainability practices

After Month 14, the starter project is no longer "the new thing." It needs the boring practices that keep production systems alive.

- **Single owner.** A named application team owns the running system. Not the platform team — the platform team owns the platform; the application team owns the application.
- **Extended on-call.** The on-call rotation expands to include the application team after Month 14. The platform team is not solely responsible for incidents in someone else's product.
- **Eval ownership split.** The eval suite for this product is owned by the application team. The eval _framework_ — the tooling, the harness, the dashboards — is owned by the platform team.
- **Cost dashboard reviewed monthly.** Anomalies investigated; trend lines reported to the steering group.
- **Quarterly engagement pulse.** A short user survey covers users of the deployed app. See [sustainability practices](/phase-2-education/sustainability/) for the full cadence.

## Retirement is real

Every starter project should have named a retirement condition at launch. Common conditions:

- "We replace this with a vendor product when one matures."
- "The underlying workflow is automated by a different system."
- "Usage drops below threshold for two consecutive quarters."
- "The model class we depend on is deprecated and re-platforming costs more than the value delivered."

Without a retirement plan, the agency accumulates AI debt — systems that nobody owns, nobody uses much, and nobody is willing to turn off. The plan is named in the launch memo and revisited at every annual review. Sunsetting an AI product is a normal lifecycle event, not a failure.

## Year 2 planning

The starter project's outputs are inputs to the Year 2 budget cycle.

- **Budget request timing.** The Year 2 budget request goes in by Month 12 of Year 1. The retrospective output is the input — concrete numbers, not estimates.
- **ROI inputs are real.** The [ROI calculator](/resources/roi-calculator/) takes the starter's actual cost-per-query and projected savings, derived from Month-11 and Month-12 data. Estimates from the proposal are replaced with measurements from production.
- **Second-project funding.** The second project's funding case rides on the starter's results. A clean retrospective makes that conversation short.

## Related

- [Sustainability practices (Phase 2)](/phase-2-education/sustainability/) — engagement and reinforcement post-launch.
- [ROI Calculator](/resources/roi-calculator/) — the Year 2 budget input.
- [Case Studies](/resources/case-studies/) — what other agencies did with their second project.
- [Phase 5 — Modular Platform](/phase-5-platform/) — the platform that the punch list feeds back into.

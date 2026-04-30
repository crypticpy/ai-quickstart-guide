---
title: Off-Ramp Re-entry Guide
description: How to resume the guide after parking at an off-ramp. What's stale, what still holds, and what the re-entry sequence looks like for each off-ramp.
sidebar:
  order: 4
---

## Why this page exists

The guide ships six named off-ramps. Each one is a real stopping point where the work to date is a complete, defensible deliverable on its own. Many agencies park at one of these and come back six, twelve, or twenty-four months later when budget, leadership, or legislation changes. This page tells you what part of your earlier work is still valid and what you should refresh before continuing.

## How to use this page

Find the off-ramp you parked at in the per-off-ramp section below. Read the staleness assessment for the gap that matches your situation (6 months, 12 months, or 24 months). Walk the re-entry checklist. If you need to refresh executive support, adapt the sponsor memo template at the bottom of the page.

## Common re-entry triggers

Re-entry usually starts with a non-technical event. The pattern is worth naming so you do not feel like you are restarting from a cold position.

- New leadership wants a defensible answer to "what are we doing about AI?"
- New state legislation or a new federal memo lands and your AUP needs to respond.
- A peer agency ships something visible and your council, board, or sponsor asks why you have not.
- A new budget cycle opens and the line item that was unfunded before is fundable now.

## Per-off-ramp re-entry

### 1. Governance Only

**What you have if you parked here:** AUP, risk classification policy, AI Review Committee charter, intake form, an approved-tool list, and a list of disallowed shadow-AI behaviors.

**Staleness assessment:**

- **6 months.** Most of what you wrote still holds. Refresh the legislative scan because state laws move fast and links rot. Re-confirm the committee chair, the rotation schedule, and quorum rules. Check that the intake form is actually being used and not bypassed.
- **12 months.** The AUP needs a review pass, especially anything citing federal memos. OMB AI memos update on roughly an annual cycle, so any clause that quotes one by number should be re-checked against the current version. Risk tier definitions usually hold; confirm any tier definition that referenced specific vendor capabilities, since vendor offerings drift quarterly.
- **24 months.** Treat the AUP as a draft starting point rather than a currently adopted policy. Re-run a one-day governance sprint with counsel. The committee charter is probably still good. The risk classification structure is probably still good. The specific citations and the approved-tool list almost certainly are not.

**Re-entry checklist:**

- [ ] Re-read the [legislative tracker](/resources/legislative-tracker/) and the [frameworks cited](/resources/frameworks-cited/) page for any version bumps in NIST AI RMF, OMB memos, or state law.
- [ ] Confirm the AI Review Committee still has a charter, a chair, a quorum, and a meeting cadence on the calendar.
- [ ] Pull intake form metrics: how many requests came in while parked? How many were approved without committee review? Any shadow-AI incidents?
- [ ] Refresh the approved-tool list against current vendor pricing and current data-handling terms.
- [ ] Pick the next phase and budget for it.

**Where to go next:** [Phase 2, Education](/phase-2-education/) is the standard next step. The governance work has nowhere to land without trained people.

### 2. Tracks 1+3+7+intake+commitment+pulse

**What you have if you parked here:** Track 1 (AI literacy for all staff) delivered, Track 3 (governance and risk) delivered, Track 7 (executive briefings) delivered, intake form live, signed leadership commitment statement, and a quarterly engagement pulse running.

**Staleness assessment:**

- **6 months.** Track content is current. Re-run the engagement pulse if you skipped a quarter. Refresh the intake form examples with anything that came in during the parked period. Confirm the executive sponsor is still in seat.
- **12 months.** Track 1 needs a content refresh because the example AI tools and the example failure modes age fast. Track 3 needs to pick up any new policy that came out of a Phase 1 refresh. Track 7 (executive briefings) needs a new edition with a current-state slide. The leadership commitment statement is usually still valid; re-affirm it in writing if leadership has turned over.
- **24 months.** Re-run Track 1 from scratch with current examples. Re-deliver Track 7 to the new executive layer. The intake form taxonomy likely needs adjustment because the request mix has shifted. The pulse data from two years ago is not a useful baseline; start a new baseline.

**Re-entry checklist:**

- [ ] Compare current Track 1 materials against current AI tool capabilities. Anything older than 12 months in the example set gets replaced.
- [ ] Re-deliver Track 7 to any executives who came in during the parked period.
- [ ] Pull the last engagement pulse result. If the score dropped or the response rate fell below 30 percent, sequence a re-launch communication before the next phase.
- [ ] Verify Tracks 4, 5, and 6 (the accelerator tracks) are still scoped correctly for current staff and current tooling.
- [ ] Pick the next phase and budget for it.

**Where to go next:** [Phase 3, Infrastructure](/phase-3-infrastructure/) is the standard next step, often paired with the remaining Phase 2 tracks (4, 5, 6) running alongside.

### 3. Sandbox-only

**What you have if you parked here:** Cloud account, SSO, minimal CI/CD, secrets management, and a single sandbox environment. Enough to run Track 4 developer labs and Tier-1 pilots. No staging or production stack yet.

**Staleness assessment:**

- **6 months.** Cloud account and SSO are fine. Pricing on AI services has likely shifted; pull a current bill estimate. Patch and update the CI/CD runners and any dev container images. Rotate sandbox credentials if rotation policy says so.
- **12 months.** Cloud service offerings change quarterly, so any pre-built AI service you wired in (Bedrock model IDs, Azure AI Services SKUs, Vertex model versions) needs verification. Some of those models will be deprecated. The CI/CD pipeline almost certainly needs dependency updates. Sandbox cost guardrails should be reviewed against current budget.
- **24 months.** Treat the sandbox as a working reference, not a current environment. Plan for a one-sprint refresh: re-pull base images, refresh IAM roles against current organizational policy, replace any deprecated AI services, and re-run the security baseline scan before re-opening developer access.

**Re-entry checklist:**

- [ ] Check vendor capability pages for any AI service used in the sandbox; replace deprecated models.
- [ ] Run a fresh cost estimate at current usage and current pricing. Compare against the original budget line.
- [ ] Patch CI/CD runners, dev containers, and any pinned dependencies.
- [ ] Re-run the security baseline (IAM review, secrets rotation, CIS benchmarks if you used them).
- [ ] Decide whether to extend to staging and production now, or run another wave of pilots in sandbox first.

**Where to go next:** [Phase 4, Dev Stack](/phase-4-dev-stack/) is the standard next step. Some agencies sequence Phase 2's remaining tracks alongside.

### 4. Stack-Conformant Pilots

**What you have if you parked here:** A defined development stack, coding standards, security guardrails for AI assistants, and one or more pilots that conform to the stack but were not promoted to Phase 5 platform work.

**Staleness assessment:**

- **6 months.** Stack choices and standards are still current. AI coding assistant capabilities and guardrails change quickly; review the assistant configuration and the prompt or rules files against the current vendor guidance. Pilot code is still maintainable.
- **12 months.** Stack version pins need a refresh. Coding standards usually hold, with the exception of the section on AI assistant usage; that section ages fast because the assistants do. Pilot code needs a dependency update pass before any further work lands on top of it.
- **24 months.** Some of the stack pins are likely past end-of-support. The AI assistant section of the standards needs a rewrite because both the products and the threat model have moved. Pilots are still valuable as reference implementations, not as live codebases.

**Re-entry checklist:**

- [ ] Refresh stack version pins to current LTS where applicable.
- [ ] Rewrite the AI assistant section of the coding standards against current vendor capabilities and current guardrail patterns.
- [ ] Re-run the pilot test suites; document which pilots are still maintainable and which become reference-only.
- [ ] Decide whether to start Phase 5 platform work now, or run additional pilots first to firm up which modules are worth extracting.

**Where to go next:** [Phase 5, Platform](/phase-5-platform/) is the standard next step. The pilots become the input to module extraction.

### 5. Platform Without Starter Project

**What you have if you parked here:** A working platform with reusable modules (Auth, AI orchestration, observability, and so on), governance, trained staff, and development standards. Production-ready infrastructure with no starter project running on it yet.

**Staleness assessment:**

- **6 months.** Platform modules are current. Run the standard dependency update cadence. Confirm the observability dashboards still surface useful signals. Module documentation usually still tracks the code.
- **12 months.** Modules need a maintenance pass. Any module that wraps a vendor AI service needs verification against current vendor SDKs. The platform's AI orchestration layer is the highest-risk module because the orchestration patterns themselves have evolved. Documentation drift is normal at this point; budget time to reconcile docs with code.
- **24 months.** Platform is closer to a brownfield codebase than a current one. Plan a one-sprint hardening pass before the first starter project lands: dependency updates, module-by-module test runs, observability dashboard refresh, and a documentation review. The architecture is almost certainly still sound; the surface area has aged.

**Re-entry checklist:**

- [ ] Run dependency updates module by module. Note any module that has not been touched in over 12 months for closer review.
- [ ] Verify the AI orchestration module against current vendor SDKs and current orchestration patterns.
- [ ] Refresh observability dashboards. Confirm alerts still route to a real on-call.
- [ ] Pick the starter project archetype. The platform's compounding value only kicks in once a real workload exercises it.

**Where to go next:** [Phase 6, Starter Projects](/phase-6-starter-projects/) is the standard next step.

### 6. Pilot Without Production Launch

**What you have if you parked here:** A starter project built end-to-end on the platform, exercised the modules, generated real user research, and stopped at the Month-10 production readiness gate without promotion.

**Staleness assessment:**

- **6 months.** User research is still useful. The pilot codebase is maintainable. Re-run the readiness gate with current criteria; some of the original blockers may have cleared.
- **12 months.** User research is now a baseline rather than current. Run a short re-validation interview round before re-opening the production decision. The pilot codebase needs a dependency update pass and a security re-scan. Vendor pricing shifts may change the production cost projection materially.
- **24 months.** Treat the pilot as a reference implementation. The user research findings are still useful for shaping the next attempt, but the user population, the workflow, and the available AI capabilities have moved enough that a fresh user research round is the right input to the production decision.

**Re-entry checklist:**

- [ ] Re-run the [Month-10 readiness gate](/phase-6-starter-projects/production-readiness/) against current criteria. Note which blockers cleared and which still stand.
- [ ] Refresh user research with at least a short validation round; do not promote a two-year-old pilot to production on two-year-old user signal.
- [ ] Patch dependencies, re-run security scans, and re-cost the production projection at current vendor pricing.
- [ ] Decide: promote, re-pilot with sharper scope, or retire and choose a new archetype.

**Where to go next:** Either production promotion, a tightened re-pilot, or a new archetype selection on the existing platform.

## When NOT to come back

Some agencies should stay parked. If your political environment has shifted in a way that makes AI work create more risk than value right now, the off-ramp is doing exactly what it was designed to do. The governance work, the training, and any platform or pilot artifacts you produced remain valid as standalone deliverables. They satisfy most legislative AI policy requirements on their own. You can come back when the situation changes; nothing about parking forecloses a future re-entry.

## Sponsor memo template

Hand this to a program manager who needs to make the case to an executive sponsor. Customize the bracketed fields and trim anything that does not apply.

> TO: [Exec sponsor]
>
> FROM: [PM]
>
> RE: Resuming AI program from [Off-ramp X]
>
> **Where we parked:** [One sentence. Name the off-ramp and the date the agency stopped at it.]
>
> **What changed:** [Two or three sentences. New legislation, new peer agency outcome, new budget cycle, new leadership, or a specific business request that the current state cannot answer.]
>
> **What we propose:** [Two or three sentences. Pick up at Phase X using the Small, Standard, or Large path variant. Name the deliverable that closes the gap, not the activity.]
>
> **Budget ask:** $[amount] for [duration], anchored to the figures on the [Budget Methodology](/resources/budget-methodology/) page. [One sentence on what is in and out of that ask.]
>
> **Decision needed by:** [Date], so we can [next concrete step, such as engaging counsel for the governance refresh, opening a sandbox account, or scoping the starter project].
>
> **Risk if we do nothing:** [One or two sentences. The governance work goes stale at 12 months. Peer agencies move ahead. Shadow AI usage grows without an updated AUP to cover it.]

## Where to read more

- [Pick Your Path](/getting-started/pick-your-path/). Sized variants and timelines for re-entry sequencing.
- [Budget Methodology](/resources/budget-methodology/). Anchored figures for re-entry budgets.
- [How This Guide Compares to Other Public-Sector AI Resources](/getting-started/vs-other-guides/). Useful if you are evaluating whether to come back to this guide or switch to a different resource.
- [Comparable Agency Case Studies](/resources/case-studies/). Includes a small-county case study where the agency off-ramped at Phase 2 and resumed Phase 3 in Year 2.

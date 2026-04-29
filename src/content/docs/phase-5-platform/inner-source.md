---
title: Inner-Source Contribution Model
description: How teams across the agency contribute fixes, features, and modules back to the platform — open-source norms applied internally.
sidebar:
  order: 10
---

A platform with 5 maintainers and 50 consumers will fail. The 50 consumers will hit edge cases the 5 maintainers can't predict, and the maintainer team will become a queue of feature requests they can't service. Inner source — running internal repositories with the norms of an open-source project — is how the platform scales beyond its founding team.

The principle: any developer in the agency can fix, improve, or extend a platform module. They submit a PR; the module owners review it; if accepted, it merges. The module owners remain accountable for direction and quality, but contribution is not gated by org chart or staffing pipeline.

## Why inner source for a government platform

Three concrete reasons.

1. **Edge cases find their fixers.** The team that hit the bug usually has the most context to fix it. Instead of filing a ticket and waiting six months, they write the fix and the platform team reviews.
2. **The maintainer team stays small.** Inner source lets the platform team punch above its weight. Fixes accumulate from across the agency without requiring corresponding headcount on the platform team.
3. **Consumers feel ownership.** A team that has shipped code into the platform treats it differently than a team that consumes a black box. They report bugs more carefully, propose features more thoughtfully, and tolerate change more graciously.

The pattern was originated at PayPal in the early 2010s and has been adopted across most large engineering organizations. The federal precedent — CMS established the first agency OSPO (Open Source Program Office) in 2024 — gives government adopters a documented model.

## What "inner source" requires

Inner source is not "make the repo readable." It is a small set of practices that, applied consistently, change how the platform develops.

| Practice                   | What it means                                                             |
| -------------------------- | ------------------------------------------------------------------------- |
| **Discoverable repos**     | Every platform repo is searchable; READMEs explain purpose and setup      |
| **Public roadmaps**        | What's planned, what's not, what's wanted — visible to all consumers      |
| **Public issue tracker**   | Bugs, feature requests, design discussions in the open                    |
| **Contribution guide**     | A `CONTRIBUTING.md` that says how to file issues, build, test, submit PRs |
| **Defined ownership**      | Every module has named maintainers with clear scope                       |
| **Welcoming review tone**  | Reviewers explain, mentor, accept good work even when imperfect           |
| **Visible decisions**      | ADRs and design discussions in the repo; no private slack negotiations    |
| **Consistent quality bar** | Same tests, lint, eval gates apply to contributions and core team work    |

## Roles

Three roles, by name and responsibility:

- **Maintainer.** Has merge authority on the module. Reviews PRs, sets direction, holds the bar on quality. Typically a member of the platform team, but not necessarily.
- **Trusted committer.** A frequent contributor with elevated review rights. Can review and approve most PRs but doesn't set strategic direction.
- **Contributor.** Anyone in the agency. Files issues, opens PRs, joins design discussions.

The progression is real: a contributor who repeatedly ships quality work can be elevated to trusted committer, then maintainer over time. The progression has to be visible — opaque elevation breeds resentment.

## The contribution lifecycle

```
Idea → Issue → Design discussion → PR draft → Review → Merge → Release
```

### Issue

Every non-trivial change starts as an issue. The issue describes:

- The problem (not the solution).
- Who it affects (which apps, which workflows).
- The desired outcome.
- Optional: rough proposal.

Issues stay open while design is discussed. Maintainers triage within 5 working days — accept, reject with rationale, or request more info. Issues that linger for weeks are a signal that the maintainer queue is backed up; either staff up or push back on scope.

### Design discussion

Larger changes (new features, breaking changes, new modules) require an ADR or a design doc before the PR is opened. Without this, contributors waste time writing code that gets rejected on architectural grounds. The agency's [ADR template](/phase-4-dev-stack/adr-template/) is the format.

### PR draft

The contributor opens a draft PR early — not after the work is "done." Drafts solicit early feedback while changes are cheap. Reviewers can comment on direction before the contributor invests deeply in a wrong path.

### Review

Reviewers explain reasoning. "This needs to change because <X>" beats "this is wrong." A reviewer who only says "no" without context is teaching the contributor not to contribute again.

Reviewers say yes when the work meets the bar — even if they personally would have written it differently. Inner source dies when reviewers reject contributions that don't match their personal style.

### Merge and release

Merged contributions ship in the next module release. Contributors see their changes in production within weeks. Recognition matters: release notes credit contributors; the platform team's quarterly newsletter highlights notable contributions.

## CONTRIBUTING.md

Every module has one. The agency's standard structure:

```markdown
# Contributing to <module>

## Getting started

- Setup steps (clone, install, build, test).
- How to run the module locally.
- Where to ask questions (slack channel, weekly sync).

## What we're looking for

- Bug fixes (always welcome).
- Documentation improvements (always welcome).
- New features (please file an issue or ADR first).

## What we're not looking for

- Performance optimizations without measurement.
- Refactors that don't improve testability or readability.
- New abstractions for hypothetical future use cases.

## How to file an issue

- Reproducible bug reports beat vague descriptions.
- Templates: bug, feature request, design discussion.

## How to submit a PR

- Branch naming: <username>/<short-description>.
- Commit message conventions: see Coding Standards.
- The CI must pass; coverage and eval thresholds apply.
- One reviewer approval to merge; some changes need two.

## Review expectations

- We aim for first review within 3 working days.
- Be ready to iterate.
- We will explain reasons; please push back if our reasons aren't compelling.

## Code of conduct

[link to agency's code of conduct]
```

## Defining "trusted contribution"

Not every PR is equal. Three tiers:

- **Trivial.** Typo, doc fix, dependency bump, small lint fix. One reviewer; merge fast.
- **Standard.** Bug fix, small feature, refactor within an existing seam. One maintainer + one trusted committer (or one maintainer with high familiarity).
- **Architectural.** New module, new public API, breaking change, vendor swap. Two maintainers, ADR required, design discussion before PR.

Tiers are described in `CONTRIBUTING.md`. Mismatch (architectural change submitted as a PR with no ADR) gets a friendly redirect to the right path, not a rejection.

## The OSPO

Many agencies establish an Open Source Program Office to run inner source (and adjacent open-source contributions, where allowed). The OSPO's responsibilities:

- **Govern the inner-source policy.** What can be shared internally; what controls apply.
- **Maintain the contribution guide template.** Modules adapt; OSPO keeps the canonical version.
- **Track health.** Number of contributors, time-to-first-review, issue backlog by module.
- **Resolve disputes.** A contributor and maintainer disagree on a contribution; OSPO arbitrates.
- **Coordinate with legal.** Some contributions raise IP, license, or classification questions; OSPO has the relationships.
- **Outreach.** New developers learn about inner source through OSPO programming.
- **External open source** (where allowed). The agency may contribute back to upstream OSS projects — OSPO is the path.

CMS's OSPO (established 2024) is the federal reference; HHS, GSA, and 18F are following. Smaller agencies don't need a full OSPO — a designated point person on the platform team is often enough.

## Visibility and discoverability

Inner source fails when nobody knows where to start. Visibility mechanisms:

- **The module registry** ([next page](/phase-5-platform/idp-and-registry/)) lists every module with its README, CONTRIBUTING, owners, and roadmap.
- **Search** — code search across all platform repos (Sourcegraph, GitHub Enterprise's built-in, GitLab Code Search). A developer asking "does the platform handle X" can find the answer.
- **Office hours** — weekly drop-in time where the platform team is available for questions. Recorded; recurring.
- **#platform-help** Slack channel — quick questions, no formal process. Maintainers monitor and answer.
- **Quarterly demo day** — module teams show what shipped; consumers show what they built on the platform. Builds awareness across the agency.

## Reviewing contributions: tone and substance

The hardest part of inner source for an experienced engineering team is review tone. Reviewers who would accept a quick fix from a teammate will sometimes block the same fix from a less-familiar contributor.

Norms the agency adopts:

- **Assume good intent.** A contributor who got something subtly wrong is asking for help, not trying to ship broken code.
- **Explain, don't dictate.** "We avoid pattern X because we hit problem Y last year" beats "no, change this."
- **Suggest, don't rewrite.** A reviewer who pushes commits onto the contributor's branch is denying the contributor the chance to learn.
- **Mentor on subsequent contributions.** A first PR with many comments should result in a second PR with fewer. If the same contributor's third PR has the same kinds of comments, the platform team is failing.
- **Acknowledge improvements.** "Nice fix on the off-by-one" is small but matters.
- **Hold the bar.** Don't accept code that's worse than the bar — that punishes future contributors who held the bar.

## Maintainer obligations

Maintainers commit to:

- **Triage within 5 working days.** Issues and PRs get a response, even if the response is "we'll get to this in two weeks."
- **First review within 3 working days.** Especially important for first-time contributors who are watching the inbox.
- **Public roadmap.** What's planned for the next 1–2 quarters, what's "we'd accept a PR but won't write it ourselves," what's out of scope.
- **Responsive office hours.** Show up; be helpful.
- **Clarity about what won't be accepted.** "We won't accept dependency X because of Y" up front saves everyone time.

## Common inner-source failures

- **Inner source as a label, not a practice.** "We're inner source!" with no CONTRIBUTING, no public roadmap, no review responsiveness. Contributions don't materialize because the practice isn't real.
- **Maintainer queue blocks contribution.** Maintainers are too busy to review; PRs sit for weeks; contributors give up. Either staff up review or scale back what's accepted.
- **Hostile reviews.** A senior engineer's tone in a PR scares away a contributor. Norms above must be enforced; the OSPO escalates persistent issues.
- **Style-only rejection.** "I would have written this differently" is not a rejection reason. Match the codebase, but don't impose personal preference.
- **Forking instead of contributing.** A team facing a slow contribution path forks the module and maintains its own version. Worst outcome — fragmentation. Inner source has to be faster than the fork.
- **Heroes burning out.** A small number of maintainers carry the contribution load; they burn out; the model collapses. Distribute review load; promote trusted committers.
- **No recognition.** Contributors don't see their names anywhere; motivation to contribute drops. Release notes, demo day, and platform-team newsletters fix this.

## Metrics that signal inner-source health

- **Time-to-first-review** for first-time contributors.
- **Time-to-merge** by tier (trivial, standard, architectural).
- **Number of unique contributors per quarter** (target: growing).
- **Number of repos with >3 distinct contributors** (target: most of them).
- **Maintainer satisfaction** (separate survey; sustained low scores predict collapse).
- **Contribution funnel** (issue → draft → ready → merged) — drop-off points are diagnostic.

## What stays platform-team-only

Not everything. Decisions that stay with the platform team:

- **Module taxonomy.** Adding or removing a module is platform-team decision (with consultation).
- **Cross-module contracts.** API shape changes that affect multiple modules.
- **Public roadmap.** Contributors propose; platform team prioritizes.
- **Backwards-compatibility commitments.** Promises to consumers can only be made by the platform team.
- **Procurement-affecting choices.** A new vendor adapter that requires procurement is not a contributor decision.

These are not areas where contributions are unwelcome — they're areas where the decision authority is clear.

## Plain-English Guide to Inner-Source Terms

- **Inner source.** Treating internal repos like open-source projects: shared, contributed-to, reviewed in the open.
- **Maintainer / Trusted Committer / Contributor.** Three levels of responsibility for a repo. Maintainers set direction; trusted committers review; contributors propose.
- **OSPO (Open Source Program Office).** A team that governs open-source and inner-source practice across an organization.
- **CONTRIBUTING.md.** The file in a repo that says how to contribute. Required for inner-source repos.
- **Roadmap.** What the maintainers plan to build, what they'll accept contributions for, what's out of scope.

## Related

- [Phase 5 overview](/phase-5-platform/) — the modules contributors work on
- [ADR Template](/phase-4-dev-stack/adr-template/) — the format for design discussions
- [IDP and Module Registry](/phase-5-platform/idp-and-registry/) — where modules and roadmaps are discoverable
- [Track 4 — Developer Upskilling](/phase-2-education/track-4-developers/) — where developers learn the contribution norms

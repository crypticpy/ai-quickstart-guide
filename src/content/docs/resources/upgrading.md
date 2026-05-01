---
title: Upgrading the Guide
description: How an agency that forked the guide on an earlier version brings in fixes, new content, and structural changes from a later release without losing local edits.
sidebar:
  order: 16
---

The AI Quickstart Guide ships as a GitHub template repository. When you click "Use this template," your fork is a snapshot of the guide at that moment — not a live link back to upstream. Versions move forward; your fork stays where you forked it unless you pull updates in. This page is the upgrade procedure.

## What versions mean here

Each release of the guide is tagged in the upstream repo (`v0.1.0`, `v0.2.0`, `v1.0.0`). Releases follow [semantic versioning](https://semver.org/) with these conventions:

- **Major (v1.0.0 → v2.0.0):** Breaking changes - directory restructure, removed pages, renamed phases, changed content collection schema. Manual review required.
- **Minor (v0.1.0 → v0.2.0):** New content (additional pages, expanded variants, new templates). Generally additive; fork can pull most changes cleanly.
- **Patch (v0.1.0 → v0.1.1):** Bug fixes, link corrections, typo fixes, dependency bumps. Should pull cleanly.

Each release ships with a `CHANGELOG.md` entry describing what changed and what fork maintainers should review.

## Recommended fork posture

Before your first edit to the fork, do two things:

1. **Add upstream as a remote.** From your fork's repo: `git remote add upstream https://github.com/<upstream-org>/ai-quickstart-guide.git`. This is what lets you pull future versions in.
2. **Decide your customization style.** Two patterns work well:
   - **Light fork:** You edit only the agency-specific values (agency name, logo, AUP placeholders, jurisdiction column in the legislative compliance matrix). Keep all framework content vanilla. Easy upgrades; you mostly take upstream wholesale.
   - **Heavy fork:** You add agency-specific phases, internal templates, or jurisdiction-specific governance. Upgrades become a merge exercise; budget time for them.

The light-fork pattern is the recommendation for most agencies. If you find yourself wanting heavy customization, prefer adding new pages alongside upstream rather than editing upstream pages — additive changes survive upgrades.

## Patch upgrades (bug fixes)

```bash
git fetch upstream
git checkout main
git merge upstream/v0.1.1
# resolve conflicts (rare for patch releases)
pnpm install
pnpm build
```

If `pnpm build` passes with no broken-link warnings, push and redeploy. Patch upgrades are safe to apply same-day.

## Minor upgrades (new content)

```bash
git fetch upstream --tags
git checkout main
git checkout -b upgrade/v0.2.0
git merge upstream/v0.2.0
```

Conflicts are most likely in `astro.config.mjs` (sidebar order may have changed), `package.json` (dependency bumps), and `src/content/docs/index.mdx` (home page may have new sections). Resolve them by taking upstream's structure and re-applying your agency-specific values.

After merging:

1. Read the upstream `CHANGELOG.md` entry for v0.2.0.
2. Run `pnpm build` and check the link-check output.
3. Check the [pick-your-path](/getting-started/pick-your-path/) page — variant content is the area most likely to have substantive changes.
4. Open a PR for internal review before merging to your fork's main.

## Major upgrades (breaking)

Major version upgrades (v1.0.0 → v2.0.0) require a real review session, not a same-afternoon merge. The upstream `CHANGELOG.md` will name what broke. Common cases:

- **Directory rename.** A phase folder may move (e.g., `phase-2-education/` → `phase-2-culture/`). Internal links, sidebar config, and any agency-added pages inside the renamed folder need updating.
- **Schema change.** Content frontmatter requirements may have changed (a new required field). The build will fail loudly until every page conforms.
- **Component API change.** If your fork embeds upstream Preact components, their props may have changed.

Recommended approach for major upgrades:

1. **Branch first.** Never merge a major upstream release directly to main.
2. **Read the migration notes** in upstream's release notes. Major releases ship a `MIGRATION.md` describing each breaking change.
3. **Run a side-by-side build.** Keep your fork's last passing build available so you can compare what your readers see before/after.
4. **Update jurisdiction-specific content last.** Get the framework re-building first, then re-apply the agency overrides.

If the major upgrade represents a structural change you don't want to take (e.g., the upstream removes a section you depend on), staying on the previous major version is supported. Patch and minor releases continue on the previous major line for at least 12 months after a new major ships.

## Tracking what you've taken

Add a one-line note to your fork's `CHANGELOG.md` each time you pull upstream:

```
## [Internal] 2026-09-15
Pulled upstream v0.2.0. Conflicts: agency name in index.mdx (kept ours).
Reviewed: pick-your-path variant table; legislative-compliance jurisdiction column.
```

This is what makes the next upgrade tractable — the maintainer in 2027 can see what was customized and what was taken vanilla.

## When to skip an upgrade

- **You are mid-rollout of a phase.** Don't pull upstream changes to a phase the team is actively training on. Wait for the rollout to finish, then upgrade.
- **The upgrade reverts a customization you depend on.** Upstream may remove a deliverable you've built workflows around. Stay on your version; reconcile during the next quarterly review.
- **You're inside a regulatory deadline.** If you've got a state legislative-compliance deadline this month, do not introduce drift. Upgrade after.

## Related

- [Frameworks Cited](/resources/frameworks-cited/) — the upstream sources whose updates may drive future releases
- [Quarterly Report Template](/resources/quarterly-report/) — where to log what you upgraded each quarter
- [Pick Your Path](/getting-started/pick-your-path/) — the page most affected by minor upstream releases

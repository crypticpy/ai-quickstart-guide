# Release Readiness Audit

Date: 2026-05-01

Scope: public repository readiness for outside contributors, agencies that want to clone or fork the guide, and maintainers preparing tagged releases. This is a repository and release-process audit, not a fresh content accuracy audit of every guide page.

Implementation status: the five-pass cleanup recommended in this audit was implemented after the findings pass. Keep the findings below as the audit record; use `CHANGELOG.md`, `RELEASING.md`, and the current validation scripts for the active release gate.

## Executive Summary

The repository is close to being usable as an open public template: the site builds, internal links pass, public deck sources are present, and the dual-license intent is clear. The main release blockers are not content quality problems. They are public-facing repository readiness gaps: stale README language, missing community files, incomplete version/release artifacts, incomplete CI coverage for new asset types, and a print-export script that currently leaks raw Astro component tags into `exports/playbook.md`.

The strongest recommendation is to treat release readiness as a focused cleanup sprint before tagging the first public release. The fixes are straightforward and mostly documentation/workflow work, with a small script hardening pass.

## Validation Results

Passed:

- `npm run check` passed.
- `npm run build` passed: 107 pages built.
- `npm run lint:links` passed: 106 docs files checked against 138 routes.
- `npm run export:playbook` completed and wrote `exports/playbook.md`.
- `dist/deck-sources` contains 29 Markdown deck source files.
- No tracked `dist/`, `.astro/`, `node_modules/`, `exports/`, `.DS_Store`, or generated local artifacts.

Not fully validated:

- External link checking was not run locally because `lychee` is not installed in this environment. The GitHub workflow uses `lycheeverse/lychee-action`, but local release validation should document that external link validation runs in CI.
- Python lab tests were not run because neither `python3 -m pytest` nor `python3.12 -m pytest` is available. Installing sample dependencies would require a separate dependency setup pass.

Observed export issue:

- `exports/playbook.md` still contains raw component tags such as `<PhaseBanner ... />`, `<AtAGlance ... />`, `<FreshnessNote ... />`, and `<Takeaways ... />`. The export workflow completes, but the generated Markdown is not fully print-safe yet.

## Priority Findings

### P0 - Fix Before Public Release

1. **README is stale and undersells the current repo.**
   - Evidence: `README.md:16-18` still describes `templates/`, `diagrams/`, and `code-samples/` as reserved or placeholder areas, even though `code-samples/` now contains substantial Track 4 labs and `public/deck-sources/` contains 29 deck sources.
   - Evidence: `README.md:21` points to planning documents in the parent directory, which are not part of a normal public clone.
   - Evidence: `README.md:81` says "Pre-MVP scaffold. Sprint 1 of 6."
   - Impact: New contributors and agencies will misunderstand what is real, what is scaffold, and how to use the repo.
   - Recommended fix: Rewrite README around the current repo: live guide, deck-source library, code labs, templates, offline exports, contribution paths, and current status.

2. **Release/version promises are inconsistent.**
   - Evidence: `package.json:4` says version `0.1.0`.
   - Evidence: `src/content/docs/resources/index.md:38` and `src/content/docs/resources/frameworks-cited.md:122` cite "Version 1.1 (Expert Panel Revisions)."
   - Evidence: `git tag --list` returned no local release tags.
   - Evidence: `src/content/docs/resources/upgrading.md:12-18` describes tagged `v1.0`, `v1.1`, `v2.0` releases and `CHANGELOG.md`, but the repo does not contain a `CHANGELOG.md`.
   - Impact: Agencies following the upgrade guide or citation guidance cannot tell what release they have.
   - Recommended fix: Decide the first public release version, add `CHANGELOG.md`, align `package.json`, citation text, and upgrade examples, and avoid referencing release artifacts that do not exist yet.

3. **Print/offline export is not truly print-safe.**
   - Evidence: `scripts/build-playbook.mjs:51-54` only removes self-closing component tags and Starlight card/tabs wrappers. It does not handle all custom components.
   - Evidence: `exports/playbook.md` contains raw `<PhaseBanner ... />`, `<AtAGlance ... />`, `<FreshnessNote ... />`, and `<Takeaways ... />` output after a successful export.
   - Impact: Release PDF/DOCX artifacts may contain raw site markup or lose important summary content.
   - Recommended fix: Extend `build-playbook.mjs` fallbacks for `PhaseBanner`, `AtAGlance`, `FreshnessNote`, `Takeaways`, and any other custom components used in docs. Add a validation check that fails if raw component tags remain in `exports/playbook.md`.

4. **Community and contribution infrastructure is incomplete.**
   - Evidence: No `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `.github/PULL_REQUEST_TEMPLATE.md`, or `.github/ISSUE_TEMPLATE/*` files were found.
   - Evidence: `CONTRIBUTING.md` is useful but short; it does not distinguish content fixes, deck-source contributions, code-sample contributions, site-code changes, source/citation updates, or accessibility expectations.
   - Impact: Outside contributors will not know where to file security issues, how to structure PRs, or how maintainers triage changes.
   - Recommended fix: Add standard community files and expand contribution guidance by contribution type.

5. **CI does not cover several release-critical asset types.**
   - Evidence: `.github/workflows/pr-build.yml:5-13` omits `public/**`, `code-samples/**`, `AI_DECK_SOURCE_*.md`, license files, and community files.
   - Evidence: `.github/workflows/link-check.yml:5-10` omits `public/deck-sources/**`, license files, and most top-level Markdown files.
   - Evidence: `.github/workflows/link-check.yml:34` only gives Lychee `src/content/**/*.md`, `src/content/**/*.mdx`, `README.md`, and `CONTRIBUTING.md`.
   - Impact: A PR can break deck-source links, public templates, code samples, or release docs without running the main validation.
   - Recommended fix: Update workflow path filters and Lychee inputs. Add checks for deck-source structure and export sanity.

### P1 - Strongly Recommended Before Tagging

6. **Repository metadata needs public-template polish.**
   - Evidence: `package.json:7` references `LICENSE.md`, but the repo file is `LICENSE`.
   - Evidence: `package.json` lacks `repository`, `homepage`, `bugs`, `keywords`, and `author/contributors` metadata.
   - Evidence: no `.nvmrc` or `.node-version` file is present even though `package.json:18-20` requires Node `>=22.12.0`.
   - Impact: GitHub/npm tooling and new contributors get weaker setup signals.
   - Recommended fix: Correct the license field text, add metadata, and add `.nvmrc` or `.node-version`.

7. **Hardcoded upstream GitHub links make forks feel less owned.**
   - Evidence: `astro.config.mjs:33` and `astro.config.mjs:38` hardcode `https://github.com/crypticpy/ai-quickstart-guide`.
   - Evidence: `src/content/docs/index.mdx:65-66` and `src/content/docs/resources/statistics-and-sourcing.md` link directly to the upstream repo.
   - Impact: For public upstream this is fine, but agencies cloning or templating the repo may not realize how to point edit links and issue links at their fork.
   - Recommended fix: Keep upstream defaults, but document `REPO_URL`, `SITE_URL`, and `BASE_PATH` configuration or add environment-variable support for Starlight social/edit links.

8. **Code-sample solution docs still contain learner-facing TODO language.**
   - Evidence: `code-samples/track-4/lab-8/solution/civic-assistant/DEPLOYMENT.md:11`, `17-19`, and `29` contain TODO placeholders inside the solution handoff.
   - Evidence: `code-samples/track-4/lab-7/solution/README.md:23-37` still says "What you will fill in" and "You make them pass" inside the solution directory.
   - Impact: Reference solutions look unfinished to public learners and contributors.
   - Recommended fix: Convert solution READMEs to reference-solution language, keep TODOs only in starter directories, and make handoff templates explicit when placeholders are intentionally local.

9. **Model IDs in code samples are still more specific than the current teaching guidance.**
   - Evidence: `code-samples/track-4/common/llm_client.py`, Lab 4.4, Lab 4.6, Lab 4.7, and Lab 4.8 use concrete default model strings such as `claude-sonnet-4-20250514` and `gpt-4o-mini`.
   - Impact: The guide text now teaches model IDs as provider-maintained slugs that change over time, but some code samples still encode dated defaults. That creates maintenance churn and can confuse learners.
   - Recommended fix: Move sample defaults to environment variables or placeholder/example names where tests permit. If a live default is needed for classroom convenience, isolate it in one config file and label it as an example that must be checked against provider docs.

10. **Deck-source assets are linked but not centrally discoverable.**
    - Evidence: 29 deck-source files exist and are linked from relevant pages, but there is no public deck-source index page in the site or README.
    - Impact: Users who want "all presentation sources" cannot find the library without knowing which phase page to open.
    - Recommended fix: Add a Resources page or README section listing deck sources by audience/use case, and link to `AI_DECK_SOURCE_GUIDE.md` for contributors.

11. **Release workflow and offline pack docs need a clearer release operator path.**
    - Evidence: `.github/workflows/export-playbook.yml` supports release and manual dispatch, but README does not explain how maintainers tag a release, verify artifacts, or recover if Pandoc/TeX fails.
    - Evidence: `src/content/docs/resources/offline-pack.md` assumes release artifacts exist.
    - Impact: Contributors can read about artifacts that may not exist until the first release is cut.
    - Recommended fix: Add `RELEASING.md` or a README "Maintainer release checklist" section with tag format, validation commands, release artifact expectations, and rollback notes.

### P2 - Nice Polish Before or Shortly After First Release

12. **Dependency maintenance automation is absent.**
    - Evidence: no `.github/dependabot.yml` or Renovate config found.
    - Impact: Astro/Starlight and GitHub Actions updates may drift without visibility.
    - Recommended fix: Add Dependabot for npm and GitHub Actions on a weekly cadence.

13. **External link validation is CI-only and not documented for local release checks.**
    - Evidence: `lychee` is not available locally in this environment; local `npm run lint:links` checks only internal routes.
    - Impact: Maintainers may think local link validation covers external source rot.
    - Recommended fix: Document that external links are checked in GitHub Actions, or add an npm script that runs Lychee through a documented install path.

14. **Top-level internal audit/planning files are outside the public repo root.**
    - Evidence: the working parent directory contains `PHASE_*_AUDIT.md`, `AI_Quickstart_PRD.md`, and related planning docs, but the Git repo root is `ai-quickstart-guide/`.
    - Impact: README references to parent planning files are wrong for public clone users, and it is unclear which planning docs should be public.
    - Recommended fix: Either move appropriate planning docs into a public `docs/` or `planning/` directory, or remove references from public-facing docs.

## Recommended Implementation Plan

### Pass 1 - Public Entry Point Cleanup

- Rewrite `README.md` for current state.
- Fix license references in `LICENSE` and `package.json`.
- Add `.nvmrc` or `.node-version`.
- Add package metadata.
- Decide and align first public release version language across `package.json`, citation pages, README, and upgrade docs.

### Pass 2 - Community Health Files

- Add `CODE_OF_CONDUCT.md`.
- Add `SECURITY.md`.
- Add `SUPPORT.md`.
- Add `.github/PULL_REQUEST_TEMPLATE.md`.
- Add issue templates for bug report, content correction, broken link/source update, deck-source improvement, code-sample issue, and feature/resource request.
- Expand `CONTRIBUTING.md` with contribution-type-specific guidance.

### Pass 3 - CI and Release Hardening

- Expand PR build path filters to include `public/**`, `code-samples/**`, top-level guide docs, license files, and community files.
- Expand link-check workflow inputs to include deck sources and public-facing Markdown outside `src/content`.
- Add `npm run check:export` to build `exports/playbook.md` and fail on raw component tags.
- Add `npm run check:deck-sources` to validate slide structure if we want deck-source quality protected by CI.
- Add `RELEASING.md` with maintainer commands and artifact expectations.

### Pass 4 - Asset Discoverability

- Add a public Deck Sources index page under Resources.
- Add README sections for deck sources, code samples, templates, and offline artifacts.
- Update Resources index to link to the Deck Sources page.
- Clarify that public files under `/deck-sources/` are source material for AI presentation tools, not finished decks.

### Pass 5 - Code Sample Polish

- Remove solution-directory TODO language where it is not intentionally a local handoff placeholder.
- Fill or reframe Lab 4.8 solution `DEPLOYMENT.md`.
- Review concrete model ID defaults and move them to explicit example/config surfaces.
- Add a documented sample-test strategy for maintainers: which offline tests should pass without API keys, which tests require live credentials, and which are intentionally learner-failing in starter directories.

## Release Gate Recommendation

Do not tag the first public release until P0 findings are fixed and the following commands pass:

```bash
npm run check
npm run build
npm run lint:links
npm run export:playbook
```

After adding export/deck-source validation scripts, include them in the release gate as well. For code samples, add a separate documented smoke-test pass rather than trying to run every starter directory as if it should pass.

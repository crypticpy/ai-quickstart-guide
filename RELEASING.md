# Releasing

This checklist is for maintainers preparing a public release of the AI Quickstart Guide.

## Release Cadence

Use semantic version tags:

- `v0.x.y` for public-preview releases before the guide is considered stable.
- `v1.0.0` for the first stable public release.
- Patch releases for typo, link, dependency, workflow, and small bug fixes.
- Minor releases for new pages, templates, deck sources, or code labs.
- Major releases for breaking structure changes that affect forks.

## Before Tagging

1. Confirm `CHANGELOG.md` has an entry for the release.
2. Confirm `package.json` has the same version number without the `v` prefix.
3. Run:

```bash
npm install
npm run check
npm run check:deck-sources
npm run check:export
npm run build
npm run lint:links
```

4. Review `exports/playbook.md` for obvious print-export issues.
5. Confirm GitHub Actions link-check workflow is green, including external links.
6. Confirm no secrets, generated caches, or local artifacts are staged:

```bash
git status --ignored -sb
```

## Tag and Release

```bash
git checkout main
git pull --ff-only
git tag v0.1.0
git push origin v0.1.0
```

Create a GitHub Release from the tag and paste the matching `CHANGELOG.md` entry into the release notes.

Publishing the GitHub Release triggers `.github/workflows/export-playbook.yml`, which builds and attaches:

- `ai-quickstart-guide.pdf`
- `ai-quickstart-guide.docx`
- `ai-quickstart-offline-pack.zip`

The manual workflow dispatch path uploads the same files as a workflow artifact instead of attaching them to a release.

## After Publishing

1. Confirm the Pages deploy completed.
2. Download the release artifacts and spot-check:
   - PDF opens and has a table of contents.
   - DOCX opens and is editable.
   - Offline pack contains `playbook.md`, PDF, and DOCX.
3. Open the hosted site and check:
   - home page
   - readiness assessment
   - quickstart checklist
   - deck-source link from one Phase 2 page
   - one Track 4 lab page
4. If artifacts failed, fix on `main`, publish a patch tag, and mark the failed release as superseded.

## Code-Sample Smoke Tests

Do not run every starter directory as a release gate. Starters intentionally fail until learners complete them.

Recommended release smoke pass:

- Run offline tests in solution directories that do not need live model credentials.
- For live-model labs, confirm README instructions identify required credentials and expected costs.
- Never commit cassettes, virtual environments, Chroma stores, model downloads, API keys, or local logs unless the lab explicitly documents a synthetic fixture.

## External Link Checks

Local `npm run lint:links` checks internal site routes and public assets. External links are checked by the GitHub Actions link-check workflow. If you need local external checks, install Lychee and mirror `.github/workflows/link-check.yml`.

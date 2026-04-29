# Contributing

This guide is built to be improved by the agencies that use it. PRs from anyone — government, civic tech, academia — are welcome.

## What we accept

- **Content fixes:** typos, broken links, factual corrections, clearer wording
- **New examples:** real agency case studies (with permission), additional risk-tier examples, sample policies
- **New templates / interactive widgets:** any tool that helps an agency move through a phase faster
- **Translations:** the curriculum is currently English-only; translations welcomed
- **Bug fixes** in the site code or build pipeline

## What we redirect

- Agency-specific customization (your fork is the right place for that)
- Vendor recommendations (the guide is stack-agnostic by design — the RAD reference implementation is the canonical concrete example)
- Anything that turns the guide into legal advice (we describe frameworks, agencies retain counsel)

## How

1. Fork → branch off `main`
2. Make your change. For content edits, run `npm run dev` and confirm the page renders.
3. Open a PR with a clear title and a short description of what changed and why.
4. The link-check workflow runs on every PR. Fix any broken links before merge.
5. Two maintainer approvals merge. We aim to review within 5 business days.

## Conventions

- **File naming:** kebab-case (`risk-classification.md`, never `RiskClassification.md`)
- **Directory naming:** kebab-case, prefixed with phase number (`phase-1-governance/`)
- **Commit messages:** conventional prefixes (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- **Diagrams:** Mermaid source committed alongside a PNG export for PDF compatibility
- **Citations:** when referencing frameworks (NIST, OMB, etc.), cite the specific versioned document, not a generic page

## Code of conduct

By participating you agree to act in good faith and treat other contributors with respect. Harassment, discrimination, or bad-faith engagement is grounds for removal.

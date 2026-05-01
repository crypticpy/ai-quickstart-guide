# Contributing

The AI Quickstart Guide is built to be improved by the agencies, civic technologists, researchers, and public-sector practitioners who use it. Pull requests are welcome.

This guide is advisory. Contributions should help agencies make practical, reviewable progress without implying that this repository is a legal authority, procurement authority, or vendor certification program.

## What We Accept

- **Content fixes:** typos, broken links, stale sources, factual corrections, clearer wording, and accessibility improvements.
- **Public-sector examples:** real agency examples only when they are public, permissioned, anonymized, or fully synthetic.
- **Templates and tools:** artifacts that help agencies move through a phase faster.
- **Deck sources:** AI-importable Markdown files that help agencies create briefings, trainings, or sponsor presentations.
- **Code-sample improvements:** fixes to Track 4 labs, clearer starter instructions, better tests, or safer reference implementations.
- **Translations:** translated guide content, with a note about the source version translated.
- **Site fixes:** Astro/Starlight, Preact, CSS, build, deploy, and release workflow improvements.

## What We Redirect

- **Agency-specific customization.** Use your fork for local names, logos, policies, and internal-only pages.
- **Vendor recommendations.** The guide is stack-agnostic and vendor-neutral by design.
- **Legal advice.** We describe frameworks and templates; agencies retain counsel.
- **Unverified case studies.** If an example describes a real agency, provide a public source or written permission.
- **Secrets or private data.** Do not include credentials, internal URLs, private procurement records, or resident/staff data.

## Contribution Types

### Content Pages

Guide pages live in `src/content/docs/`. Use Markdown or MDX depending on whether the page embeds interactive components.

Before opening a PR:

1. Run `npm run dev`.
2. Open the changed pages.
3. Confirm headings, links, tables, callouts, and embedded components render correctly.
4. If you update a cited claim, update the affected source or review note on the page.

### Deck Sources

Deck-source Markdown lives in `public/deck-sources/`. These are not finished decks. They are source files a user can paste or upload into an AI presentation tool.

Follow `AI_DECK_SOURCE_GUIDE.md`:

- one Markdown file per deck
- slide breaks with `---`
- each slide starts with `# Slide N: Title`
- include `Speaker notes:`, `Image guidance:`, and `Evidence and review notes:`
- do not invent legal claims, statistics, agency facts, approvals, or vendor claims
- preserve local placeholders in square brackets

### Code Samples

Track 4 labs live in `code-samples/track-4/`.

- Starter directories may intentionally include TODOs and failing tests.
- Solution directories should be runnable reference implementations.
- Do not commit real API keys, generated caches, virtual environments, Chroma stores, or model downloads.
- Prefer synthetic data. If a dataset resembles a real public agency record, state that it is synthetic or cite the source.
- Keep provider-specific code behind adapters or configuration where practical.

If a code-sample PR changes behavior, include the exact test command you ran and whether it required live model credentials.

### Site Code

Components live in `src/components/`, helper code in `src/lib/`, CSS in `src/styles/`, and build/export scripts in `scripts/`.

Run:

```bash
npm run check
npm run build
npm run lint:links
```

If you change print/export behavior, also run:

```bash
npm run check:export
```

## Pull Request Process

1. Fork the repo and branch off `main`.
2. Make a focused change.
3. Run the relevant checks.
4. Open a PR with:
   - what changed
   - why it changed
   - affected pages or files
   - validation commands run
   - screenshots for visible UI changes
5. Fix failing CI checks.

Maintainers aim to review within 5 business days. Larger content or policy changes may take longer because source review matters.

## Conventions

- **File naming:** kebab-case (`risk-classification.md`, not `RiskClassification.md`).
- **Directory naming:** kebab-case, prefixed with phase number where applicable (`phase-1-governance/`).
- **Commit messages:** conventional prefixes such as `feat:`, `fix:`, `docs:`, `refactor:`, and `chore:`.
- **Citations:** cite versioned source documents when the page depends on a framework, statute, memo, or standard.
- **Tone:** practical, plain-language, public-sector appropriate, and clear that local review decides what is binding.
- **Accessibility:** use descriptive link text, readable tables, meaningful headings, and image guidance that avoids implying fictional agency authority.

## Review Standards

Maintainers look for:

- accuracy and source traceability
- fit for small, standard, and large agencies
- vendor neutrality
- clear local-review caveats for law, procurement, labor, privacy, security, and accessibility
- testability for code changes
- no secrets or private data
- no unnecessary complexity

## Code of Conduct

By participating, you agree to follow `CODE_OF_CONDUCT.md`.

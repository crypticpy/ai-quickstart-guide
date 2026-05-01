# AI Quickstart Guide

> A practical, public-sector AI adoption playbook that agencies can use as-is, fork for their own portal, or contribute back to.

The AI Quickstart Guide is an Astro/Starlight documentation site for government agencies moving from "we want to use AI" to a governed, trained, supported first production AI application. It includes phase guidance, interactive browser-only tools, presentation source files, Track 4 code labs, templates, and release workflows for offline PDF/DOCX exports.

The guide is advice and implementation support, not legal authority. Agencies should localize policies, procurement language, labor messaging, and legal references through their normal review process.

## What's in Here

| Path | What lives there |
| --- | --- |
| `src/content/docs/` | All guide pages: getting started, six phases, resources, templates, case studies, and reference material. |
| `src/components/` | Interactive tools such as the Readiness Assessment, AUP wizard, ROI calculator, intake form, and project selector. |
| `public/deck-sources/` | AI-importable Markdown source files for kickoff decks, training sessions, briefings, sponsor reports, and launch materials. |
| `public/templates/` | Downloadable static templates such as the budget CSV. |
| `code-samples/track-4/` | Developer upskilling labs with starter and solution code for provider wrappers, prompting, RAG, agents, AI-assisted development, testing, reusable modules, and a capstone service. |
| `scripts/` | Local validation and export helpers. |
| `.github/workflows/` | CI, GitHub Pages deploy, external link checks, and release export workflows. |
| `AI_DECK_SOURCE_GUIDE.md` | Contributor guide for writing deck-source Markdown that works across AI presentation tools. |
| `AI_DECK_SOURCE_INVENTORY.md` | Inventory of current presentation source files and where they are linked in the guide. |

## Use the Guide

The fastest path is to read the hosted site, run the Readiness Assessment, and follow the Quickstart Checklist. If you want an agency-owned copy, use the repo as a template or fork it.

To deploy your own GitHub Pages copy:

1. Click **Use this template** on the GitHub repo page, or fork the repo.
2. In the new repo, open **Settings -> Pages** and set the source to **GitHub Actions**.
3. Push to `main`. The Pages workflow builds the site and publishes it to `https://<your-org>.github.io/<your-repo>/`.
4. Optional: set a custom domain in **Settings -> Pages**.

For agencies that cannot use GitHub Pages, the built `dist/` folder can be served from any static host, including Cloudflare Pages, Netlify, Vercel, Azure Static Web Apps, S3/CloudFront, or an internal web server.

## Run Locally

Requirements:

- Node.js 22.12 or newer
- npm

```bash
git clone https://github.com/crypticpy/ai-quickstart-guide.git
cd ai-quickstart-guide
npm install
npm run dev
```

The dev server runs at `http://localhost:4321/ai-quickstart-guide/` by default.

Useful commands:

```bash
npm run check
npm run build
npm run lint:links
npm run export:playbook
```

For a custom fork or deployment path, set these environment variables before building:

```bash
SITE_URL=https://<your-org>.github.io
BASE_PATH=/<your-repo>
REPO_URL=https://github.com/<your-org>/<your-repo>
```

## Deck Sources

The guide includes Markdown files designed to be pasted or uploaded into AI presentation tools such as Gamma, Beautiful.ai, ChatGPT, Claude, PowerPoint Copilot, or other deck-generation workflows. They are source material for first-draft decks, not finished presentations.

Start with the [Deck Sources resource page](src/content/docs/resources/deck-sources.md) or browse `public/deck-sources/`. When contributing new deck sources, follow `AI_DECK_SOURCE_GUIDE.md`.

## Code Samples

Track 4 developer labs live in `code-samples/track-4/`. Most labs include:

- `starter/` for learner work
- `solution/` for reference implementations
- local README files with test and run commands

Starter directories intentionally contain TODOs and failing tests. Solution directories should be runnable reference material and should not contain unfinished learner TODOs unless the file is explicitly a local handoff template.

## Offline Exports

The release workflow can generate:

- `ai-quickstart-guide.pdf`
- `ai-quickstart-guide.docx`
- `playbook.md`
- `ai-quickstart-offline-pack.zip`

Maintainers can build the print-safe Markdown source locally with:

```bash
npm run export:playbook
```

Release operators should follow `RELEASING.md`.

## Contributing

Contributions are welcome from government, civic tech, academia, public-interest technologists, and agencies adapting the guide. Start with `CONTRIBUTING.md`.

Good first contributions include:

- fixing typos, broken links, or stale source references
- clarifying instructions for smaller agencies without dedicated IT departments
- adding tested code-sample improvements
- improving deck-source Markdown
- adding accessible templates or completed examples

## Licensing

This repository uses a dual-license model:

- **Code** is MIT licensed. See `LICENSE-CODE`.
- **Written content** is CC BY-SA 4.0 licensed. See `LICENSE-CONTENT`.

The top-level `LICENSE` file explains which paths fall under each license.

## Status

Public preview, version `0.1.0`. The guide is usable now, but release-readiness work is ongoing. See `CHANGELOG.md`, `RELEASING.md`, and `RELEASE_READY_AUDIT.md` for current release notes and readiness tracking.

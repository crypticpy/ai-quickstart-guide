# AI Quickstart Guide

> A 12-month playbook for government agencies to build a modular AI platform and deploy their first production AI application — with the governance, education, and infrastructure to sustain it.

This repository is the source of an interactive microsite that any government agency can fork, deploy, and use as their internal AI adoption portal. It is also a downloadable playbook (PDF/DOCX) for offline use.

---

## What's in here

| Path                 | What lives there                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `src/content/docs/`  | All written content — phase guides, session materials, templates, references              |
| `src/components/`    | Interactive widgets (Readiness Assessment, AUP wizard, ROI calculator, etc.)              |
| `src/assets/`        | Logos, diagrams, and static assets imported by pages                                      |
| `templates/`         | Reserved for generated DOCX/PDF artifacts; currently a scaffold, not authored source      |
| `diagrams/`          | Reserved for standalone Mermaid exports; current diagrams live with authored content/assets |
| `code-samples/`      | Reserved placeholders for expanded reference code; current samples are embedded in guide pages or linked to the RAD platform repo |
| `.github/workflows/` | CI: build & deploy site, link-check, generate DOCX/PDF on release                         |

The full design is documented in three planning documents in the parent directory: `AI_Quickstart_PRD.md`, `AI_Quickstart_Curriculum_Map.md`, `AI_Quickstart_Gantt_Dependencies.md`.

---

## Deploy your own copy

The fastest path for an agency:

1. Click **"Use this template"** on the GitHub repo page → create a new repo under your agency's org.
2. In the new repo's **Settings → Pages**, set the source to **GitHub Actions**.
3. Push any change to `main`. The site builds and publishes to `https://<your-org>.github.io/<your-repo>/` within ~2 minutes.
4. Optional: configure a custom domain in **Settings → Pages**.

For agencies whose IT blocks GitHub Pages, the site can also be deployed to Cloudflare Pages, Netlify, Vercel, or served from any static-file host.

---

## Run locally

You need Node.js 22.12+ and one of npm / pnpm / yarn.

```bash
git clone https://github.com/crypticpy/ai-quickstart-guide.git
cd ai-quickstart-guide
npm install
npm run dev
```

The dev server runs at `http://localhost:4321/ai-quickstart-guide/`.

To build a static copy you can serve from any web host or preview with a local static server:

```bash
npm run build
npx serve dist
```

---

## How content is authored

All content is plain Markdown / MDX in `src/content/docs/`. MDX pages can embed interactive components (forms, calculators, decision trees) inline. The site is built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build).

Style and contribution rules: see `CONTRIBUTING.md`.

---

## Licensing

Dual-licensed:

- **Code** (components, configuration, build scripts) — MIT (`LICENSE-CODE`)
- **Content** (guides, templates, written material) — CC BY-SA 4.0 (`LICENSE-CONTENT`)

See `LICENSE` for which path applies where.

---

## Status

Pre-MVP scaffold. Sprint 1 of 6. See `AI_Quickstart_Gantt_Dependencies.md` for the production schedule.

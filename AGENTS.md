# Repository Guidelines

## Project Structure & Module Organization

This repository is an Astro/Starlight documentation site for the AI Quickstart Guide. Authored guide pages live in `src/content/docs/`, grouped by start pages, phases, and resources. Interactive widgets are in `src/components/`, shared browser helpers in `src/lib/`, styles in `src/styles/`, static files in `public/`, and custom content plugins in `src/plugins/`. Supporting samples and templates live in `code-samples/`, `diagrams/`, and `templates/`. Build/export automation is in `scripts/`; GitHub Actions are in `.github/workflows/`.

## Build, Test, and Development Commands

- `npm install` installs dependencies. Use Node `>=22.12.0`.
- `npm run dev` starts the local Astro server at `http://localhost:4321/ai-quickstart-guide/`.
- `npm run check` runs strict TypeScript checks for components and helpers.
- `npm run lint:links` validates internal documentation routes.
- `npm run export:playbook` generates the offline playbook export.
- `npm run build` builds the static site into `dist/`.

## Coding Style & Naming Conventions

Use TypeScript/TSX for interactive components and Markdown/MDX for documentation. Follow the existing two-space indentation in JSON, config, and TSX. Name content files and directories in kebab-case, such as `risk-classification.mdx` and `phase-3-infrastructure/`. Use PascalCase for components (`AgencyRouteChooser.tsx`) and camelCase for helpers (`printDocument.ts`). Keep user-facing copy direct and accessible for municipal teams with mixed technical depth.

## Testing Guidelines

There is no unit test suite yet. Before committing, run `npm run check`, `npm run lint:links`, and `npm run build`. For UI changes, inspect the affected page in the dev server at desktop and mobile widths. Verify selected states, export buttons, MDX components, and Mermaid diagrams still render correctly.

## Commit & Pull Request Guidelines

Git history uses conventional prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, and `chore:`. Optional scopes are useful, for example `docs(home): clarify guided route`. Keep commits focused on one logical change.

Pull requests should include the purpose, affected pages/components, verification commands, linked issues when available, and screenshots for visual changes. Do not merge changes that fail build or link checks.

## Security & Configuration Tips

Do not commit agency secrets, credentials, analytics tokens, or private deployment settings. Keep licensing boundaries clear: code is MIT, written guide content is CC BY-SA 4.0.

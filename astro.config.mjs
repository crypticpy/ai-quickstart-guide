// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import preact from '@astrojs/preact';

const SITE = process.env.SITE_URL ?? 'https://crypticpy.github.io';
const BASE = process.env.BASE_PATH ?? '/ai-quickstart-guide';

export default defineConfig({
  site: SITE,
  base: BASE,
  integrations: [
    preact(),
    starlight({
      title: 'AI Quickstart Guide',
      description:
        'A 12-month playbook for government agencies to build a modular AI platform and deploy their first production AI application.',
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/crypticpy/ai-quickstart-guide',
        },
      ],
      editLink: {
        baseUrl:
          'https://github.com/crypticpy/ai-quickstart-guide/edit/main/',
      },
      lastUpdated: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
      customCss: ['./src/styles/theme.css', './src/styles/readiness.css'],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Welcome', link: '/' },
            { label: 'Readiness Assessment', link: '/getting-started/readiness-assessment/' },
            { label: '90-Day Quickstart', link: '/getting-started/quickstart-checklist/' },
            { label: 'Maturity Model', link: '/getting-started/maturity-model/' },
            { label: 'Glossary', link: '/getting-started/glossary/' },
          ],
        },
        {
          label: 'Phase 1 — Governance',
          autogenerate: { directory: 'phase-1-governance' },
          collapsed: true,
        },
        {
          label: 'Phase 2 — Culture & Education',
          autogenerate: { directory: 'phase-2-education' },
          collapsed: true,
        },
        {
          label: 'Phase 3 — Infrastructure',
          autogenerate: { directory: 'phase-3-infrastructure' },
          collapsed: true,
        },
        {
          label: 'Phase 4 — Dev Stack',
          autogenerate: { directory: 'phase-4-dev-stack' },
          collapsed: true,
        },
        {
          label: 'Phase 5 — Platform',
          autogenerate: { directory: 'phase-5-platform' },
          collapsed: true,
        },
        {
          label: 'Phase 6 — Starter Projects',
          autogenerate: { directory: 'phase-6-starter-projects' },
          collapsed: true,
        },
        {
          label: 'Resources',
          autogenerate: { directory: 'resources' },
          collapsed: true,
        },
      ],
    }),
  ],
});

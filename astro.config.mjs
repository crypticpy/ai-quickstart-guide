// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import preact from '@astrojs/preact';
import mermaid from 'astro-mermaid';
import remarkBaseLinks from './src/plugins/remark-base-links.mjs';

const SITE = process.env.SITE_URL ?? 'https://crypticpy.github.io';
const BASE = process.env.BASE_PATH ?? '/ai-quickstart-guide';

export default defineConfig({
  site: SITE,
  base: BASE,
  markdown: {
    remarkPlugins: [[remarkBaseLinks, { base: BASE }]],
  },
  integrations: [
    // astro-mermaid must come BEFORE starlight so its remark plugin runs
    // before starlight processes the markdown. Renders client-side; auto
    // theme follows the site's `data-theme` attribute (light/dark).
    mermaid({
      theme: 'default',
      autoTheme: true,
      enableLog: false,
      mermaidConfig: {
        fontFamily:
          'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        gantt: {
          titleTopMargin: 28,
          barHeight: 24,
          barGap: 6,
          topPadding: 60,
          leftPadding: 170,
          rightPadding: 30,
          gridLineStartPadding: 12,
          fontSize: 14,
          sectionFontSize: 15,
          numberSectionStyles: 4,
        },
        flowchart: {
          curve: 'basis',
          padding: 16,
        },
        sequence: {
          actorMargin: 60,
          messageFontSize: 14,
        },
      },
    }),
    preact(),
    starlight({
      components: {
        // Override the Search slot to inline our agency-size dropdown
        // alongside it. The wrapper renders Starlight's default Search
        // verbatim plus the dropdown next to it.
        Search: './src/components/HeaderWithPicker.astro',
      },
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
      customCss: [
        './src/styles/theme.css',
        './src/styles/forms.css',
        './src/styles/readiness.css',
        './src/styles/wizard.css',
        './src/styles/tier.css',
        './src/styles/path.css',
      ],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Welcome', link: '/' },
            { label: 'Readiness Assessment', link: '/getting-started/readiness-assessment/' },
            { label: 'Pick Your Path', link: '/getting-started/pick-your-path/' },
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
          collapsed: true,
          items: [
            { label: 'Phase 2 — Culture & Education', link: '/phase-2-education/' },
            { label: 'Change Management Playbook (ADKAR)', link: '/phase-2-education/change-management/' },
            { label: 'Job-Impact Messaging Kit', link: '/phase-2-education/job-impact-messaging/' },
            { label: 'Sustainability Playbook (Months 7–12+)', link: '/phase-2-education/sustainability/' },
            { label: 'AI Use Case Intake Form', link: '/phase-2-education/use-case-intake/' },
            {
              label: 'Track 1 — AI Foundations',
              collapsed: true,
              autogenerate: { directory: 'phase-2-education/track-1-foundations' },
            },
            {
              label: 'Track 2 — Leadership & Strategy',
              collapsed: true,
              autogenerate: { directory: 'phase-2-education/track-2-leadership' },
            },
            {
              label: 'Track 3 — Governance & Compliance',
              collapsed: true,
              autogenerate: { directory: 'phase-2-education/track-3-governance' },
            },
            {
              label: 'Track 4 — Developer Upskilling',
              collapsed: true,
              autogenerate: { directory: 'phase-2-education/track-4-developers' },
            },
            {
              label: 'Track 5 — AI Champions Network',
              collapsed: true,
              autogenerate: { directory: 'phase-2-education/track-5-champions' },
            },
            {
              label: 'Track 6 — Domain Expert Labs',
              collapsed: true,
              autogenerate: { directory: 'phase-2-education/track-6-domain-labs' },
            },
            {
              label: 'Track 7 — Middle Manager Enablement',
              collapsed: true,
              autogenerate: { directory: 'phase-2-education/track-7-middle-managers' },
            },
          ],
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

# AI Deck Source Markdown Guide

Use this guide when creating or revising presentation resources for the AI Quickstart Guide.

The goal is to provide a Markdown source file that a small, medium, or large organization can paste into an AI presentation tool and turn into a useful first draft deck. The file should be more complete than an outline, but less rigid than a finished PowerPoint. It should carry the audience, prompt, slide-by-slide content, speaker guidance, image guidance, and review instructions.

## Research Summary

Several presentation tools support Markdown or structured text, but they do not all interpret the same Markdown extensions.

- Gamma imports text and documents into cards, uses headings to structure imported documents, and recommends `/split` to divide long imported text into separate cards.
- Marp, Deckset, Slidev, reveal.js, and Pandoc all support Markdown-based slide creation and recognize `---` as a common slide or page separator.
- Pandoc can create PowerPoint files from Markdown and supports speaker notes using a notes block.
- Beautiful.ai's AI presentation workflow accepts prompts, outlines, supporting files, documents, PDFs, and links, then turns the source into a slide-by-slide outline before generating slides.
- ChatGPT and Claude can work from uploaded or pasted Markdown-like source. They are useful for generating or converting decks, but they are not a guarantee that a particular deck syntax will import perfectly into a dedicated slide tool.

Sources checked:

- Gamma import docs: https://help.gamma.app/en/articles/11047840-how-can-i-import-slides-or-documents-into-gamma
- Marp overview: https://marp.app/
- Deckset getting started: https://docs.deckset.com/English.lproj/getting-started.html
- Deckset Markdown documentation: https://docs.deckset.com/markdownDocumentation.html
- Pandoc slide shows: https://pandoc.org/demo/example33/10-slide-shows.html
- Pandoc slide structure: https://pandoc.org/demo/example33/10.1-structuring-the-slide-show.html
- Pandoc speaker notes: https://pandoc.org/demo/example33/10.5-speaker-notes.html
- reveal.js Markdown: https://revealjs.com/markdown/
- reveal.js speaker notes: https://revealjs.com/speaker-view/
- Slidev syntax: https://sli.dev/guide/syntax.html
- Beautiful.ai AI presentation docs: https://support.beautiful.ai/hc/en-us/articles/12885226948109-Creating-a-presentation-with-AI
- ChatGPT file uploads: https://help.openai.com/en/articles/8555545-uploading-files-in-chatgpt
- ChatGPT supported files: https://help.openai.com/en/articles/8983675-what-types-of-files-are-supported
- Claude artifacts: https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them

## Standard We Will Use

Use a conservative, vendor-neutral Markdown format:

- One Markdown file per deck.
- Use `---` on its own line, with a blank line before and after, for every slide break.
- Start each slide with `# Slide N: Title`.
- Keep visible slide content simple: short bullets, short callouts, and clear labels.
- Put facilitator guidance under `Speaker notes:` in plain text.
- Put visual guidance under `Image guidance:` in plain text.
- Put data or claim guidance under `Evidence and review notes:` when the slide needs local verification.
- Avoid tool-specific directives unless the file is explicitly marked for that tool.
- Avoid complex tables, nested lists, HTML, Mermaid, custom CSS, or image layout syntax in the deck source.
- Use placeholders in square brackets, for example `[Agency]`, `[program lead]`, `[approved tool]`.

This gives us the best chance of working across Gamma, Beautiful.ai, ChatGPT, Claude, PowerPoint-generation workflows, Pandoc, Marp, Deckset, Slidev, and other Markdown-friendly tools.

## File Placement

When we add downloadable deck sources to the site, use this structure:

```text
public/deck-sources/
  phase-2/
    track-1-foundations/
      session-1-1-what-ai-actually-is.md
      session-1-2-ai-in-government-real-examples.md
    track-2-leadership/
      briefing-2-1-ai-landscape.md
    track-7-middle-managers/
      session-7-1-ai-and-your-team.md
```

Use kebab-case filenames. Match the session or briefing slug when possible.

## Deck Source Template

Start each deck with an instruction block before the first slide. AI tools should treat this as creation guidance, not as a visible slide.

```markdown
# Deck Source: [Track / Session / Briefing Title]

## How to use this file

Paste or upload this Markdown into an AI presentation tool such as Gamma, Beautiful.ai, ChatGPT, Claude, PowerPoint Copilot, or another deck-generation workflow. Ask it to create a first-draft presentation from the slide-by-slide source below.

Before presenting, replace placeholders, verify local policy and legal references, apply agency branding, and review for accessibility.

## Deck instructions

- Audience: [specific audience]
- Session length: [minutes]
- Desired deck length: [number] slides
- Tone: practical, calm, plain-language, public-sector appropriate
- Reading level: accessible to non-specialists
- Format: 16:9 presentation
- Use speaker notes: yes
- Use AI-generated images: optional; do not use images that imply surveillance, fear, job loss, robots replacing people, or fictional government authority
- Do not invent laws, statistics, dates, agency facts, case studies, citations, or vendor claims
- Prefer simple diagrams, process flows, screenshots of approved tools, or neutral workplace illustrations
- Keep each slide readable: 3-5 bullets maximum unless the slide is an exercise

## Localization checklist

- Replace `[Agency]`, `[department]`, `[program lead]`, and other placeholders.
- Confirm the current Approved AI Tools List.
- Confirm local privacy, records, procurement, labor, security, and accessibility rules.
- Remove examples that do not apply to the agency.
- Add agency branding only after the content is reviewed.

---

# Slide 1: [Slide title]

Main point: [One sentence explaining the slide.]

Bullets:

- [Bullet]
- [Bullet]
- [Bullet]

Speaker notes:

[What the facilitator should say or ask. Keep this conversational.]

Image guidance:

[Describe a useful image, diagram, screenshot, or "No image needed."]

Evidence and review notes:

[List any claims that require verification, or write "No external claims."]
```

## Slide Writing Rules

Each slide should have one job. If a slide has two jobs, split it.

Use this slide anatomy:

```markdown
---

# Slide N: Clear Action-Oriented Title

Main point: One sentence.

Bullets:

- Short bullet
- Short bullet
- Short bullet

Speaker notes:

2-5 sentences or a short facilitation script.

Image guidance:

Specific visual direction, or "No image needed."

Evidence and review notes:

Local verification or source notes.
```

Visible slide content should be tight. Speaker notes can carry nuance, caveats, facilitation prompts, and optional examples.

## Prompt Pattern

When a user imports the file into an AI presentation tool, suggest this prompt:

```text
Create a first-draft slide deck from the attached Markdown source.

Follow the slide breaks exactly. Use each "Slide N" section as one slide. Use "Speaker notes" as presenter notes, not visible slide text. Use "Image guidance" to choose or generate visuals. Do not invent statistics, laws, citations, vendor claims, agency facts, or case studies. Preserve placeholders in square brackets unless I provide local details. Keep the tone practical, calm, plain-language, and appropriate for a public-sector audience.
```

For Gamma, add:

```text
If a section imports as too much content for one card, split at each line containing only three dashes.
```

For Beautiful.ai, add:

```text
Use the slide-by-slide structure as the outline. Keep the generated outline close to the source before designing the deck.
```

For ChatGPT or Claude, add:

```text
Return an editable deck outline first. After I approve it, generate the presentation file or a tool-specific export format.
```

## Image Guidance Rules

Image guidance should help the tool create useful visuals without drifting into gimmicks.

Prefer:

- Simple process diagrams.
- Neutral public-service workplace scenes.
- Screenshots or mockups of approved forms and workflows.
- Accessible icons and sparse visual metaphors.
- Plain charts only when the data is supplied by the source.

Avoid:

- Robots replacing workers.
- Dark, ominous, or surveillance-heavy imagery.
- Fictional seals, badges, uniforms, or official authority symbols.
- Photorealistic residents, patients, students, defendants, or other sensitive populations unless the agency supplies approved imagery.
- Charts with invented numbers.
- Visuals that imply a tool is approved when it is only an example.

Use this pattern:

```markdown
Image guidance:

Simple two-column diagram. Left side: "Current workflow" with staff manually drafting, searching, and summarizing. Right side: "AI-assisted workflow" with the same staff member reviewing an AI draft before final approval. No robots, no surveillance imagery, no fictional agency seal.
```

## Evidence And Claim Rules

Deck sources are advice and training support, not legal authority. Keep claims scoped and reviewable.

Use:

- "For many agencies..."
- "A practical starting point is..."
- "Consider..."
- "Your legal, HR, procurement, records, or security team may need to adjust this..."

Avoid:

- "You must..." unless referring to a local requirement the agency has already adopted.
- "This guarantees..."
- "Compliant with..." unless a qualified reviewer has verified it.
- Current model IDs, vendor pricing, product availability, or laws unless the slide includes a review note.

If a slide mentions current facts, add:

```markdown
Evidence and review notes:

Verify this example before use. Replace with a current local example if possible. Do not present vendor pricing, model availability, or legal status without checking the provider or official source docs.
```

## Accessibility And Plain Language Rules

Deck source should make accessibility easier for the deck tool and final reviewer.

- Use descriptive slide titles.
- Keep bullets short.
- Avoid text embedded in images unless the same text appears on the slide or in notes.
- Ask for high-contrast layouts.
- Avoid color-only distinctions.
- Provide alt-text-style image guidance.
- Avoid unexplained acronyms.
- Define technical terms before using them repeatedly.

## Review Checklist

Before linking a deck source from a guide page:

- The deck has a complete instruction block.
- Every slide has an explicit slide break.
- Every slide has a clear title and main point.
- Speaker notes are present for facilitation-heavy slides.
- Image guidance is specific and policy-safe.
- Claims that may age have review notes.
- Placeholders are clear and bracketed.
- Tone is advisory, not authoritative.
- Small organizations can use it without a design team.
- Large organizations can adapt it without feeling talked down to.
- The page that links to the file explains that the source is a starting point, not an approved final deck.

## How To Link From Guide Pages

Use consistent language:

```markdown
- AI deck source markdown: [Download the deck source](/deck-sources/phase-2/track-1-foundations/session-1-1-what-ai-actually-is.md). Paste or upload it into your preferred AI presentation tool, then localize, verify, and brand the generated deck before use.
```

Avoid saying "finished deck" unless we actually provide a finished deck.

## Project Rollout Plan

When converting the guide's presentation resources:

1. Update track overview pages to name "AI deck source markdown" instead of generic "slide deck outline."
2. Add a short public-facing how-to page in the resource library.
3. Create deck sources for the presentation-heavy resources first:
   - Track 1, Sessions 1.1-1.4
   - Track 2, Briefings 2.1-2.4
   - Track 7, Sessions 7.1-7.3
4. Review other pages that mention decks, slides, board presentations, budget presentations, or executive briefings.
5. Run build and link validation after adding public links.

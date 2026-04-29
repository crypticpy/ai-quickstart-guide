/**
 * Shared print/export helper for the guide's interactive forms.
 *
 * Each form (AUP wizard, charter wizard, readiness assessment, risk-tier
 * picker, intake form) calls printDocument(doc) to open a clean,
 * print-styled rendering of its deliverable in a new window and trigger
 * the browser print dialog. The user "saves as PDF" from there.
 *
 * The helper renders only the deliverable — no Starlight chrome, no form
 * controls, no surrounding markdown content. Cover page + numbered
 * sections + signature lines, all at letter / A4 with serif body.
 */

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "lead"; text: string }
  | { kind: "list"; ordered?: boolean; items: string[] }
  | { kind: "definitionList"; items: { term: string; definition: string }[] }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | {
      kind: "callout";
      tone: "info" | "success" | "warn" | "danger";
      title?: string;
      text: string;
    }
  | { kind: "rule" }
  | { kind: "signature"; lines: { label: string }[] }
  | { kind: "markdown"; source: string };

export interface PrintableDoc {
  /** Document title shown on the cover. Also used as the print window's
   * document.title — most browsers seed the "Save as PDF" filename from
   * this. */
  title: string;
  subtitle?: string;
  /** Header meta — e.g. Effective date, Owner, Approved by, Date completed. */
  meta?: { label: string; value: string }[];
  blocks: Block[];
  /** Footer line on every printed page. Defaults to title • date. */
  footer?: string;
}

/* -------------------------------------------------------------------------
 * Public entry point
 * ------------------------------------------------------------------------- */

export function printDocument(doc: PrintableDoc): void {
  if (typeof window === "undefined") return;

  const html = renderHtmlDocument(doc);
  const win = window.open(
    "",
    "_blank",
    "width=900,height=1200",
  );

  if (!win) {
    window.alert(
      "Could not open the print window. Your browser may have blocked the pop-up — please allow pop-ups for this page and try again.",
    );
    return;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();
  win.opener = null;

  const trigger = () => {
    try {
      win.focus();
      win.print();
    } catch {
      /* user dismissed */
    }
  };

  // Wait one frame so styles & web fonts apply before the print dialog opens.
  if (win.document.readyState === "complete") {
    setTimeout(trigger, 200);
  } else {
    win.addEventListener("load", () => setTimeout(trigger, 200));
  }
}

/* -------------------------------------------------------------------------
 * HTML assembly
 * ------------------------------------------------------------------------- */

function renderHtmlDocument(doc: PrintableDoc): string {
  const safeTitle = escapeHtml(doc.title);
  const filenameHint = sanitizeFilename(doc.title);
  const dateLabel = formatToday();
  const footer = escapeHtml(doc.footer ?? `${doc.title} · ${dateLabel}`);

  const cover = renderCover(doc);
  const body = doc.blocks.map(renderBlock).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${safeTitle}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="${safeTitle}" />
<meta name="generator" content="AI Quickstart Guide" />
<meta name="filename" content="${escapeHtml(filenameHint)}" />
${PRINT_STYLES}
</head>
<body>
<main class="doc">
${cover}
<article class="doc__body">
${body}
</article>
</main>
<footer class="doc__footer" aria-hidden="true">${footer}</footer>
</body>
</html>`;
}

function renderCover(doc: PrintableDoc): string {
  const subtitle = doc.subtitle
    ? `<p class="cover__subtitle">${escapeHtml(doc.subtitle)}</p>`
    : "";
  const meta =
    doc.meta && doc.meta.length > 0
      ? `<dl class="cover__meta">${doc.meta
          .map(
            (m) =>
              `<div class="cover__meta-row"><dt>${escapeHtml(m.label)}</dt><dd>${escapeHtml(m.value)}</dd></div>`,
          )
          .join("")}</dl>`
      : "";
  return `<section class="cover">
  <div class="cover__brand">AI Quickstart Guide</div>
  <h1 class="cover__title">${escapeHtml(doc.title)}</h1>
  ${subtitle}
  ${meta}
  <div class="cover__date">Generated ${escapeHtml(formatToday())}</div>
</section>`;
}

/* -------------------------------------------------------------------------
 * Block rendering
 * ------------------------------------------------------------------------- */

function renderBlock(block: Block): string {
  switch (block.kind) {
    case "heading": {
      const tag = `h${block.level}`;
      return `<${tag}>${renderInline(block.text)}</${tag}>`;
    }
    case "paragraph":
      return `<p>${renderInline(block.text)}</p>`;
    case "lead":
      return `<p class="lead">${renderInline(block.text)}</p>`;
    case "list": {
      const tag = block.ordered ? "ol" : "ul";
      return `<${tag}>${block.items
        .map((item) => `<li>${renderInline(item)}</li>`)
        .join("")}</${tag}>`;
    }
    case "definitionList":
      return `<dl class="defs">${block.items
        .map(
          (it) =>
            `<dt>${renderInline(it.term)}</dt><dd>${renderInline(it.definition)}</dd>`,
        )
        .join("")}</dl>`;
    case "table": {
      const head = block.headers
        .map((h) => `<th>${renderInline(h)}</th>`)
        .join("");
      const body = block.rows
        .map(
          (r) =>
            `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join("")}</tr>`,
        )
        .join("");
      return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
    }
    case "callout": {
      const title = block.title
        ? `<div class="callout__title">${renderInline(block.title)}</div>`
        : "";
      return `<aside class="callout callout--${block.tone}">${title}<p>${renderInline(block.text)}</p></aside>`;
    }
    case "rule":
      return `<hr />`;
    case "signature":
      return `<section class="signature">${block.lines
        .map(
          (l) =>
            `<div class="signature__row"><span class="signature__label">${escapeHtml(l.label)}</span><span class="signature__line"></span><span class="signature__date">Date: <span class="signature__line signature__line--short"></span></span></div>`,
        )
        .join("")}</section>`;
    case "markdown":
      return renderMarkdown(block.source);
  }
}

/* -------------------------------------------------------------------------
 * Inline + small markdown renderer for the subset we generate
 *   - **bold**, *italic*, _italic_, `code`
 *   - escape <, >, &
 * ------------------------------------------------------------------------- */

function renderInline(text: string): string {
  // Escape first, then apply markdown so injected HTML cannot leak.
  const safe = escapeHtml(text);
  return safe
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
}

/* Block-level markdown renderer for AUP / Charter content. Handles:
 *   - # / ## / ### headings
 *   - paragraphs
 *   - bullet lists (`- ...`), ordered lists (`1. ...`)
 *   - blockquotes (`> ...`)
 *   - horizontal rules (`---`)
 *   - inline emphasis (via renderInline)
 * Tables and code blocks are not currently used by these wizards. */
function renderMarkdown(src: string): string {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  type ListState = { tag: "ul" | "ol"; items: string[] } | null;
  let list: ListState = null;
  let para: string[] = [];
  let blockquote: string[] = [];

  const flushPara = () => {
    if (para.length === 0) return;
    out.push(`<p>${renderInline(para.join(" "))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    out.push(
      `<${list.tag}>${list.items
        .map((i) => `<li>${renderInline(i)}</li>`)
        .join("")}</${list.tag}>`,
    );
    list = null;
  };
  const flushBlockquote = () => {
    if (blockquote.length === 0) return;
    out.push(
      `<blockquote>${blockquote
        .map((l) => `<p>${renderInline(l)}</p>`)
        .join("")}</blockquote>`,
    );
    blockquote = [];
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushBlockquote();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line === "") {
      flushAll();
      continue;
    }

    if (line === "---" || line === "***") {
      flushAll();
      out.push("<hr />");
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushPara();
      flushBlockquote();
      if (!list || list.tag !== "ul") {
        flushList();
        list = { tag: "ul", items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      flushPara();
      flushBlockquote();
      if (!list || list.tag !== "ol") {
        flushList();
        list = { tag: "ol", items: [] };
      }
      list.items.push(ordered[1]);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushPara();
      flushList();
      blockquote.push(quote[1]);
      continue;
    }

    // Otherwise, paragraph text. Continuation lines get joined with a space.
    flushList();
    flushBlockquote();
    para.push(line);
  }

  flushAll();
  return out.join("\n");
}

/* -------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeFilename(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function formatToday(): string {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/* -------------------------------------------------------------------------
 * Print stylesheet
 *   - Letter and A4 with sensible margins.
 *   - Serif body for long-form readability; sans-serif for headings.
 *   - Cover page always its own page; main content starts on page 2.
 *   - Page footer carries the document title via @page :bottom-center.
 *   - Heading orphan/widow controls.
 * ------------------------------------------------------------------------- */

const PRINT_STYLES = `<style>
:root {
  --doc-fg: #111418;
  --doc-fg-muted: #4b5560;
  --doc-rule: #c8cdd4;
  --doc-accent: #2f4a8c;
  --doc-success: #2c7a4d;
  --doc-warn: #b87a1f;
  --doc-danger: #b53030;
  --doc-cover-band: #1a2748;
}

@page {
  size: letter;
  margin: 0.75in 0.85in;
}

* { box-sizing: border-box; }

html, body { background: #fff; color: var(--doc-fg); }

body {
  margin: 0;
  font-family: "Charter", "Iowan Old Style", "Source Serif Pro", Georgia, "Times New Roman", serif;
  font-size: 11pt;
  line-height: 1.55;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

main.doc {
  max-width: 7.5in;
  margin: 0 auto;
  padding: 0.25in 0;
}

/* Cover page ------------------------------------------------------------- */

.cover {
  break-after: page;
  page-break-after: always;
  padding: 1.25in 0.5in 1in;
  border-top: 8px solid var(--doc-cover-band);
  border-bottom: 1px solid var(--doc-rule);
  text-align: left;
}

.cover__brand {
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-size: 10pt;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--doc-accent);
  margin-bottom: 0.5in;
}

.cover__title {
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-weight: 700;
  font-size: 32pt;
  line-height: 1.1;
  margin: 0 0 0.25in;
  color: var(--doc-fg);
}

.cover__subtitle {
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-size: 14pt;
  font-weight: 500;
  color: var(--doc-fg-muted);
  margin: 0 0 0.5in;
}

.cover__meta {
  margin: 0.75in 0 0.5in;
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 0.4in;
  row-gap: 0.12in;
}

.cover__meta-row { display: contents; }
.cover__meta dt {
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-size: 9.5pt;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--doc-fg-muted);
}
.cover__meta dd {
  margin: 0;
  font-size: 11pt;
  font-weight: 500;
  color: var(--doc-fg);
}

.cover__date {
  margin-top: 1in;
  font-size: 9.5pt;
  color: var(--doc-fg-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Body ------------------------------------------------------------------- */

article.doc__body {
  padding: 0 0.25in;
}

article.doc__body h1,
article.doc__body h2,
article.doc__body h3 {
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  color: var(--doc-fg);
  break-after: avoid;
  page-break-after: avoid;
}

article.doc__body h1 {
  font-size: 20pt;
  font-weight: 700;
  margin: 0.4in 0 0.15in;
  padding-bottom: 0.05in;
  border-bottom: 2px solid var(--doc-accent);
  break-before: page;
  page-break-before: always;
}
article.doc__body h1:first-of-type {
  break-before: auto;
  page-break-before: auto;
}

article.doc__body h2 {
  font-size: 14pt;
  font-weight: 700;
  margin: 0.3in 0 0.1in;
  color: var(--doc-accent);
}

article.doc__body h3 {
  font-size: 12pt;
  font-weight: 700;
  margin: 0.22in 0 0.08in;
}

article.doc__body p {
  margin: 0 0 0.12in;
  orphans: 3;
  widows: 3;
}

article.doc__body p.lead {
  font-size: 12pt;
  color: var(--doc-fg-muted);
  margin-bottom: 0.18in;
}

article.doc__body ul,
article.doc__body ol {
  margin: 0 0 0.15in 0;
  padding-left: 0.3in;
}

article.doc__body li { margin: 0 0 0.05in; }
article.doc__body li > p { margin: 0; }

article.doc__body code {
  font-family: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.92em;
  padding: 0 0.05em;
  background: #eef2f7;
  border-radius: 3px;
}

article.doc__body strong { font-weight: 700; color: var(--doc-fg); }
article.doc__body em { font-style: italic; }

article.doc__body hr {
  border: none;
  border-top: 1px solid var(--doc-rule);
  margin: 0.25in 0;
}

article.doc__body blockquote {
  border-left: 3px solid var(--doc-accent);
  padding: 0.05in 0 0.05in 0.18in;
  margin: 0.15in 0;
  color: var(--doc-fg-muted);
  font-style: italic;
}

/* Tables ----------------------------------------------------------------- */

article.doc__body table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.15in 0 0.2in;
  font-size: 10.5pt;
  break-inside: auto;
  page-break-inside: auto;
}

article.doc__body thead { display: table-header-group; }
article.doc__body tr { break-inside: avoid; page-break-inside: avoid; }
article.doc__body th,
article.doc__body td {
  text-align: left;
  vertical-align: top;
  padding: 0.06in 0.1in;
  border-bottom: 1px solid var(--doc-rule);
}
article.doc__body th {
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-weight: 700;
  font-size: 9.5pt;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--doc-fg-muted);
  border-bottom: 1.5px solid var(--doc-fg);
}

/* Definition lists (used for sponsor blocks etc.) ------------------------ */

dl.defs {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 0.25in;
  row-gap: 0.05in;
  margin: 0 0 0.2in;
}
dl.defs dt {
  font-weight: 700;
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-size: 10.5pt;
}
dl.defs dd { margin: 0; }

/* Callouts -------------------------------------------------------------- */

aside.callout {
  border-left: 4px solid var(--doc-accent);
  background: #f4f6fb;
  padding: 0.12in 0.18in;
  margin: 0.18in 0;
  break-inside: avoid;
  page-break-inside: avoid;
}
aside.callout p { margin: 0; }
aside.callout .callout__title {
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-weight: 700;
  font-size: 10.5pt;
  margin-bottom: 0.05in;
}
aside.callout--success { border-color: var(--doc-success); background: #eef7f1; }
aside.callout--warn    { border-color: var(--doc-warn);    background: #fbf3e6; }
aside.callout--danger  { border-color: var(--doc-danger);  background: #fbeded; }

/* Signature lines ------------------------------------------------------- */

section.signature {
  margin-top: 0.4in;
  break-inside: avoid;
  page-break-inside: avoid;
}
.signature__row {
  display: flex;
  align-items: flex-end;
  gap: 0.2in;
  margin-bottom: 0.32in;
}
.signature__label {
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-weight: 600;
  white-space: nowrap;
}
.signature__line {
  flex: 1;
  border-bottom: 1px solid var(--doc-fg);
  height: 0;
  align-self: flex-end;
  padding-top: 0.18in;
}
.signature__line--short { flex: 0 0 1.2in; }
.signature__date {
  display: inline-flex;
  align-items: flex-end;
  gap: 0.08in;
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  font-size: 10.5pt;
}

/* Footer (running page footer) ------------------------------------------ */

@page {
  @bottom-left { content: ""; }
  @bottom-right {
    content: "Page " counter(page) " of " counter(pages);
    font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
    font-size: 9pt;
    color: #4b5560;
  }
}

footer.doc__footer {
  display: none; /* We use @page running footers; this is just a fallback. */
}

/* Screen view (the print-window preview) -------------------------------- */

@media screen {
  body { background: #f5f6f8; padding: 24px 0; }
  main.doc {
    background: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.06);
    padding: 0.5in 0.85in;
    min-height: 11in;
  }
  .cover {
    border-bottom: none;
    padding-bottom: 0.5in;
  }
}
</style>`;

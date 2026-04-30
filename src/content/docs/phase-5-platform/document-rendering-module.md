---
title: Document Rendering Module
description: Templated PDF, DOCX, and HTML output for letters, reports, forms, and notices.
sidebar:
  order: 8
---

Government work is paper work. Even when the workflow is digital, the output is often a letter, a report, a determination, a permit, a form. Every agency has a fleet of templates that need to be filled in with case data and rendered to the format the recipient expects — usually PDF, sometimes DOCX, sometimes HTML email.

The Document Rendering module is the platform's reusable answer. One template engine, one rendering pipeline, consistent typography, accessible output, and a clean separation between data, template, and presentation. Applications that regularly produce official documents should use this path instead of hand-rolling PDF generation.

## What this module owns

- **Template registry.** A catalog of named templates with their schemas.
- **Rendering pipeline.** Data + template → output document.
- **Format adapters.** PDF, DOCX, HTML, plain text — each output format has a renderer.
- **Header / footer / branding.** Agency letterhead, official seals, version stamps.
- **Accessibility.** Tagged PDFs (PDF/UA), accessible DOCX, semantic HTML.
- **Variants.** Same template can render to multiple formats from one source.
- **Versioning.** Templates are versioned; existing rendered documents reference the version they used.
- **Storage.** Generated documents go to object storage; the module returns a signed URL.

## What this module does NOT own

- **Document delivery.** Sending a letter (postal mail, email, secure portal) is a separate concern.
- **Signature workflows.** DocuSign / Adobe Sign integration is a separate module.
- **Form intake.** Collecting data from a fillable form is the case-management or intake side.
- **Long-term archive.** Retention and records management is a separate compliance concern.

## Public surface

```python
# modules/document_rendering/src/document_rendering/public/client.py
from typing import Protocol
from .types import (
    Template, RenderRequest, RenderedDocument,
    DocumentFormat, RenderingError
)

class DocumentRenderingClient(Protocol):
    def register_template(self, template: Template) -> None: ...

    def render(self, template_id: str, version: str | None,
               data: dict, format: DocumentFormat,
               variant: str | None = None) -> RenderedDocument: ...

    def render_batch(self, requests: list[RenderRequest]) -> list[RenderedDocument]: ...

    def list_templates(self) -> list[Template]: ...
```

The `RenderedDocument` carries:

- `document_id` (for audit / lookup),
- `format`,
- `template_id` and `template_version`,
- `bytes_url` (signed URL to object storage),
- `bytes_inline` (for small docs the consuming app wants to handle directly),
- `metadata` (page count, file size, generated_at).

## The template language

The agency standardizes on **one template language**: **Jinja2** (Python ecosystem) / Handlebars (JS ecosystem) / Razor (.NET ecosystem). Pick one based on the [stack](/phase-4-dev-stack/stack-selection/); use it everywhere. Templates ship as files in the template registry repo, version-controlled.

A template is more than the source file:

```
templates/case-determination-letter/
├── template.yaml          # metadata, schema, variants
├── source.html.j2         # the source — HTML with Jinja2
├── styles.css             # styles for HTML and PDF outputs
├── assets/                # images (agency seal, signatures)
├── tests/
│   ├── golden-cases.yaml  # input fixtures
│   └── snapshots/         # expected rendered outputs (regression tested)
└── README.md
```

The metadata file declares the schema and supported variants:

```yaml
id: case-determination-letter
title: Case Determination Letter
description: Notifies the applicant of the case outcome.
schema_ref: schemas/case-determination.json
formats: [pdf, docx, html]
variants:
  - id: default
  - id: spanish
    locale: es-US
    source: source.es.html.j2
  - id: large-print
    accessibility: large-print
header: agency-letterhead
footer: agency-footer
classification: tier-2
```

## The schema is enforced

A template declares its data schema (JSON Schema). The renderer validates input data before rendering:

```json
{
  "type": "object",
  "required": ["case_id", "applicant_name", "decision", "issued_date"],
  "properties": {
    "case_id": { "type": "string", "pattern": "^C-\\d{4}-\\d{4}$" },
    "applicant_name": { "type": "string" },
    "decision": { "enum": ["approved", "denied", "pending"] },
    "denial_reason": { "type": "string" },
    "issued_date": { "type": "string", "format": "date" }
  }
}
```

If the schema isn't satisfied, `render()` raises a `RenderingError` with field-level details. This catches the "the template references `case.applicant.name` but the data has `applicantName`" bug at the boundary instead of producing a malformed letter.

## Rendering pipeline

```
data + template_id + format
  ↓
1. Load template (cache hit on hot path)
2. Validate data against schema
3. Resolve variant + locale
4. Render template to intermediate (HTML for most paths)
5. Apply header/footer/branding
6. Convert to target format (PDF / DOCX / HTML)
7. Apply accessibility transforms
8. Stream to object storage
9. Generate audit event
10. Return RenderedDocument
```

The intermediate-HTML approach means there is one template per content; converters handle the format-specific bits. This eliminates the "we have a Word template and a PDF template that have drifted" failure that plagues hand-rolled solutions.

## PDF rendering

PDF is the dominant output. The agency's choice of converter matters because options vary widely in fidelity, accessibility, and licensing.

| Converter                                                          | Pros                                  | Cons                                     |
| ------------------------------------------------------------------ | ------------------------------------- | ---------------------------------------- |
| **WeasyPrint** (Python)                                            | Open source, tagged PDF/PDF variants, good CSS support | Slower than headless Chrome              |
| **Headless Chromium** / Puppeteer                                  | Excellent fidelity to web rendering   | Heavyweight; less accessible by default  |
| **Apache PDFBox** (Java)                                           | Mature; good for low-level work       | Verbose; not template-driven             |
| **wkhtmltopdf**                                                    | Simple to deploy                      | Unmaintained since 2023; not recommended |
| **PrinceXML** (commercial)                                         | Strong CSS print support              | License cost                             |
| **Cloud-native**: Azure Document Intelligence Layout, AWS Textract | Specialized output                    | Generally not for outbound rendering     |

The agency's default can be **WeasyPrint** when the stack is Python-friendly and the templates are built from semantic HTML. It supports tagged PDFs and PDF/A/PDF/UA variants, but agencies should validate actual output because accessibility depends on template structure, metadata, fonts, and test tooling. Agencies with high-fidelity print needs or commercial publishing requirements may choose a commercial renderer.

Use PDF/A profiles for archival output when records policy requires them. The module's PDF adapter should support both PDF (web) and PDF/A (archive) profiles when the selected renderer can produce and validate them.

### Accessible PDF (PDF/UA)

Public-facing government documents and many internal workflows have accessibility obligations. Treat accessible output as the default. The PDF/UA standard (ISO 14289) requires:

- Tagged structure (headings, lists, tables) — produced from semantic HTML.
- Reading order matches visual order.
- Alt text on every image.
- No content as raster images (text remains text).
- Language identified at document and language-change boundaries.

Modern renderers can support tagged and PDF/UA-oriented output, but the renderer cannot fix a non-semantic template. The module's reference templates demonstrate the patterns; teams writing new templates have a checklist and run validation before release.

## DOCX rendering

For documents that must be editable downstream (legal review, court filings, congressional correspondence), DOCX is the format of choice.

Approach: the module produces DOCX from a `python-docx` (or Open XML SDK in .NET) template using **template variables in a real Word file**. The Word file is the template; placeholders are filled in. This preserves Word's native styles, tables, and formatting controls — far better fidelity than HTML-to-DOCX conversion.

Trade-off: same content with two template files (HTML for PDF/HTML output, DOCX for Word). The metadata file links them; tests assert they render the same content from the same data.

For lower-fidelity DOCX needs, HTML-to-DOCX conversion (via `docx-mailmerge` or LibreOffice headless) is supported as a quick path, accepting that Word formatting may not be pixel-perfect.

## HTML output

HTML is used for:

- **Email.** Plain HTML with inlined CSS (most email clients strip `<style>` blocks).
- **Web preview.** "Show me what this letter will look like before I send it."
- **Print-from-browser.** A user prints from the rendered HTML; the CSS print stylesheet applies.

HTML output uses the same template source. Email-specific transforms (CSS inlining, table-based layouts for legacy email clients) are applied at the email-output adapter.

## Template authoring workflow

Templates are code. The authoring workflow is the same as for any other code:

1. **Design.** A subject-matter expert (e.g., the policy team) writes the desired letter in a Word doc.
2. **Conversion.** A developer translates the Word content to the template language. The schema is derived from "what data does this letter reference?"
3. **Review.** The policy team reviews a rendered sample. Iterate.
4. **Tests.** Golden inputs + snapshot outputs. PR runs them on every change.
5. **Versioning.** The template is checked in; merging triggers a registry update.
6. **Rollout.** Existing in-flight cases continue using the version they were assigned; new cases use the latest version.

## Versioning and reproducibility

Generated documents should be reproducible enough to reconstruct what was sent: `template@version + renderer version + assets + data reference` should identify the output. Byte-for-byte reproduction may require pinned renderer versions, fonts, timestamps, metadata settings, and environment controls. Reproducibility matters because:

- An applicant disputes a letter; investigators reconstruct exactly what was sent.
- A template change should not retroactively change historical documents.
- Audits ask "what data went into this letter?" and the answer must be precise.

The module:

- Records `template_id`, `template_version`, renderer version, asset versions, `data_hash`, `rendered_at`, and operator/system context for every document.
- Stores the rendered output and a manifest. Store raw input data only when records policy, retention schedule, and classification rules allow it; otherwise store a hash, source record reference, and schema version.
- Supports re-render where policy permits: take the recorded manifest and approved source data, run the same template version, and verify the output matches within the chosen tolerance.

PDFs include their template version and document ID in the footer (a short hash) so a paper copy can be matched back to the rendering record.

## Branding (header / footer / seal)

The agency's standard letterhead is implemented once as a header partial. Templates declare which header they use:

```yaml
header: agency-letterhead-default
footer: agency-footer-default
```

Headers are themselves versioned. A rebrand updates the header; templates pick up the new header on next render unless they pin a specific version.

The agency seal, signature blocks, and other static assets are part of the template package. Sensitive signatures (e.g., the director's wet signature) are kept separate and require their own permission to include.

## Localization

Templates support multiple locales:

- **Source variant per locale.** A Spanish letter is a separate `.es.html.j2` source, not a `gettext` translation of the English. Government correspondence is rarely a literal translation.
- **Date / number / currency formatting** uses the locale.
- **Right-to-left** support for Arabic, Hebrew templates (CSS `dir=rtl`).
- **Fallback.** If a locale variant doesn't exist, the rendering returns an explicit error rather than silently using English. Some agencies prefer the opposite default; configurable.

## Storage

Rendered documents go to object storage. The module's storage adapter:

- **AWS S3 / Azure Blob Storage / GCS** — pick based on Phase 3 cloud.
- **Path convention** — `documents/{tenant}/{date}/{document_id}.pdf`.
- **Retention** — declared per-template (`retention_days: 2555` for 7-year retention).
- **Encryption** — at-rest with cloud KMS.
- **Signed URL** — returned from `render()`; short-lived (15 minutes default); the consuming app fetches the bytes or hands the URL to a user with appropriate authz.

For Tier-3 documents, the storage adapter writes to a separate, more tightly controlled bucket with stricter access logging.

## Async batch rendering

Some workflows render hundreds or thousands of documents at once (mass mailings, end-of-month reports). The module's batch path:

- Submit `render_batch([request, request, ...])`.
- Returns a job ID immediately.
- The job queue (Phase 3) processes requests in parallel, with bounded concurrency.
- Progress events emit to the operator; on completion, a manifest is delivered.
- Failed renders surface with detail; they don't block the whole batch.

## Performance

Starter targets per render:

- HTML: p95 ≤ 50ms.
- PDF (WeasyPrint, single-page letter): p95 ≤ 800ms.
- PDF (10-page report): p95 ≤ 2s.
- DOCX (mail-merge, single letter): p95 ≤ 200ms.

The PDF rendering cost dominates. Templates are compiled and cached; a hot template path renders 10–50 PDFs per second per CPU.

For per-record rendering at scale, prefer the batch path. A sync request loop can exhaust connections and is harder to retry safely.

## Architecture (ports and adapters)

| Port                 | Description                    | Production adapter             |
| -------------------- | ------------------------------ | ------------------------------ |
| `TemplateRepository` | Load templates by id+version   | Filesystem / Git / DB          |
| `TemplateEngine`     | Compile and execute a template | Jinja2 / Handlebars / Razor    |
| `PDFRenderer`        | HTML → PDF                     | WeasyPrint / Headless Chromium |
| `DOCXRenderer`       | DOCX template merge            | python-docx / OpenXML SDK      |
| `BlobStorage`        | Persist rendered bytes         | S3 / Blob / GCS                |
| `AuditLog`           | Record render events           | OTel + central log             |
| `JobQueue`           | Async batch execution          | Platform job queue             |

## Common rendering failures

- **Missing data field at render time.** Caught by schema validation; a clear error beats a corrupt letter that shipped.
- **PDF accessibility regressions.** A new template skips heading hierarchy; PDF accessibility validation in CI catches it.
- **Pixel-perfect drift between formats.** PDF and DOCX render slightly differently; templates that depend on exact pixel layout are fragile. Design for typographic consistency, not pixel-perfection.
- **Untested templates.** Production renders fail because no one rendered the template with realistic data before deploy. Snapshot tests should exist for templates that produce official or user-facing output.
- **Locale fallback bugs.** Spanish template missing a key falls through to English silently. Explicit error or explicit fallback policy; not silent default.
- **Storage costs.** A high-volume mass mailing without retention review fills the bucket. Every template declares its retention; document outputs aren't kept forever by default.

## Plain-English Guide to Document Rendering Terms

- **Template.** A document with placeholders that are filled in from data — the agency letterhead with `{{applicant_name}}` waiting to be replaced.
- **Schema.** The contract describing what data the template needs. Validated before render.
- **Variant.** A version of a template for a specific case — different language, large print, different format.
- **PDF/UA.** The accessibility standard for PDF (ISO 14289). Tagged structure, reading order, alt text.
- **PDF/A.** The archival standard for PDF (ISO 19005). Self-contained; designed for long-term preservation.
- **Tagged PDF.** A PDF whose internal structure (headings, lists, tables) is machine-readable — required for accessibility.

## Related

- [API Framework](/phase-5-platform/api-framework-module/) — the HTTP surface that exposes rendering to apps
- [RBAC Module](/phase-5-platform/rbac-module/) — guards which templates an app can render
- [Risk Classification Policy](/phase-1-governance/risk-classification/) — informs template classification and storage policy
- [Module Taxonomy](/phase-5-platform/module-taxonomy/) — the hexagonal pattern this module follows

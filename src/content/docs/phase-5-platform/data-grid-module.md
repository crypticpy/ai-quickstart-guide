---
title: Data Grid & Search Module
description: Reusable typed list, filter, sort, pagination, and full-text search patterns for internal tools.
sidebar:
  order: 5
---

Many internal government tools share the same screen: a table of records with filters across the top, sortable columns, a search box, an export button, and pagination at the bottom. Teams often rebuild this pattern from scratch, usually inconsistently and sometimes with subtle bugs in pagination boundaries, filter combinations, row-level authorization, or sort stability.

The Data Grid module is the agency's reusable answer. One backend pattern, one frontend component or library wrapper, and one query language give list views consistent behavior, accessibility, exports, and search without forcing every app to invent its own table system.

## What this module owns

- **Typed list endpoints.** A backend pattern that turns any indexed table or query into a paginated, filterable, sortable JSON response.
- **The query DSL.** A simple, JSON-based filter language that's safe to round-trip in URLs.
- **Full-text search.** Indexed search across registered entities, with snippet highlighting.
- **The grid component.** A frontend React component (with framework variants documented) that renders any list endpoint.
- **Export.** CSV, Excel, and JSON export of the current filtered view.
- **Saved views.** Per-user named filter+sort combinations.

## What this module does NOT own

- **Schema design.** What columns exist on a case is the case-management module's decision.
- **Display formatting beyond defaults.** Custom cell renderers (e.g., a status pill with custom colors) are app-specific.
- **Master-detail UIs.** A grid + drawer / modal / detail page is composed by the consuming app.

## Public surface

Backend:

```python
# modules/data_grid/src/data_grid/public/client.py
from typing import Protocol
from .types import (
    GridQuery, GridResult, FilterExpr, SortSpec,
    EntityRegistration, ExportFormat
)

class DataGridClient(Protocol):
    def register_entity(self, registration: EntityRegistration) -> None:
        """Declare a queryable entity with its schema and indexes."""

    def query(self, entity: str, query: GridQuery,
              user_id: str) -> GridResult:
        """Execute a list query with RBAC-scoped row filtering."""

    def search(self, entity: str, q: str, user_id: str,
               limit: int = 20) -> GridResult:
        """Full-text search across registered text fields."""

    def export(self, entity: str, query: GridQuery, format: ExportFormat,
               user_id: str) -> bytes:
        """Render the filtered view in the chosen format."""
```

Frontend:

```tsx
import { DataGrid } from "@platform/data-grid";

<DataGrid
  endpoint="/api/cases"
  columns={[
    { field: "case_id", label: "Case ID", sortable: true },
    { field: "status", label: "Status", filter: "enum" },
    { field: "assigned_to", label: "Assigned to", filter: "user-picker" },
    {
      field: "updated_at",
      label: "Updated",
      filter: "date-range",
      sortable: true,
    },
  ]}
  defaultSort={{ field: "updated_at", dir: "desc" }}
  exportFormats={["csv", "xlsx"]}
/>;
```

That is a complete, accessible, paginated, filterable, sortable, exportable case list. The exact line count will vary, but the consuming app should mostly describe columns and defaults instead of rebuilding list behavior.

## The query DSL

The agency's grid query is a JSON document with three sections.

```json
{
  "filter": {
    "and": [
      { "field": "status", "op": "in", "value": ["open", "investigating"] },
      { "field": "assigned_to", "op": "eq", "value": "user-uuid" },
      { "field": "updated_at", "op": "gte", "value": "2026-01-01" }
    ]
  },
  "sort": [
    { "field": "updated_at", "dir": "desc" },
    { "field": "case_id", "dir": "asc" }
  ],
  "page": { "limit": 50, "cursor": "eyJpZCI6..." }
}
```

Operators supported: `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `in`, `nin`, `contains`, `starts_with`, `is_null`, `is_not_null`. Combinators: `and`, `or`, `not`. Sorts are multi-key with stable tiebreaker (always include the primary key as a final sort to make pagination deterministic).

The DSL is **constrained** — it can only reference fields the entity registered. Arbitrary SQL is not expressible. This is the safety property: you cannot inject SQL through a grid query, and you cannot query columns the consuming app didn't authorize.

## URL round-tripping

Every grid filter+sort state round-trips into the URL as a base64-encoded JSON blob:

```
/cases?q=eyJmaWx0ZXIiOnsiYW5kIjpbey...
```

This means:

- **Shareable links.** "Here are all my open cases assigned to me" is a URL the user can bookmark or send to a colleague.
- **Browser history.** Back/forward navigation works as expected.
- **Deep links from email / dashboard.** "View flagged cases for this week" can link directly to the filtered grid.

The grid component reads and writes URL state automatically; the consuming app doesn't manage it.

## Backend pattern

Each entity that wants a grid registers itself once at app startup:

```python
data_grid.register_entity(EntityRegistration(
    name="cases",
    table="cases",
    primary_key="id",
    fields={
        "id": Field(type=str, indexed=True, sortable=True, exportable=True),
        "case_id": Field(type=str, indexed=True, searchable=True, sortable=True),
        "status": Field(type=Enum["open", "closed", ...], indexed=True),
        "assigned_to": Field(type=UserRef, indexed=True),
        "updated_at": Field(type=datetime, indexed=True, sortable=True),
        "title": Field(type=str, searchable=True),
        "narrative": Field(type=text, searchable=True, exportable=False),  # PII
    },
    row_filter=cases_row_filter,  # see below
))
```

The registration declares:

- **Field types.** Used for input validation on filters.
- **Indexed.** Filterable. Filter on a non-indexed field returns a 400.
- **Sortable.** Sortable. Same behavior.
- **Searchable.** Included in the full-text index.
- **Exportable.** Included in CSV / Excel exports. Sensitive fields (narratives, PII) opt out by default.
- **Row filter.** A function that adds RBAC-scoped predicates to every query (see next section).

## RBAC-scoped row filtering

Authorization at the row level is built in. Every entity registers a `row_filter` callable that receives `(user_id, base_query)` and returns a query restricted to rows the user is allowed to see.

```python
def cases_row_filter(user_id, base_query):
    user = auth.get_user(user_id)
    if rbac.has_role(user, "Supervisor"):
        return base_query  # see all cases in tenant
    elif rbac.has_role(user, "Investigator"):
        return base_query.where(assigned_to=user_id)
    else:
        return base_query.where(False)  # see nothing
```

The Data Grid module should always apply the row filter inside the shared query path so the consuming app cannot accidentally bypass it. This reduces a class of bugs where "list cases" returns cases the user should not see because the developer forgot the WHERE clause.

The row filter is also applied to exports. You cannot export rows you cannot see.

## Pagination

Cursor-based, per the [API-first standards](/phase-4-dev-stack/api-first-design/). The cursor encodes the last row's sort key tuple (and a stable tiebreaker — the primary key). The next page's query is "rows where (sort_key, primary_key) > (last_sort_key, last_primary_key)."

Why not offset:

- Offset pagination skips and recounts on every request — slow on large tables.
- Offset is unstable across inserts — rows shift between pages.
- Offset has no natural way to express "give me the next 50."

The cursor is opaque to clients; the agency reserves the right to change its encoding without breaking API consumers.

## Full-text search

Search adapter options:

| Option                                                                 | When                                                                             |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Postgres `tsvector`                                                    | Good default for modest datasets when Postgres is already the system of record   |
| OpenSearch / Elasticsearch                                             | Larger corpora; cross-entity search; advanced queries                            |
| Cloud-native search service                                            | Use if already in the cloud and aligned with [Phase 3](/phase-3-infrastructure/) |
| pgvector + embeddings                                                  | Semantic search; combine with keyword search                                     |

The module's adapter pattern keeps search backend changes bounded. Most agencies can start with their database's native full-text search and migrate to a dedicated search engine when corpus size, query complexity, or cross-entity search demand it.

Search results carry highlighted snippets:

```json
{
  "data": [
    {
      "id": "case-uuid",
      "case_id": "C-2026-0432",
      "title": "Building permit <em>inspection</em> overdue",
      "_snippet": "...the <em>inspection</em> was scheduled for March 15..."
    }
  ]
}
```

## Export

Three formats supported by default:

- **CSV.** RFC 4180. UTF-8 BOM optional (Excel-on-Windows wants it).
- **Excel (`.xlsx`).** Native Excel via `openpyxl` / `EPPlus` / `Apache POI`. Multi-sheet supported for complex exports.
- **JSON.** The same shape as the API response, useful for engineering exports.

Export rules:

- **Always RBAC-filtered.** The export inherits the row filter.
- **Field-level exclusion.** Fields marked `exportable=False` (PII, narratives) are stripped.
- **Bounded.** Default cap of 10,000 rows; configurable up to 100,000. Above that, the export goes through an async job.
- **Audit-logged.** Every export is an audit event with user, entity, query, row count.
- **Watermarked.** Sensitive exports embed a watermark (user, timestamp, query hash) for forensic traceability.

## The frontend grid component

The reference component is React; analogous implementations exist for:

- **Vue** (Nuxt apps)
- **Lit / web component** (framework-agnostic)
- **Server-rendered HTML** (HTMX-based agency apps)

Features included:

- **Sortable columns** (click header).
- **Filter row** with type-appropriate filter UIs (text, date range, enum dropdown, user picker).
- **Density modes** (comfortable / compact).
- **Saved views** (named filter+sort combinations stored per-user).
- **Bulk actions** (checkbox column + action bar).
- **Keyboard navigation** (arrow keys, Enter to open row).
- **Accessibility** (WCAG 2.2 AA: ARIA grid pattern, screen-reader announcements on sort/filter, focus management).
- **Empty states** with optional CTA.
- **Loading skeletons.**
- **Error boundaries.**

Customization:

- Custom cell renderers (status pills, user avatars, etc.).
- Custom filter components.
- Row context menu.
- Header actions (bulk, export, refresh).

Bundle size depends on the chosen UI framework and dependency sharing. Track it in CI for the reference shell instead of treating a specific size as a promise.

## Saved views

A user can save the current filter+sort+columns as a named view:

- **Personal views.** Visible only to the user who saved them.
- **Shared views.** Visible to a role or scope. "All open cases for Region 4" shared with the Region 4 supervisors.
- **Default view.** The view that opens when the grid first loads. Per-user.

Stored as a JSON document keyed by `(user, entity, name)` in the platform DB. Saved views are part of the audit context — when a user reports a problem, the support team can reproduce their view.

## Performance

Starter targets on a typical indexed agency dataset:

- Empty filter, default sort: p95 ≤ 100ms.
- Filtered query (one indexed predicate): p95 ≤ 100ms.
- Filtered query (compound, all indexed): p95 ≤ 150ms.
- Search (ts_query against searchable columns): p95 ≤ 200ms.
- Export of 10,000 rows (sync): p95 ≤ 2s.

Critical: every high-traffic filterable + sortable field has an index. The registration step should assert this against the live DB schema for production entities, or at minimum surface a CI warning before launch. This catches the "I added `is_archived` as a filter but forgot the index, now everything is a sequential scan in production" bug.

## Caching

The grid module caches **count queries** for a few seconds. Counting rows over a filter is the slow part of pagination; if a user clicks "next page" within seconds, the count is reused. Data queries are not cached.

For high-traffic apps, a 5-second TTL cache on the actual query result is opt-in per entity. The trade-off is staleness: a row created in the last 5 seconds may not appear in the cached page.

## Async exports

Above 10,000 rows, exports become async:

1. The user clicks Export.
2. The grid POSTs to `/cases/exports` and gets back a job ID.
3. The export job runs in the background, RBAC-filtered, and uploads the result to object storage.
4. The user receives an email or in-app notification with a signed download URL (TTL 24h).

The job system is the platform's [job queue](/phase-3-infrastructure/) — async exports are one consumer.

## i18n / l10n

The grid component supports localization:

- **Column headers** can be translation keys.
- **Empty states, action labels, filter UI** are all translatable.
- **Date / number formatting** uses the user's locale.
- **CSV export** respects locale formatting (Excel-friendly date format on `xx-XX` locales that need it).

Translation files ship with the module (English baseline + agency-supplied locales).

## Plain-English Guide to Data Grid Terms

- **Grid / data grid.** The table-with-filters-and-sorting screen. The component.
- **Cursor pagination.** Asking for "rows after this anchor" instead of "give me page 7." Stable when rows are inserted; faster on large tables.
- **Tsvector / full-text index.** Postgres's data type and index for indexed text search. Tokenizes text into searchable lexemes.
- **Saved view.** A named filter+sort+column combination the user can return to.
- **Row filter.** A function that restricts which rows a user can see, applied transparently to every list query.

## Related

- [API Framework](/phase-5-platform/api-framework-module/) — exposes the grid endpoints with consistent error / pagination / auth handling
- [RBAC Module](/phase-5-platform/rbac-module/) — provides the row filter authority
- [Auth Module](/phase-5-platform/auth-module/) — identifies the user the row filter applies to
- [API-First Design](/phase-4-dev-stack/api-first-design/) — pagination + Problem Details error standards the grid follows

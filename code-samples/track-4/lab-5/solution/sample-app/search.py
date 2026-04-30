"""Search helpers for the records service.

The starter version of this module had a single 60-line function that
filtered, sorted, paginated, and formatted in one body. Lab task 3 splits
it into four small functions, each independently testable.
"""

from math import ceil

from db import all_records


SORTABLE_FIELDS = {"id", "last_name", "opened_on"}


def filter_records(rows, last_name="", case_type="", status=""):
    """Return rows that match the supplied filters.

    Empty filters are skipped. Last name match is case-insensitive substring.
    """
    out = []
    needle = last_name.lower()
    for r in rows:
        if needle and needle not in r["last_name"].lower():
            continue
        if case_type and r["case_type"] != case_type:
            continue
        if status and r["status"] != status:
            continue
        out.append(r)
    return out


def sort_records(rows, sort_by="id"):
    """Return rows sorted by an allow-listed field."""
    if sort_by not in SORTABLE_FIELDS:
        sort_by = "id"
    return sorted(rows, key=lambda r: r[sort_by])


def paginate(rows, page=1, page_size=10):
    """Slice rows into one page. Returns (page_rows, page, page_size, total_pages)."""
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10
    total_pages = max(1, ceil(len(rows) / page_size))
    start = (page - 1) * page_size
    end = start + page_size
    return rows[start:end], page, page_size, total_pages


def format_for_display(row):
    """Render one row as a single-line display string."""
    return (
        f"#{row['id']} {row['last_name']}, {row['first_name']} "
        f"[{row['case_type']}/{row['status']}] opened {row['opened_on']}"
    )


def search_and_format(last_name, case_type, status, sort_by, page, page_size):
    """Original v1 entry point. Kept for backward compatibility with main.py."""
    rows = all_records()
    filtered = filter_records(rows, last_name=last_name, case_type=case_type, status=status)
    sorted_rows = sort_records(filtered, sort_by=sort_by)
    page_rows, page, page_size, _total_pages = paginate(sorted_rows, page=page, page_size=page_size)
    formatted = [
        {"id": r["id"], "display": format_for_display(r), "row": r} for r in page_rows
    ]
    return {
        "count": len(filtered),
        "page": page,
        "page_size": page_size,
        "results": formatted,
    }


def search_v2(last_name, case_type, status, sort_by, page, page_size):
    """Paginated search with full pagination metadata. New in lab task 5."""
    rows = all_records()
    filtered = filter_records(rows, last_name=last_name, case_type=case_type, status=status)
    sorted_rows = sort_records(filtered, sort_by=sort_by)
    page_rows, page, page_size, total_pages = paginate(
        sorted_rows, page=page, page_size=page_size
    )
    return {
        "count": len(filtered),
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages and len(page_rows) > 0,
        "has_prev": page > 1,
        "results": page_rows,
    }

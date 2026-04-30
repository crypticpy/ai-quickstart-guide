"""Test suite for the lab 4.5 reference solution."""

from fastapi.testclient import TestClient

from db import all_records, find_by_last_name, init_db
from main import app
from search import (
    filter_records,
    format_for_display,
    paginate,
    search_v2,
    sort_records,
)

client = TestClient(app)
init_db()


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_find_by_last_name_happy_path():
    rows = find_by_last_name("Alvarez")
    assert len(rows) == 1
    assert rows[0]["first_name"] == "Maria"


def test_find_by_last_name_empty_result():
    assert find_by_last_name("Nobody") == []


def test_sql_injection_returns_no_rows():
    # Regression test for the lab task 1 fix.
    assert find_by_last_name("' OR '1'='1") == []


def test_filter_records_no_filters_returns_all():
    rows = all_records()
    assert filter_records(rows) == rows


def test_filter_records_by_case_type():
    rows = all_records()
    permits = filter_records(rows, case_type="permit")
    assert all(r["case_type"] == "permit" for r in permits)
    assert len(permits) > 0


def test_filter_records_substring_last_name():
    rows = all_records()
    matches = filter_records(rows, last_name="al")
    assert any(r["last_name"] == "Alvarez" for r in matches)


def test_sort_records_by_last_name():
    rows = all_records()
    sorted_rows = sort_records(rows, sort_by="last_name")
    last_names = [r["last_name"] for r in sorted_rows]
    assert last_names == sorted(last_names)


def test_sort_records_unknown_field_falls_back_to_id():
    rows = all_records()
    sorted_rows = sort_records(rows, sort_by="not_a_field")
    assert [r["id"] for r in sorted_rows] == sorted(r["id"] for r in rows)


def test_paginate_first_page():
    rows = all_records()
    page_rows, page, page_size, total_pages = paginate(rows, page=1, page_size=5)
    assert len(page_rows) == 5
    assert page == 1
    assert page_size == 5
    assert total_pages == 3


def test_paginate_out_of_range_returns_empty_results():
    rows = all_records()
    page_rows, _page, _page_size, total_pages = paginate(rows, page=99, page_size=5)
    assert page_rows == []
    assert total_pages == 3


def test_search_v2_pagination_math():
    response = search_v2("", "", "", "id", page=2, page_size=5)
    assert response["count"] == 15
    assert response["total_pages"] == 3
    assert response["has_prev"] is True
    assert response["has_next"] is True
    assert len(response["results"]) == 5


def test_search_v2_last_page_has_no_next():
    response = search_v2("", "", "", "id", page=3, page_size=5)
    assert response["has_next"] is False
    assert response["has_prev"] is True


def test_format_for_display_shape():
    row = {
        "id": 1,
        "last_name": "Alvarez",
        "first_name": "Maria",
        "case_type": "permit",
        "status": "open",
        "opened_on": "2025-11-02",
    }
    line = format_for_display(row)
    assert "Alvarez, Maria" in line
    assert "[permit/open]" in line


def test_search_endpoint_v2_returns_pagination_metadata():
    response = client.get("/search/v2", params={"page": 1, "page_size": 5})
    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) >= {
        "count",
        "page",
        "page_size",
        "total_pages",
        "has_next",
        "has_prev",
        "results",
    }

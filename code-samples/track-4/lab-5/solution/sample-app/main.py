"""FastAPI app for the constituent records search service."""

from fastapi import FastAPI

from db import find_by_last_name, init_db
from search import search_and_format, search_v2

app = FastAPI(title="Constituent Records Search")


@app.on_event("startup")
def on_startup():
    """Initialize and seed the SQLite database on first start."""
    init_db()


@app.get("/health")
def health():
    """Liveness probe."""
    return {"status": "ok"}


@app.get("/records")
def records(last_name: str = ""):
    """Exact-match lookup by last name. Uses a parameterized query."""
    return {"results": find_by_last_name(last_name)}


@app.get("/search")
def search(
    last_name: str = "",
    case_type: str = "",
    status: str = "",
    sort_by: str = "id",
    page: int = 1,
    page_size: int = 10,
):
    """V1 search. Preserves the original response shape."""
    return search_and_format(last_name, case_type, status, sort_by, page, page_size)


@app.get("/search/v2")
def search_v2_endpoint(
    last_name: str = "",
    case_type: str = "",
    status: str = "",
    sort_by: str = "id",
    page: int = 1,
    page_size: int = 10,
):
    """V2 search with full pagination metadata."""
    return search_v2(last_name, case_type, status, sort_by, page, page_size)

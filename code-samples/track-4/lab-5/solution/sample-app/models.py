"""Pydantic models for the constituent records search service."""

from pydantic import BaseModel


class ConstituentRecord(BaseModel):
    """One row in the records table.

    Fields mirror the SQLite schema. All values are synthetic.
    """

    id: int
    last_name: str
    first_name: str
    case_type: str
    opened_on: str
    status: str


class SearchRequest(BaseModel):
    """Filters accepted by the search endpoint.

    Empty strings mean "do not filter on this field."
    """

    last_name: str = ""
    case_type: str = ""
    status: str = ""
    sort_by: str = "id"
    page: int = 1
    page_size: int = 10


class SearchResponse(BaseModel):
    """Shape returned by the v2 search endpoint."""

    count: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool
    results: list[ConstituentRecord]

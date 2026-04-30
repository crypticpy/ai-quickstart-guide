from pydantic import BaseModel


class ConstituentRecord(BaseModel):
    id: int
    last_name: str
    first_name: str
    case_type: str
    opened_on: str
    status: str


class SearchRequest(BaseModel):
    last_name = ""
    case_type = ""
    status = ""


class SearchResponse(BaseModel):
    count: int
    results: list

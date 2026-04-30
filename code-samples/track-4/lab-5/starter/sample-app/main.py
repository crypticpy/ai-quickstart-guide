from fastapi import FastAPI

from db import find_by_last_name, init_db
from search import search_and_format

app = FastAPI(title="Constituent Records Search (flawed)")


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/records")
def records(last_name: str = ""):
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
    return search_and_format(last_name, case_type, status, sort_by, page, page_size)

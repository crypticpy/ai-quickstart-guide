# Sample app: constituent records search (flawed by design)

This is a small FastAPI service over a SQLite table of fake constituent records. It is intentionally flawed. You will use an AI coding assistant to fix the flaws.

The data is fully synthetic. No real people, no PII.

Files:

- `main.py`: FastAPI app with `/health`, `/records`, `/search`.
- `db.py`: SQLite wrapper. Contains a SQL injection bug.
- `models.py`: Pydantic models. Missing docstrings and uses untyped attributes.
- `search.py`: A 60-line tangled function that filters, sorts, paginates, and formats. Refactor target.
- `test_main.py`: One passing test. Add the rest.

Run the app:

```bash
uvicorn main:app --reload
```

Run the tests:

```bash
pytest -q
```

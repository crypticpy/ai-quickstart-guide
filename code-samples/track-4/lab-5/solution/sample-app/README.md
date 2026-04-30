# Sample app: constituent records search (reference solution)

The state of the codebase after all five lab tasks are complete:

- `db.py` uses parameterized queries (no SQL injection).
- `search.py` is split into `filter_records`, `sort_records`, `paginate`, `format_for_display`. The original `search_and_format` is kept as a thin compose function for backward compatibility.
- `models.py` has typed fields and docstrings.
- `main.py` adds `/search/v2` with full pagination metadata.
- `test_main.py` covers the security regression, each helper, and the pagination math.

This is one reasonable shape, not the only correct answer. Your AI tool will produce something a bit different. That is fine. What matters is that the security issue is gone, the function is decomposed, the public API is documented, and the tests prove behavior.

Run the suite:

```bash
cd code-samples/track-4/lab-5/solution/sample-app
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
pytest -q
```

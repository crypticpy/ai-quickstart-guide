# Lab 4.5 tasks

Work through these in order. Each task takes about 25 minutes. After each one, run `pytest -q` to confirm the suite still passes.

The point is the workflow, not the code. You will use an AI coding assistant for every task. Read every diff before you accept it.

## Task 1: Find and fix the SQL injection in `db.py`

`find_by_last_name` builds the query with string concatenation. That is exploitable. Ask your AI tool to find the security issue, propose a parameterized fix, and add a regression test that proves the fix works (the malicious input must return zero rows, not all rows).

Verify:

- The fix uses parameterized queries (`?` placeholders), not string formatting.
- A new test asserts that `find_by_last_name("' OR '1'='1")` returns `[]`.

## Task 2: Add tests for the existing functions

Coverage on `db.py` and `search.py` is thin. Ask the AI to write tests for: `find_by_last_name` happy path, `find_by_last_name` empty result, and `search_and_format` with each combination of filters set or unset.

Verify:

- The new tests do not depend on a specific row count if the seed data changes; they assert on shape and on filter behavior.
- They run in under one second total.

## Task 3: Refactor the tangled function in `search.py`

`search_and_format` does four things at once. Ask the AI to split it into four functions: `filter_records`, `sort_records`, `paginate`, and `format_for_display`. Keep the public `search_and_format` signature so `main.py` still works without changes.

Verify:

- All previous tests still pass.
- Each new function has one job and is testable in isolation.
- Add at least one test per new helper.

## Task 4: Document the public API

`models.py` has no docstrings. The Pydantic models also use the old `attr = ""` style, which in Pydantic v2 does not declare a typed field. Ask the AI to fix the typing and to add docstrings on every public class and function in `models.py`, `db.py`, and `search.py`.

Verify:

- Every public symbol has a one or two line docstring.
- `SearchRequest` and `SearchResponse` use real type annotations (`last_name: str = ""`, `results: list[ConstituentRecord]`).
- The app still starts and tests still pass.

## Task 5: Add a paginated search feature

Right now `/search` always returns the same shape. Add a new endpoint `/search/v2` that returns `{ count, page, page_size, total_pages, has_next, has_prev, results }`. Ask the AI to implement it and to write tests for the pagination math (first page, middle page, last page, page out of range).

Verify:

- `total_pages = ceil(count / page_size)`.
- A page above the last page returns an empty `results` list, not a 500.
- The existing `/search` endpoint is unchanged.

## When you finish

Diff your work against `solution/sample-app/`. Note the differences. There is more than one correct answer for tasks 2 through 5; the solution is one reasonable shape, not the only shape.

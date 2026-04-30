# Lab 4.6 starter

Tests for a non-deterministic AI feature. The system under test is a
vendored copy of the Lab 4.2 constituent intake classifier in
`classifier/`. You do not edit the classifier in this lab. You write
the tests in `tests/`.

Five test files, each with TODOs:

- `test_golden.py`: accuracy on a 30-row labeled set.
- `test_judge.py`: LLM-as-judge on open-ended summaries.
- `test_regression.py`: compare prompt v1 and prompt v2.
- `test_property.py`: Hypothesis-style structural checks.
- `test_performance.py`: latency and cost budgets.

Install once from the repo root:

```bash
uv venv
source .venv/bin/activate
uv pip install -e ./code-samples/track-4/common
uv pip install -e ./code-samples/track-4/lab-6/starter
```

Or with pip:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ./code-samples/track-4/common
pip install -e ./code-samples/track-4/lab-6/starter
```

Run the tests:

```bash
cd code-samples/track-4/lab-6/starter

# First time: record cassettes against the live API (~$0.50).
RECORD_CASSETTES=1 ANTHROPIC_API_KEY=sk-ant-... pytest

# Every later run: replay from cassettes, no API calls.
pytest
```

Reference solution lives in `../solution/`.

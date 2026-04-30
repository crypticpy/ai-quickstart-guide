# Lab 4.2 solution

Reference implementation. Open this only after you have made the starter tests pass.

Run the unit tests (offline, no API key required):

```bash
cd code-samples/track-4/lab-2/solution
pytest -q
```

Run the full accuracy comparison against the synthetic test set (uses real API calls; expect about $0.30 in tokens against Claude Sonnet at the time of writing):

```bash
export ANTHROPIC_API_KEY=sk-ant-...
python classifier.py
```

Start the FastAPI service:

```bash
uvicorn main:app --reload
```

Sample request:

```bash
curl -X POST http://127.0.0.1:8000/classify \
    -H "Content-Type: application/json" \
    -d '{"message": "There is a pothole on Maple Street."}'
```

Expected: `{"department": "public_works", ...}`.

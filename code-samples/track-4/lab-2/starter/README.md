# Lab 4.2 starter

Skeleton code for the prompt engineering classifier lab. The goal: build three versions of a constituent-message classifier (zero-shot, few-shot, structured-output JSON), measure them against the synthetic test set in `../../common/synthetic_data/constituent_messages.jsonl`, and wrap the winner in a FastAPI endpoint.

Run the failing tests first to see what is missing:

```bash
cd code-samples/track-4/lab-2/starter
pytest -q
```

You will see failures pointing at the TODOs in `classifier.py` and `main.py`. Fill them in. When all tests pass, start the server with:

```bash
uvicorn main:app --reload
```

and POST a message to `http://127.0.0.1:8000/classify`.

The reference solution lives in `../solution/`. Try the lab first, then compare.

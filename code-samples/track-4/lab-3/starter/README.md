# Lab 4.3 starter

Skeleton code for the Retrieval-Augmented Generation lab. The goal: ingest a synthetic policy corpus, build a retriever over it, wrap a Claude call so answers are grounded in the retrieved chunks, and expose the whole thing as a FastAPI `/ask` endpoint.

Run the failing tests first to see what is missing:

```bash
cd code-samples/track-4/lab-3/starter
pytest -q
```

Tests will fail at the `NotImplementedError` markers in `ingest.py`, `retrieve.py`, and `rag.py`. Fill them in until the suite is green. Then start the service:

```bash
uvicorn main:app --reload
```

POST a question to `http://127.0.0.1:8000/ask`.

The reference solution lives in `../solution/`. Try the lab first, then compare.

## Notes

- The first time `ingest.py` runs, sentence-transformers downloads the `all-MiniLM-L6-v2` model (~80 MB) to your local cache. Subsequent runs are offline.
- Chroma persists to `.chroma/` next to the script. Delete that directory to start fresh.
- The 25 policy docs in `./data/` are fictional. They are written for training only.

# Lab 4.3 solution

Reference implementation of the RAG lab. Layout matches the starter:

- `data/` is the synthetic policy corpus, identical to the starter copy.
- `ingest.py` loads docs, chunks them, and writes to a local Chroma store.
- `retrieve.py` returns the top-k chunks for a question.
- `rag.py` ties retrieval to a Claude call and returns an answer with citations.
- `main.py` exposes a FastAPI `/ask` endpoint.
- `test_rag.py` covers ingest, chunking, retrieval, format_context, and answer.
- `eval.py` is the extra: compares baseline RAG against no-RAG and against two bad-RAG variants (huge chunks and `k=1`).

To run the evaluation:

```bash
cd code-samples/track-4/lab-3/solution
export ANTHROPIC_API_KEY=sk-ant-...
python eval.py
```

`eval.py` calls the real API and is the only file that does. The tests use a stub `complete` and run offline once the embedding model has been downloaded.

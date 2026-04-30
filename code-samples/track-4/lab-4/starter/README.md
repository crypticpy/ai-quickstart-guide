# Lab 4.4 starter

Skeleton code for the permit-status agent lab. The goal: build a tool-using agent that answers constituent questions about permit applications. You will define three tools, write the agent loop yourself, add guardrails, and capture an observability trace.

Synthetic data lives in `data/permits.json`. The records are fictional. No real persons, addresses, or applications.

Run the failing tests first to see what is missing:

```bash
cd code-samples/track-4/lab-4/starter
pytest -q
```

You will see failures pointing at the TODOs in `tools.py` and `agent.py`. Fill them in. When all tests pass, start the service with:

```bash
uvicorn main:app --reload
```

and POST a question to `http://127.0.0.1:8000/agent`.

The reference solution lives in `../solution/`. Try the lab first, then compare.

# Lab 4.4 solution

Reference answer for the permit-status agent lab. The starter is in `../starter/`.

What lives here:

- `tools.py` defines the three tools (`lookup_permit_by_id`, `list_permits_by_address`, `escalate_to_human`) plus input validation and a dispatch table.
- `agent.py` runs the agent loop. Read it once for the structure, then again for the iteration cap and the tool_result shape.
- `observability.py` writes a structured JSON log line for every agent run.
- `main.py` wires the agent into a FastAPI `/agent` endpoint.
- `data/permits.json` is the same synthetic dataset used in the starter.

Run the tests:

```bash
cd code-samples/track-4/lab-4/solution
pytest -q
```

Run the service against a real Anthropic key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
uvicorn main:app --reload
```

# Lab 4.8 starter: civic-assistant service

This is a project skeleton, not a tutorial directory. Treat it as the codebase
you would clone on day one of a new internal AI service.

## Layout

```
civic-assistant/
├── pyproject.toml
├── Dockerfile
├── compose.yaml
├── DEPLOYMENT.md          # template for the platform handoff doc
├── data/
│   ├── policy_corpus/     # vendored from lab 4.3
│   └── permits/           # vendored from lab 4.4
├── src/civic_assistant/
│   ├── main.py            # FastAPI app, three endpoints
│   ├── settings.py        # env-var config
│   ├── observability.py   # request logging, JSON formatter
│   ├── classify.py        # TODO: wrap the lab 4.7 classifier
│   ├── answer.py          # TODO: RAG layer over data/policy_corpus
│   ├── triage.py          # TODO: agent loop over classify + permits
│   └── _vendored/         # frozen copies of lab 4.7 + 4.4 modules
└── tests/                 # integration tests
```

## Run

```
pip install -e ../../common
pip install -e .
export ANTHROPIC_API_KEY=sk-ant-...
uvicorn civic_assistant.main:app --reload
```

Or under Docker Compose:

```
docker compose up --build
```

The lab page walks the build in four steps. Start there.

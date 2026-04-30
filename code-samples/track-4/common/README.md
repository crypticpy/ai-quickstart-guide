# Track 4 Shared Code

Shared scaffolding used by every Track 4 lab. Each lab's starter and solution directories import from here instead of re-declaring the LLM client and test data.

Contents:

- `llm_client.py`. Thin provider wrapper. `get_client(provider="anthropic")` returns a callable with the signature `complete(system: str, user: str, **kwargs) -> str`. Supports `anthropic`, `openai`, and `azure-openai`.
- `synthetic_data/constituent_messages.jsonl`. 60 synthetic 311-style messages with department labels. No real names, addresses, phone numbers, or case identifiers. Use for any lab that needs labeled intake data.
- `pyproject.toml`. Shared dependencies. Each lab's starter copies or extends this.

Install once at the repo root with either tool:

```bash
# uv (recommended)
uv venv
uv pip install -e ./code-samples/track-4/common

# pip
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ./code-samples/track-4/common
```

Then export an API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
# or
export OPENAI_API_KEY=sk-...
```

The wrapper reads the key from the environment. It does not write a config file and does not log the key.

Model IDs are provider-specific slugs used in API calls. Providers maintain the current list in their model/API docs, and agencies should also check their approved tools list before using a live model. You can set a model explicitly:

```bash
export ANTHROPIC_MODEL_ID=<provider-model-slug>
export OPENAI_MODEL_ID=<provider-model-slug>
export AZURE_OPENAI_DEPLOYMENT=<agency-deployment-name>
```

For Azure OpenAI, the deployment name configured in the Azure resource is usually the value passed to the SDK. Cloud-specific details such as regions, model availability, identity, and private networking change over time; treat the Track 4 code as a teaching scaffold and verify the current provider documentation before deployment.

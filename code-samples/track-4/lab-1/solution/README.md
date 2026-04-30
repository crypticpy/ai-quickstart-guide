# Lab 4.1 solution

Reference implementation for the LLM API fundamentals wrapper.

Run the offline tests:

```bash
cd code-samples/track-4/lab-1/solution
pytest -q
```

The wrapper uses a fake transport in tests. To adapt this for a live provider, replace the transport with the approved provider SDK or HTTP client and verify the current model ID in provider documentation.

Example environment variables:

```bash
export LLM_PROVIDER=anthropic
export ANTHROPIC_MODEL_ID=<provider-model-slug-from-current-docs>
export ANTHROPIC_API_KEY=<secret>
```

For Azure OpenAI, the model value is typically the agency's deployment name:

```bash
export LLM_PROVIDER=azure-openai
export AZURE_OPENAI_ENDPOINT=https://<resource-name>.openai.azure.com
export AZURE_OPENAI_DEPLOYMENT=<agency-approved-deployment-name>
export AZURE_OPENAI_API_KEY=<secret>
```

---
title: "Lab 4.2: Prompt Engineering for Public Service Workflows"
description: Build a constituent-intake classifier that compares zero-shot, few-shot, and structured-output prompts on a labeled test set, then wraps the winner in a FastAPI endpoint.
sidebar:
  order: 3
---

## What you will build

A Python and FastAPI service that classifies a constituent message into one of eight department buckets (public works, animal services, code enforcement, sanitation, utilities billing, permits and licensing, human services, general info). You will run three prompt strategies (zero-shot, few-shot, structured JSON) against a labeled test set of 60 synthetic messages, measure accuracy, and ship the strategy that wins.

## Why this matters for government work

Most agency intake queues are still routed by hand. A staff member reads the message, picks a department, and forwards it. That works at low volume and breaks down fast when 311 traffic spikes after a storm or a policy change. A short, well-tested prompt can take the first pass at routing and cut the manual queue. The point of this lab is not that prompts are magic. The point is that prompt design is a measurable engineering practice. In this lab you will see different wording choices change accuracy on the same model and the same data. That is the kind of result you can defend in a code review and a governance review.

## Prerequisites

- Python 3.12 ([download](https://www.python.org/downloads/))
- An Anthropic API key ([get one](https://console.anthropic.com/)) OR an OpenAI key ([get one](https://platform.openai.com/api-keys)) OR Azure OpenAI access. Examples default to Anthropic. The swap section at the end shows how to flip providers.
- ~$1 of API credit covers the whole lab.
- Estimated time: 90 minutes.
- Familiarity with Python virtual environments and `pytest`.

## Setup

Clone or copy the repo, then install the shared dependencies once.

Using `uv` (recommended; see the [uv install guide](https://docs.astral.sh/uv/getting-started/installation/)):

```bash
git clone <your-fork-of-this-repo>
cd ai-quickstart-guide
uv venv
source .venv/bin/activate
uv pip install -e ./code-samples/track-4/common
```

Or using `pip`:

```bash
cd ai-quickstart-guide
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ./code-samples/track-4/common
```

Export your API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Move into the lab starter directory and run the failing tests once to confirm the environment works:

```bash
cd code-samples/track-4/lab-2/starter
pytest -q
```

You will see failures for each `NotImplementedError`. That is correct. Your job is to make them pass.

## Walkthrough

### Step 1: Read the synthetic dataset

`code-samples/track-4/common/synthetic_data/constituent_messages.jsonl` holds 60 fabricated constituent messages with department labels. Open it and skim. Notice that:

- The first row is a comment row that names the file as synthetic. Skip it when you load.
- Some messages are easy ("There is a pothole on Maple Street"). Some sit on a boundary ("My ex turned off the utilities in my name without telling me. I think it is identity theft."). Boundary cases are where prompt design actually matters.
- The eight labels are listed in `classifier.py` as `DEPARTMENTS`.

You can confirm that no real personal information appears anywhere in the dataset. Synthetic data is the right default for a Track 4 lab; production work needs governance approval and a privacy review before any real intake data goes near a model.

### Step 2: Implement the zero-shot classifier

Open `classifier.py`. The first TODO is `classify_zero_shot`. The Anthropic prompt engineering overview explains the basic move: a system prompt that names the task, the labels, and the output format ([Anthropic prompt engineering overview](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview)). Write something like:

```python
ZERO_SHOT_SYSTEM = (
    "You route constituent messages to the right department. "
    "Reply with exactly one of these labels and nothing else:\n"
    + "\n".join(f"- {d}" for d in DEPARTMENTS)
)

def classify_zero_shot(message, complete):
    raw = complete(
        system=ZERO_SHOT_SYSTEM,
        user=f"Message:\n{message}\n\nLabel:",
        max_tokens=20,
        temperature=0.0,
    )
    return Prediction(label=_normalize_label(raw), raw=raw)
```

The `_normalize_label` helper exists because models will sometimes add a period, capitalize a word, or wrap the answer in a sentence. Treat the model's output as untrusted text and pin it to a known set of values before you act on it.

### Step 3: Add few-shot examples

Few-shot prompting includes a small number of labeled examples in the prompt itself, so the model learns the expected format and edge cases from the prompt rather than from training. The classic primer covers the technique in depth ([Lilian Weng on prompt engineering](https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/)). For this lab, take the first five rows of the dataset as your examples and evaluate on the remaining 55. Pass the examples through and format them as `Message: ... Label: ...` pairs in the user prompt.

Why pull examples from the same dataset? Because a real agency would do the same. Your existing intake archive is your few-shot corpus. The lab demonstrates the workflow with the synthetic set; production rollout uses your own.

### Step 4: Use structured output (JSON)

Structured output asks the model to reply with a JSON object instead of a bare label. You get two things: a confidence score the model can self-report, and a more reliable parse. Both Anthropic and OpenAI document structured output as a first-class feature ([OpenAI prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering), [Anthropic structured output guidance](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview)).

Your structured prompt should specify the exact JSON shape:

```text
{"department": "<one of the labels>", "confidence": <float between 0 and 1>}
```

When you parse the response, do not trust that it is well-formed. Wrap `json.loads` in a try block, and on failure return a safe default label like `general_info`. Production code routes messages from the public; a malformed model reply must not crash the request.

### Step 5: Measure all three on the held-out set

Run the comparison from the lab directory:

```bash
python classifier.py
```

You will see something like:

```text
evaluating on 55 held-out messages
zero-shot  accuracy: 78.18%
few-shot   accuracy: 87.27%
structured accuracy: 90.91%
```

Numbers will vary by model and by run because models are not deterministic at temperature zero on every endpoint. The shape of the result is what matters. Few-shot beats zero-shot. Structured output usually beats both because it is easier to parse and the confidence score lets you flag ambiguous cases for human review.

### Step 6: Wrap the winner in FastAPI

Open `main.py`. Import your structured-output classifier and wire it into the `/classify` endpoint. Start the service:

```bash
uvicorn main:app --reload
```

Then in a second terminal:

```bash
curl -X POST http://127.0.0.1:8000/classify \
    -H "Content-Type: application/json" \
    -d '{"message": "There is a pothole on Maple Street."}'
```

You should get back `{"department": "public_works", "raw": "..."}`.

## Checkpoints

1. `pytest -q` from `code-samples/track-4/lab-2/starter` reports all tests passing.
2. `python classifier.py` prints three accuracy numbers in the 70 to 95 percent range. Few-shot is at least as good as zero-shot.
3. `uvicorn main:app --reload` starts without an exception.
4. A `curl` to `/classify` with the pothole message returns `public_works`.
5. `curl http://127.0.0.1:8000/health` returns `{"status": "ok"}`.

## Exercises

1. **Build a confusion matrix.** Modify `evaluate` to record every `(gold, predicted)` pair and print a confusion matrix. Which two labels does the model confuse most often? What does that tell you about the dataset?
2. **Add an "uncertain" route.** When the structured classifier reports `confidence < 0.6`, return `human_review` instead of a department. How does that change the accuracy on confident predictions only?
3. **Test prompt sensitivity.** Reword the system prompt three different ways (terse, verbose, instruction-as-checklist). Run all three on the held-out set. The variance you see is the floor on how stable your prompt actually is.

Hints and a reference answer for each exercise live in `code-samples/track-4/lab-2/solution/`.

## Common problems

**Problem:** `RuntimeError: ANTHROPIC_API_KEY is not set in the environment.`
**Cause:** The shell session did not export the key, or you opened a new terminal that did not inherit it.
**Fix:** Run `export ANTHROPIC_API_KEY=sk-ant-...` in the same terminal. Confirm with `echo $ANTHROPIC_API_KEY`.

**Problem:** `ModuleNotFoundError: No module named 'llm_client'`.
**Cause:** Python cannot find the shared module because you ran the script from a different directory.
**Fix:** Run from inside `code-samples/track-4/lab-2/starter` (or the solution directory). The lab files prepend the common directory to `sys.path` based on their own location.

**Problem:** `pytest` reports `ImportError while loading conftest`.
**Cause:** Your virtual environment is not active.
**Fix:** Run `source .venv/bin/activate` and try again. Confirm with `which python` that you are inside the venv.

**Problem:** Accuracy is below 50 percent on zero-shot.
**Cause:** Your prompt is asking for the department by long name ("Public Works Department") but the labels are short snake_case strings.
**Fix:** Make the system prompt list the exact label strings the dataset uses, and add the line "Reply with exactly one of these labels and nothing else."

**Problem:** Structured output returns text like `Here is the JSON: {"department": ...}`.
**Cause:** The model added a leading explanation. The bare `json.loads` call fails.
**Fix:** Use a regex to pull the first `{...}` block out of the response before parsing. The reference solution does this with `re.search(r"\{.*\}", raw, re.DOTALL)`.

**Problem:** `anthropic.APIError: 429 Too Many Requests`.
**Cause:** The lab is running through the dataset in tight sequence and hitting per-minute rate limits on a free tier.
**Fix:** Add a `time.sleep(0.2)` between calls in the evaluation loop, or move to a paid tier ([Anthropic rate limits docs](https://docs.claude.com/en/api/rate-limits)).

**Problem:** FastAPI returns 500 on any request.
**Cause:** The `/classify` endpoint is still raising `NotImplementedError`.
**Fix:** Replace the body of `classify` with a call to your best classifier and return the `ClassifyResponse`.

**Problem:** All three strategies get the same accuracy.
**Cause:** Your `_normalize_label` is too aggressive and is forcing every output to a single fallback.
**Fix:** Add print statements inside `_normalize_label` to see what the model actually returned, then loosen the matching only as much as needed.

## Swap providers

The `llm_client.py` wrapper accepts a `provider` argument and an optional model ID. A model ID is the provider slug or deployment name used in the API call. Provider docs and agency policy determine which values are current and approved.

To switch from Anthropic to OpenAI, change one line at the top of `classifier.py` and use the model ID your agency has approved:

```python
complete = get_client(provider="openai", model="<approved-model-id>")
```

For Azure OpenAI, set `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, and `AZURE_OPENAI_DEPLOYMENT`, then call `get_client(provider="azure-openai")`. For Bedrock, Vertex AI, or another managed provider, follow that provider's current SDK documentation and implement the same wrapper shape: configuration in environment, provider adapter at the edge, normalized text result returned to the classifier.

## What you learned

- A prompt is a code artifact. It has versions, tests, and measurable behavior.
- Zero-shot, few-shot, and structured output are three distinct techniques with different trade-offs in accuracy, latency, and parse reliability.
- The right metric for a classifier is accuracy on a labeled held-out set, not impression after looking at three examples.
- Wrapping a working classifier in a small FastAPI endpoint is a 30-line job once the prompt is solid.

## Where to go next

- Lab 4.2 picks up the wrapper from this lab and adds tool use, so the agent can do more than label messages.
- The [Phase 5 Modular Platform overview](/phase-5-platform/) shows where prompt libraries live in the long term, once you have ten of them.
- The [Phase 3 secrets management page](/phase-3-infrastructure/secrets-management/) explains how to move the API key out of your shell and into agency-managed secrets storage before any real deployment.

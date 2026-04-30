# Track 4 Lab Template

This template is the canonical shape for every Track 4 lab page (Lab 4.1 through 4.8). Sister labs follow this structure so cohorts can move between labs without re-learning the page layout.

Voice rules (must follow):

- Plain language. Short sentences. Active voice.
- Zero em dashes. Use a period or comma instead.
- No marketing words: robust, comprehensive, seamless, leverage (verb), delve, vibrant, transformative, powerful, empower (verb), best-in-class, world-class, synergy, navigate (figurative), tapestry. None of those, ever.
- No filler intros ("In today's landscape..."). Get to the point.
- Cite every numerical claim or research finding with an inline markdown link to the actual source URL.
- Generic agency framing only. No real agency names.
- No exclamation points.

Stack rules:

- Python 3.12 + FastAPI for runnable code.
- Anthropic Claude as the default model in examples. Show how to swap to OpenAI / Azure / Bedrock at the end of each lab in a 5-line "Swap providers" subsection.
- Both `uv` and `pip` install paths in the Setup section.
- All code must run on a developer laptop without paid infrastructure beyond an API key.

Page sections (in this order):

```markdown
---
title: "Lab N: [Lab Title]"
description: [one sentence, no marketing language]
sidebar:
  order: [N]
---

## What you will build

[2-3 sentences. Concrete deliverable. No "we will explore."]

## Why this matters for government work

[3-5 sentences. Tie to a real agency situation: a constituent service, a records request, an internal report. Generic agency framing only.]

## Prerequisites

- Python 3.12 ([download](https://www.python.org/downloads/))
- An Anthropic API key ([get one](https://console.anthropic.com/)) OR an OpenAI key OR Azure OpenAI access. Lab examples default to Anthropic; swap section at the end.
- ~$1 of API credit covers the whole lab.
- Estimated time: [N] minutes.

## Setup

[Exact commands. Tested. Use code blocks. Include uv AND pip variants.]

## Walkthrough

[The body of the lab. Sub-headings for each step. Each code block runnable.]

## Checkpoints

[3-5 numbered checkpoints. Each one a thing the learner can verify in their terminal or browser.]

## Exercises

[3 exercises that extend the lab. Hints provided. Solutions in `code-samples/track-4/lab-N/solution/`.]

## Common problems

[5-8 entries. Format: **Problem:** ... **Cause:** ... **Fix:** ... Use real error messages.]

## Swap providers

[5-line subsection showing how to swap Anthropic to OpenAI, Azure, or Bedrock. Code diff or env-var change.]

## What you learned

[Bulleted. Tie back to the "What you will build" promise.]

## Where to go next

[2-3 links to other site pages: the next lab, a Phase 5 module, a relevant Phase 3 infra page.]
```

Code-samples directory shape (one per lab):

```
code-samples/track-4/lab-N/
├── starter/
│   ├── README.md
│   ├── [main lab module].py     # skeleton with TODOs
│   ├── test_[main module].py    # failing tests the learner makes pass
│   └── main.py                  # FastAPI scaffold (if the lab ends in an endpoint)
└── solution/
    ├── README.md
    ├── [main lab module].py
    ├── test_[main module].py
    └── main.py
```

Shared dependencies and the LLM client wrapper live in `code-samples/track-4/common/`. Labs import from there so all eight share one provider-swap surface.

Self-review checklist before declaring a lab done:

1. Search the file for the literal em dash character. Replace each one.
2. Search for every banned phrase listed above. Rewrite any hit.
3. Verify every numerical or research claim has an inline link to a real URL.
4. Run the starter code and the solution code on a clean Python 3.12 venv. Both must execute.
5. Run `npm run build` from `ai-quickstart-guide/`. The site must build without errors.

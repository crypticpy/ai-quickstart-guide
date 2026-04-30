---
title: "Lab 4.5: Working with AI Coding Assistants"
description: Five hands-on tasks against an intentionally flawed codebase teach how to use AI coding tools effectively, including when to verify and when to trust.
sidebar:
  order: 6
---

## What you will build

Not a service. A workflow. You will use an AI coding assistant (Claude Code, GitHub Copilot, Cursor, or Continue.dev) to fix a small intentionally flawed Python codebase. The codebase is a constituent records search service with a SQL injection bug, a tangled function, missing tests, and no docstrings. You will work through five tasks, read every diff the AI proposes, and commit only what you can defend in a code review.

## Why this matters for government work

AI coding tools are not a future bet. The [JetBrains AI Pulse 2026 survey](https://blog.jetbrains.com/research/2026/04/which-ai-coding-tools-do-developers-actually-use-at-work/) reports that 90 percent of professional developers use AI coding tools regularly. A Microsoft randomized controlled trial of GitHub Copilot at three large enterprises found a 26 percent increase in completed tasks for tool users ([Cui et al., arXiv 2509.20353](https://arxiv.org/html/2509.20353v2)). A field experiment with Accenture engineers found an 11 percent higher pull request merge rate and 84 percent more successful builds among Copilot users ([GitHub research write-up](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/)).

For government dev shops, the procurement question got simpler in April 2026. GitHub Copilot earned a [FedRAMP Moderate authorization](https://github.blog/changelog/2026-04-13-copilot-data-residency-in-us-eu-and-fedramp-compliance-now-available/), which lifts the last common blocker on federal use. That moves the conversation from "can we use these tools" to "how do our developers use them well." This lab answers the second question. The skills transfer across vendors. What you practice here works whether your agency standardizes on Copilot, Claude Code, Cursor, or an open-source alternative like Continue.dev.

## Prerequisites

- Python 3.12 ([download](https://www.python.org/downloads/)).
- One AI coding assistant installed and authenticated. The lab is tool-agnostic. Pick one of:
  - [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) (terminal-based, Anthropic API key).
  - [GitHub Copilot](https://docs.github.com/en/copilot) (IDE plugin, GitHub subscription).
  - [Cursor](https://docs.cursor.com/) (forked VS Code, subscription).
  - [Continue.dev](https://docs.continue.dev/) (open-source, runs against a model you supply).
- The free tier of any of these tools is enough to complete the lab.
- Estimated cost: about $1 to $2 of API spend if you use Claude Code on Sonnet. Subscription cost otherwise. No paid infrastructure needed.
- Estimated time: 120 minutes total, about 25 minutes per task.

## Setup

Move into the lab starter directory and install the sample app:

```bash
cd code-samples/track-4/lab-5/starter/sample-app
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

Or with `uv`:

```bash
cd code-samples/track-4/lab-5/starter/sample-app
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
```

Run the test suite once to confirm the baseline:

```bash
pytest -q
```

You should see exactly one passing test (`test_health_returns_ok`). That is the starting line.

Open `tasks.md` in the parent directory. It lists the five tasks in order. Open the sample app in your AI coding assistant of choice. Point the assistant at the directory `code-samples/track-4/lab-5/starter/sample-app/`.

## Walkthrough

The pattern for every task is the same:

1. Tell the assistant what to do, with enough context that it can act.
2. Read the diff before you accept anything.
3. Run `pytest -q`.
4. Commit if green. Revert and reprompt if not.

### Task 1: Find and fix the SQL injection

Open `db.py`. The function `find_by_last_name` builds the query with string concatenation. Try this first to see the bug yourself:

```python
from db import init_db, find_by_last_name
init_db()
print(len(find_by_last_name("' OR '1'='1")))
```

That prints `15`. Every row. The query becomes `SELECT * FROM records WHERE last_name = '' OR '1'='1'`, which is always true.

Now hand it to your AI assistant. A prompt that works across tools:

> Find the security issue in `db.py`. Explain it in two sentences. Propose a fix that uses parameterized queries. Add a regression test in `test_main.py` named `test_sql_injection_returns_no_rows` that proves the fix.

What to verify in the response:

- The fix replaces the concatenation with a `?` placeholder and a parameter tuple, like `cur.execute("SELECT * FROM records WHERE last_name = ?", (last_name,))`. If you see `f"... {last_name}"` or `% last_name`, that is still vulnerable. Reject it.
- The regression test calls `find_by_last_name("' OR '1'='1")` and asserts the result is `[]`.
- No other code changed.

Commit the fix and the test. Run `pytest -q`. You should now see two passing tests.

### Task 2: Write tests for the existing functions

Coverage is thin. Hand the assistant the next task:

> Look at `db.py` and `search.py`. The only test we have covers `/health` and the SQL injection regression. Write tests in `test_main.py` for: `find_by_last_name` happy path, `find_by_last_name` with a name that does not exist, and `search_and_format` with each filter set in isolation and with no filters. Use the `init_db()` setup that the existing tests use. Tests should run in under one second total.

What to verify:

- Tests do not assert on a fixed row count from `all_records()`. If the seed data changes, brittle tests break. Good tests assert on shape ("at least one row," "all returned rows match the filter"), not on a magic number.
- Each test has a clear name. `test_filter_by_case_type` is good. `test_search_1` is not.
- `pytest -q` runs in well under a second. If your AI added `time.sleep()` or hits the network, reject it.

Run `pytest -q`. You should see seven or eight passing tests now.

### Task 3: Refactor the tangled function

`search.py` has a 60-line function called `search_and_format` that does four things at once: filter, sort, paginate, format. Refactor target.

A prompt that gets clean output:

> Refactor `search.py`. Split `search_and_format` into four functions: `filter_records(rows, last_name, case_type, status)`, `sort_records(rows, sort_by)`, `paginate(rows, page, page_size)`, and `format_for_display(row)`. Keep `search_and_format` as a thin function that calls the four helpers, so `main.py` does not change. Add tests for each new helper.

What to verify:

- All previous tests still pass without modification.
- Each new function has a single job. If `filter_records` also sorts, reject it.
- The original public signature of `search_and_format` is preserved. `main.py` should not need any edits.

This is the task most likely to break the suite. AI tools sometimes "improve" the function in ways that change behavior. If `pytest -q` goes red, do not let the tool keep editing. Revert with `git checkout -- search.py`, reprompt with the constraint "do not change the public behavior, only the internal structure," and try again.

### Task 4: Document the public API

`models.py` has no docstrings, and the Pydantic models use the old-style `attr = ""` form which in Pydantic v2 does not declare a typed field. Hand it over:

> In `models.py`, `db.py`, and `search.py`, add a one or two line docstring to every public class and function. In `models.py`, fix the Pydantic v2 typing: use `field_name: str = ""` instead of `field_name = ""`. Do not add docstrings to private helpers (those starting with underscore). Do not change behavior.

What to verify:

- Every public symbol now has a docstring.
- `SearchRequest` and `SearchResponse` use real type annotations. If you see `last_name = ""` (no type), that is the old broken form. Reject it.
- App still starts, tests still pass.

### Task 5: Add a paginated search feature, then catch the bug

Right now `/search` returns `{count, page, page_size, results}` with no way to know if there is a next page. Add a v2 endpoint:

> Add a new endpoint `GET /search/v2` that returns the same data as `/search` but with these extra fields: `total_pages`, `has_next`, `has_prev`. Use `math.ceil(count / page_size)` for `total_pages`. Do not change the existing `/search` endpoint. Add tests for the pagination math: first page, middle page, last page, and a page above the last page.

This is the task where you should expect the AI to get it slightly wrong. Specifically, watch for:

- **Subtle bug to catch:** Many AI tools will write `has_next = page < total_pages` without checking that the current page actually has rows. With a `page` set above the last page, the slice returns an empty list but `page < total_pages` can still be true if the model never coerced `page` into range. Run the test for "page out of range" and confirm `has_next` is `False`.
- **Off-by-one in `total_pages`:** if the AI uses `count // page_size` instead of `math.ceil`, you lose the last partial page. The test `total_pages == 3` for 15 records and `page_size = 5` will pass either way; try `page_size = 4` (15 / 4 should be 4 pages, not 3).
- **Page above the last page returns 500:** if `paginate` raises on out-of-range input, that is a bug. The right behavior is an empty `results` list, not a crash.

Read the diff. Run the suite. If the AI's first attempt has any of those bugs, push back with a specific, concrete reprompt:

> Your `has_next` returns True when page is above total_pages. Add a check that the current page actually has rows. Show me only the corrected function.

That is the workflow. AI proposes, you verify, you reprompt with the specific failure, you accept once it is right.

## Checkpoints

Run `pytest -q` from `code-samples/track-4/lab-5/starter/sample-app` after each task.

1. After task 1: at least two passing tests, including `test_sql_injection_returns_no_rows`.
2. After task 2: seven or more passing tests.
3. After task 3: same tests pass; `search.py` now contains four named helpers plus a thin compose function.
4. After task 4: same tests pass; every public symbol has a docstring.
5. After task 5: at least 12 passing tests, including the pagination edge cases. `curl http://127.0.0.1:8000/search/v2?page=99` returns an empty results array, not a 500.

If any checkpoint goes red, do not move on. The point of the lab is the discipline of not committing broken AI output.

## Exercises

1. **Switch tools and redo task 1.** Whatever tool you used for the lab, use a different one for this exercise. If you used Claude Code, try Copilot. If you used Copilot, try Cursor. Compare the two diffs. Note where the prompt that worked in tool A produced a different shape in tool B.
2. **Ask the tool to explain its own diff.** After task 3, before you commit, ask: "Explain why this refactor is equivalent to the original. Walk through the path of one input." A good answer cites specific lines. A bad answer is vague. The exercise builds the habit of asking for justification, not just code.
3. **Generate the changelog entry.** Ask the tool to write a `CHANGELOG.md` entry covering all five tasks, in the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. Verify the entry under "Security" mentions the SQL injection fix; verify nothing under "Added" mentions a feature you did not actually add.

## Common problems

**Problem:** The AI tool refuses with "I cannot help with that" when you ask about the SQL injection.
**Cause:** The prompt looked like a request to write an exploit. Some tools are conservative about offensive security framing.
**Fix:** Reframe as defensive. "Find the security vulnerability in this function and propose a parameterized fix." That phrasing works across every tool tested.

**Problem:** The AI tool produces a working but still insecure fix.
**Cause:** It replaced concatenation with an f-string. The injection still works.
**Fix:** Read the diff before accepting. The line should read `cur.execute("SELECT * FROM records WHERE last_name = ?", (last_name,))`. If it reads `cur.execute(f"SELECT * FROM records WHERE last_name = '{last_name}'")`, reject and reprompt with the explicit constraint "use a parameterized query with `?` placeholders, not string interpolation."

**Problem:** The AI tool over-refactors during task 3 and breaks tests.
**Cause:** Given an open-ended refactor request, models often "improve" things that were not asked to be improved, like renaming public functions.
**Fix:** Revert with `git checkout -- search.py`. Reprompt with stricter constraints: "Only change the internal structure. Public function signatures stay identical. `main.py` must not need edits."

**Problem:** Tests pass locally but fail in CI.
**Cause:** The AI added an absolute path or a system-specific assumption (line endings, locale, time zone).
**Fix:** Diff the failing test against the rest of the suite. Replace any absolute path with one derived from `pathlib.Path(__file__).parent`. Pin time zone to UTC if a date is involved.

**Problem:** The AI tool generates tests that import a function that does not exist.
**Cause:** It hallucinated a name from the prompt rather than reading the file.
**Fix:** Always run `pytest -q` after accepting AI-generated tests. If you get an `ImportError`, paste the error back into the chat and ask the tool to fix it. Do not edit the test by hand to match a wrong name; the right move is to confirm what name actually exists in the source.

**Problem:** The diff in your IDE looks fine but `git diff` shows unexpected whitespace changes.
**Cause:** Some AI tools rewrite the whole file in a different style (tabs, trailing newline, line endings).
**Fix:** Configure the tool to make minimal edits. In Cursor and Continue.dev, that is a setting. In Claude Code, prompt with "make a minimal diff; do not reformat unrelated lines."

**Problem:** You accepted a change, ran tests, and now you cannot remember which AI suggestion broke the suite.
**Cause:** You committed only at the end, not after each task.
**Fix:** Commit after each green checkpoint. AI workflows multiply the value of small commits. The cost of a bad suggestion is one `git revert` instead of an hour of bisection.

**Problem:** The tool keeps suggesting code that uses a library you do not have installed.
**Cause:** Models default to popular libraries even when the project pins a smaller dependency set.
**Fix:** Tell it the constraint up front. "Use only the standard library and what is in `pyproject.toml`. Do not add new dependencies."

## Swap providers

The lab is tool-agnostic. The same prompts work across vendors with small workflow differences:

- **Claude Code** runs in your terminal. You point it at the directory and chat. It edits files in place. Best for whole-file refactors.
- **GitHub Copilot** runs as an IDE plugin. Inline suggestions plus a chat panel. Best for line-by-line completion in code you are already editing. FedRAMP Moderate as of [April 2026](https://github.blog/changelog/2026-04-13-copilot-data-residency-in-us-eu-and-fedramp-compliance-now-available/) for the Business and Enterprise tiers.
- **Cursor** is a forked VS Code with built-in chat and a multi-file edit mode. Best for cross-file changes that involve a few related files.
- **Continue.dev** is open source and runs against any backend you point it at, including Anthropic, OpenAI, Bedrock, or a local Ollama model. Best when your agency requires a self-hosted inference path.

The core skill is the same across all four: prompt with constraints, read the diff, run the tests, commit when green.

## What you learned

- AI coding tools speed up routine work. They do not replace verification.
- A prompt is a specification. Specific constraints produce specific output.
- The test suite is the contract. Run `pytest -q` after every accepted suggestion.
- Refactor prompts need explicit guardrails ("do not change public behavior") or models drift.
- Subtle bugs hide in plausible-looking code. Read the diff line by line, especially around boolean logic and edge cases.
- Tool choice matters less than workflow discipline. The same five tasks finish in roughly the same time across Claude Code, Copilot, Cursor, and Continue.dev.

## Where to go next

- [Lab 4.6: Testing AI Systems](/phase-2-education/track-4-developers/lab-6-testing-ai-systems/) takes the verification mindset further and applies it to AI-generated content, not just AI-generated code.
- The [Phase 4 AI-Assisted Development page](/phase-4-dev-stack/ai-assisted-development/) covers the agency-level posture: telemetry, audit trails, AI-disclosure norms.
- The [Phase 4 Coding Standards page](/phase-4-dev-stack/coding-standards/) names the review checklist your AI-assisted PRs need to pass before merge.

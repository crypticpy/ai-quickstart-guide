---
title: Lab 4 — AI Orchestration & Agents
description: Two-hour lab where developers build a multi-tool agent with function calling, error recovery, guardrails, and a human-in-loop approval step.
sidebar:
  order: 5
---

## Lab brief

Lab 4 extends the Lab 1–3 stack into multi-step workflows. Developers wire two real agency tools into an agent loop, add a human-in-loop approval gate for high-impact actions, and build the error-recovery and guardrail patterns that separate a demo agent from one that can run in a Tier-1 pilot.

## Audience and prerequisites

- Track 1 (AI Foundations) completed
- Working dev environment with Lab 1 wrapper, Lab 2 library, and Lab 3 retriever available
- Cloud sandbox access from [Phase 3](/phase-3-infrastructure/cloud-sandbox/)
- Two stub agency tools provided in the lab (a read tool and a write tool)
- Familiarity with JSON schemas

## Skills covered

- Multi-step agent workflows and loop control
- Tool use and function-calling schemas
- Error recovery, fallbacks, and bounded retries
- Guardrails for write actions and high-impact tools
- Human-in-loop approval gates and audit trails

## Lab output

A multi-tool agent with human-in-loop approval, wired to two real (or realistic stubbed) agency tools, committed to the cohort repo.

## Success criteria

- Working code in CI with a green agent-smoke-test job
- Code review passed by the lab facilitator or paired peer
- Agent deliverable committed to the cohort repo
- All write actions blocked behind an approval gate that produces an audit log entry
- Demonstrated graceful failure on a tool error injected during the lab review

## What this lab does NOT cover

- AI-assisted development tooling and gov-safe configuration — that is Lab 5
- Regression testing, bias review, and cost dashboards — that is Lab 6
- Module-level reuse and platform standards — that is Lab 7

## Resources

- Anthropic tool-use documentation
- OpenAI function-calling documentation
- NIST AI RMF Manage function (operational controls and human oversight)
- Phase 5 AI Orchestration module reference (forthcoming) for the platform target

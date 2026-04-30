---
title: Statistics and Sourcing
description: Every numerical claim made in this guide, with a link back to the underlying source.
sidebar:
  order: 5
---

## Why this page exists

Every research statistic in this playbook is traceable to a public source. If a claim is not on this page, it is not in the guide. Agencies that need to defend a recommendation to a board, a council, or a legislator should be able to follow each number to a primary document.

## How to read this page

Claims are grouped by topic. Each row gives the claim as it appears in the guide, the source, the date, and the sample where applicable. Open a correction request through the link at the bottom if you find a number that has drifted.

## Developer AI tool adoption

| Claim                                                                    | Source                                                                                                                                                | Date                     | Sample                                       |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------- |
| 90% of developers regularly use AI coding tools at work                  | [JetBrains AI Pulse](https://blog.jetbrains.com/research/2026/04/which-ai-coding-tools-do-developers-actually-use-at-work/)                           | Apr 2026 (Jan 2026 wave) | 10,000+ professional developers, 8 languages |
| 85% regularly use AI tools; 62% rely on at least one AI coding assistant | [JetBrains State of Developer Ecosystem 2025](https://blog.jetbrains.com/research/2025/10/state-of-developer-ecosystem-2025/)                         | Oct 2025                 | Annual census, tens of thousands             |
| 80% of new GitHub developers use Copilot in their first week             | [GitHub Octoverse 2025](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/) | Oct 2025                 | GitHub platform telemetry, 180M+ devs        |

## Developer productivity with AI tools

| Claim                                                             | Source                                                                                                                                                          | Date      | Sample                                 |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------- |
| 26% increase in completed tasks with Copilot                      | [arXiv 2509.20353: Microsoft RCT](https://arxiv.org/html/2509.20353v2)                                                                                          | Sep 2025  | 2-yr longitudinal RCT inside Microsoft |
| 11% higher PR merge rate, 84% more successful builds with Copilot | [GitHub + Accenture field experiment](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/) | 2024-2025 | 1,974 developers, randomized           |

## Government and federal procurement

| Claim                                                                            | Source                                                                                                                             | Date         |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| GitHub Copilot achieved FedRAMP Moderate authorization with US/EU data residency | [GitHub Changelog](https://github.blog/changelog/2026-04-13-copilot-data-residency-in-us-eu-and-fedramp-compliance-now-available/) | Apr 13, 2026 |
| iTutorGroup paid $365K EEOC settlement over AI hiring discrimination             | [EEOC press release](https://www.eeoc.gov/newsroom/itutorgroup-pay-365000-settle-eeoc-discriminatory-hiring-suit)                  | 2023         |

## Frameworks cited (load-bearing)

The playbook cites versioned frameworks across all six phases. The full reference list, with version numbers and notes on where each framework is load-bearing, lives on the [Frameworks Cited](/resources/frameworks-cited/) page. Headline references include NIST AI RMF 1.0, NIST AI 600-1 (Generative AI Profile, July 2024), OMB M-25-21 (April 2025; supersedes M-24-10), OMB M-25-22 (April 2025; supersedes M-24-18), SLSA v1.1, and the SPACE framework. Do not duplicate that content here; treat the Frameworks Cited page as the canonical source for framework citations and this page as the canonical source for numerical claims.

## Federal AI policy

| Claim                                                                                                    | Source                                                                                                                                                         | Date         |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| OMB M-25-21 directs federal agencies on AI innovation, governance, and public trust (supersedes M-24-10) | [OMB M-25-21](https://www.whitehouse.gov/wp-content/uploads/2025/02/M-25-21-Accelerating-Federal-Use-of-AI-through-Innovation-Governance-and-Public-Trust.pdf) | April 2025   |
| OMB M-25-22 governs AI acquisition by federal agencies (supersedes M-24-18)                              | [OMB M-25-22](https://www.whitehouse.gov/wp-content/uploads/2025/02/M-25-22-Driving-Efficient-Acquisition-of-Artificial-Intelligence-in-Government.pdf)        | April 2025   |
| NIST AI Risk Management Framework 1.0                                                                    | [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)                                                                                           | January 2023 |
| NIST GenAI Profile (NIST AI 600-1)                                                                       | [NIST AI 600-1](https://airc.nist.gov/airmf-resources/playbook/)                                                                                               | July 2024    |

## Security guidance

| Claim                                                             | Source                                                                                       | Date |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---- |
| Prompt injection is OWASP LLM Top 10 #1 risk for LLM applications | [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) | 2025 |
| SLSA v1.0 supply-chain integrity framework                        | [SLSA v1.0 spec](https://slsa.dev/spec/v1.0/)                                                | 2023 |

## Track 4 lab references

Tools and primary docs the Track 4 labs link to.

- [Anthropic prompt engineering overview](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview)
- [Anthropic tool use overview](https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview)
- [Anthropic contextual retrieval](https://www.anthropic.com/news/contextual-retrieval)
- [Anthropic Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OpenAI function calling](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Cockburn, Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [ChromaDB persistent client](https://docs.trychroma.com/docs/run-chroma/persistent-client)
- [sentence-transformers all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- [Hypothesis property-based testing](https://hypothesis.readthedocs.io/)

## Submitting a correction

Open an issue at the [GitHub repo](https://github.com/crypticpy/ai-quickstart-guide/issues) with the claim, where it appears in the guide, and the source you believe is correct. Pull requests that update both this page and the affected guide page in one commit are preferred.

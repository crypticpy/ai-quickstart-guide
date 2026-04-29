---
title: AI Maturity Model
description: Four-level model (Crawl → Walk → Run → Fly) with indicators per domain.
sidebar:
  order: 3
---

The maturity model is the agency's shared "where are we?" vocabulary across six domains: governance, education, infrastructure, development practices, platform, and applications. Use it to confirm a phase's prerequisites are met before starting, and to confirm its outcomes are met before declaring it done. Each level maps to specific milestone gates from the Gantt (G-01 through G-14) so a self-assessment is traceable to the same checkpoints used elsewhere in the guide.

## Four levels

| Level    | Theme      | Hallmark                                                                           |
| -------- | ---------- | ---------------------------------------------------------------------------------- |
| 1. Crawl | Discovery  | Acceptable use policy adopted; first staff trained                                 |
| 2. Walk  | Foundation | Sandbox operational; review committee active; first use cases scoped               |
| 3. Run   | Production | Modular platform running; first AI app in production; metrics tracked              |
| 4. Fly   | Scale      | Multiple apps in production; inner-source contributions; second-generation modules |

## Indicators by domain

### Governance

| Level | Indicator                                                             |
| ----- | --------------------------------------------------------------------- |
| Crawl | AUP drafted; committee identified but not yet meeting (pre G-01)      |
| Walk  | AUP signed; committee chartered; risk tiers in use (G-03 met)         |
| Run   | Procurement addendum live; quarterly compliance review running        |
| Fly   | Multi-jurisdiction matrix; standing sub-groups; annual policy refresh |

### Education

| Level | Indicator                                                                      |
| ----- | ------------------------------------------------------------------------------ |
| Crawl | Track 1 sessions scheduled; champions identified (G-02 in progress)            |
| Walk  | Track 1 delivered to all staff; Tracks 2–3 underway; intake form live (G-04)   |
| Run   | Tracks 4–7 delivered; champions network meeting monthly (G-11 met)             |
| Fly   | Cross-agency knowledge sharing; case studies published; Year-2 curriculum live |

### Infrastructure

| Level | Indicator                                                                   |
| ----- | --------------------------------------------------------------------------- |
| Crawl | Cloud account requested; SSO provider chosen                                |
| Walk  | Sandbox operational; SSO wired; secrets management in place (G-05 met)      |
| Run   | Staging tier with CI/CD, SBOM, signing, security baseline (G-06 / G-07 met) |
| Fly   | Multi-environment with confidential computing; platform team owns substrate |

### Development practices

| Level | Indicator                                                                |
| ----- | ------------------------------------------------------------------------ |
| Crawl | Stack decision pending; no shared standards                              |
| Walk  | Stack chosen; coding standards drafted; AI-assisted dev workflow piloted |
| Run   | Standards published and enforced in CI; testing strategy live (G-08 met) |
| Fly   | Inner-source contributions accepted; ADR cadence; mature review culture  |

### Platform

| Level | Indicator                                                                      |
| ----- | ------------------------------------------------------------------------------ |
| Crawl | Module taxonomy drafted; interface contracts under review                      |
| Walk  | First 3 core modules in testing (Auth, Data Grid, API Framework — G-09 met)    |
| Run   | All 7 core modules complete; module catalog published (G-12 met)               |
| Fly   | Second-generation modules; IDP operational; modules consumed by other agencies |

### Applications

| Level | Indicator                                                                |
| ----- | ------------------------------------------------------------------------ |
| Crawl | Use cases collected via intake; first archetype not yet selected         |
| Walk  | Starter archetype selected; architecture brief approved (G-10 met)       |
| Run   | First app in staging then production with monitoring (G-13 / G-14 met)   |
| Fly   | Multiple apps in production; inner-source contributions back to platform |

## How to use this model

Self-assess once at the start of each phase to confirm the prerequisite levels in upstream domains are met (e.g., Phase 3 expects Walk in governance; Phase 6 expects Walk in platform). Self-assess again at the end of the phase to confirm the outcomes have moved the relevant domain forward. The [Readiness Assessment](/getting-started/readiness-assessment/) scorecard maps directly onto these six domains, so its score is the input to a maturity self-assessment rather than a separate exercise.

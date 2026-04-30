---
title: How This Guide Compares to Other Public-Sector AI Resources
description: An honest comparison so an agency can pick the right starting point. Some teams need this guide. Some need NIST AI RMF. Some need both.
sidebar:
  order: 5
---

## Why this page exists

Public-sector AI guidance is a crowded space. Federal frameworks, local-government coalitions, international playbooks, and vendor white papers all compete for the same reader. This page lists the major resources, what each is for, and where this guide overlaps or fills a gap. The goal is honest routing, not promotion. If a different resource fits your situation better, use it.

## When to use which resource

### NIST AI Risk Management Framework

The [NIST AI RMF 1.0](https://www.nist.gov/itl/ai-risk-management-framework) and its companion [Playbook](https://airc.nist.gov/airmf-resources/playbook/) define seven trustworthy-AI characteristics (valid and reliable, safe, secure and resilient, accountable and transparent, explainable and interpretable, privacy-enhanced, fair with harmful bias managed) and four functions (Govern, Map, Measure, Manage). It is the strongest available vocabulary for AI risk in U.S. government work, and the [Generative AI Profile (NIST AI 600-1)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) extends it. The framework is voluntary, prescriptive on risk language, and intentionally light on implementation sequencing or staffing. Use it as the governance scaffolding behind whatever roadmap you adopt.

### GSA AI Guide for Government

The [GSA AI Guide for Government](https://coe.gsa.gov/coe/ai-guide-for-government/introduction/) is a federal-leaning resource from the GSA IT Modernization Centers of Excellence. It targets senior leaders and decision-makers thinking about enterprise AI investment. It covers responsible AI implementation, organizing and managing AI initiatives, and the building blocks for project-level use cases. It pairs well with the GSA's separate [AI guidance and resources hub](https://www.gsa.gov/technology/government-it-initiatives/artificial-intelligence/ai-guidance-and-resources). Use it if you are a federal agency or if you want a framing document aimed at the executive layer.

### GovAI Coalition

The [GovAI Coalition](https://www.sanjoseca.gov/your-government/departments-offices/information-technology/ai-reviews-algorithm-register/govai-coalition), started by the City of San José in 2023, now includes more than 600 public servants from over 250 local, county, and state agencies. It publishes [policy templates and resources](https://www.sanjoseca.gov/your-government/departments-offices/information-technology/artificial-intelligence-inventory/govai-coalition/templates-resources) including AI policy templates, incident response plans, vendor agreements, and an AI FactSheet. It also operates a public AI Registry. Use it for ready-to-adapt policy templates, especially if you are a local agency and want to skip writing those templates from scratch.

### UK Government AI Playbook

The [AI Playbook for the UK Government](https://www.gov.uk/government/publications/ai-playbook-for-the-uk-government), published February 2025 by the Government Digital Service, sets out 10 core principles and provides guidance for civil servants at varying levels of digital knowledge. It covers buying, implementing, and using AI solutions across machine learning, deep learning, NLP, computer vision, and generative AI. Even outside the UK it is useful as a comparator for how a national government structures cross-agency AI guidance.

### OMB Memos M-25-21 and M-25-22

The April 2025 OMB memos [M-25-21 (Accelerating Federal Use of AI)](https://www.whitehouse.gov/wp-content/uploads/2025/02/M-25-21-Accelerating-Federal-Use-of-AI-through-Innovation-Governance-and-Public-Trust.pdf) and [M-25-22 (Driving Efficient Acquisition of AI)](https://www.whitehouse.gov/wp-content/uploads/2025/02/M-25-22-Driving-Efficient-Acquisition-of-Artificial-Intelligence-in-Government.pdf) replaced the prior M-24-10 and M-24-18. These are mandates for U.S. federal agencies, not optional guides. M-25-21 covers governance, risk management, and minimum practices for high-impact AI; M-25-22 covers acquisition. If you are a federal agency, treat these as binding scope and use other resources for implementation work they do not prescribe. Many state and local readers still cite [M-24-10](https://www.whitehouse.gov/wp-content/uploads/2024/03/M-24-10-Advancing-Governance-Innovation-and-Risk-Management-for-Agency-Use-of-Artificial-Intelligence.pdf) as a reference document; it is still useful background even though it is no longer in force.

### Singapore AI Verify and Model AI Governance Framework

[AI Verify](https://aiverifyfoundation.sg/what-is-ai-verify/), maintained by the AI Verify Foundation and IMDA, is a testing framework and toolkit that lets organizations evaluate AI systems against 11 internationally recognized principles using a combination of technical tests and process checks. The companion [Model AI Governance Framework for Generative AI](https://aiverifyfoundation.sg/wp-content/uploads/2024/05/Model-AI-Governance-Framework-for-Generative-AI-May-2024-1-1.pdf) and the newer [Model Framework for Agentic AI](https://www.imda.gov.sg/-/media/imda/files/about/emerging-tech-and-research/artificial-intelligence/mgf-for-agentic-ai.pdf) extend that work. Use AI Verify when you need actual technical evaluation patterns, not just policy language. It is the strongest open testing toolkit in the comparison set.

### This guide (AI Quickstart Guide)

This guide targets state and local government agencies and is organized as a sequenced six-phase, twelve-month roadmap from "we want to do AI" to a first AI application running on a modular platform. It ships three calibrated paths (Small, Standard, Large) that adjust timeline, budget, staffing, and per-phase scope. Six named off-ramps mark complete-and-valuable stop points, so a partial completion still produces a real deliverable. Seven training tracks cover all staff including a dedicated middle-manager track that other guides skip. The reference architecture is modular and stack-agnostic. We are honest about what we do not try to do: federal acquisition coverage is light, and our AI testing methodology does not match the depth of NIST or AI Verify.

## Feature matrix

The cells use plain words: **covered**, **partial**, **not covered**. Each row reflects what the published resource actually does, not what its marketing implies.

| Feature                                   | NIST AI RMF | GSA AI Guide | GovAI Coalition | UK Playbook | OMB M-25-21 / M-25-22 | AI Verify (Singapore) | This Guide  |
| ----------------------------------------- | ----------- | ------------ | --------------- | ----------- | --------------------- | --------------------- | ----------- |
| Risk classification vocabulary            | covered     | partial      | partial         | covered     | covered               | covered               | covered     |
| 12-month implementation roadmap           | not covered | not covered  | not covered     | partial     | not covered           | not covered           | covered     |
| Sized variants (Small / Standard / Large) | not covered | not covered  | not covered     | not covered | not covered           | not covered           | covered     |
| Named off-ramps                           | not covered | not covered  | not covered     | not covered | not covered           | not covered           | covered     |
| Modular reference architecture            | not covered | partial      | not covered     | partial     | not covered           | not covered           | covered     |
| Middle-manager training track             | not covered | not covered  | not covered     | not covered | not covered           | not covered           | covered     |
| Federal procurement guidance              | not covered | covered      | not covered     | not covered | covered               | not covered           | partial     |
| Technical testing methodology             | partial     | not covered  | not covered     | partial     | not covered           | covered               | partial     |
| Policy templates ready to adopt           | not covered | not covered  | covered         | partial     | not covered           | not covered           | covered     |
| Algorithm register / public transparency  | not covered | not covered  | covered         | partial     | partial               | not covered           | partial     |
| State and local focus                     | not covered | not covered  | covered         | not covered | not covered           | not covered           | covered     |
| Federal mandate (binding)                 | not covered | not covered  | not covered     | not covered | covered               | not covered           | not covered |

## How to combine

NIST AI RMF plus this guide is a common pairing. NIST gives you the risk language and the Govern/Map/Measure/Manage scaffolding; this guide gives you the implementation sequence and the modular architecture. Federal agencies should treat M-25-21 and M-25-22 as binding scope and use this guide for the implementation work the memos do not prescribe. Local agencies often pair this guide with GovAI Coalition templates: adopt the templates, then run them through the Phase 1 sequence here. Anyone serious about technical evaluation should add AI Verify on top of whichever roadmap they pick.

## What this guide does NOT do

- Does not replace federal acquisition guidance. For federal procurement, use [GSA's AI guidance hub](https://www.gsa.gov/technology/government-it-initiatives/artificial-intelligence/ai-guidance-and-resources) and OMB M-25-22.
- Does not provide formal AI testing methodologies at the depth of NIST or AI Verify. Use those for evaluation rigor.
- Does not maintain a current legislative tracker. See the legislative-compliance page disclaimer for why and what to use instead.
- Does not certify any vendor or product. The guide is stack-agnostic and vendor-neutral.
- Does not include sector-specific deep dives (health, criminal justice, education) beyond starter-project archetypes.
- Does not produce final policy language for an agency. The Phase 1 templates are starting points and need legal review before adoption.

## Where to start

- If you are state or local: this guide.
- If you are U.S. federal: M-25-21 and M-25-22 first, then this guide for implementation.
- If you are UK central government: the UK AI Playbook first, then this guide for engineering practices.
- If your blocker is risk language: NIST AI RMF first.
- If your blocker is procurement: GSA AI Guide and OMB M-25-22.
- If your blocker is technical evaluation: AI Verify.
- If your blocker is a written AI policy you can adopt next week: GovAI Coalition templates, then come back here for sequencing.

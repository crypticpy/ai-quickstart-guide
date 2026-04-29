---
title: Glossary
description: Plain-language definitions of AI and modern-development terms used throughout the guide.
sidebar:
  order: 4
---

> **Status:** Placeholder. The full glossary (60+ terms) ships in Sprint 1.

A short starter list — the rest gets filled in as content is written and any term that confuses a reader earns its way in.

## A

**ADR (Architecture Decision Record).** A short Markdown document that records _why_ a non-obvious technical choice was made. Lives in the repo next to the code so the reasoning survives staff turnover.

**AUP (Acceptable Use Policy).** The agency's policy that says what staff can and can't do with AI tools. Phase 1 produces this from a template.

## H

**Hexagonal architecture (a.k.a. ports-and-adapters).** A way to build software so the core logic doesn't care where its data comes from — you can swap databases, APIs, or AI providers without rewriting the app.

## I

**IDP (Internal Developer Platform).** A self-service system where developers can deploy apps and create test environments without filing IT tickets.

**Inner source.** Using open-source collaboration practices (transparent code reviews, shared contributions) inside your organization.

## R

**RAG (Retrieval-Augmented Generation).** An AI pattern where the model is given relevant documents to read before answering, instead of relying only on its training. Used heavily in document-intelligence apps.

**RAD platform.** The reference modular platform shipped as a separate open-source repo. Concrete example of the patterns this guide teaches.

## S

**SBOM (Software Bill of Materials).** A list of every ingredient in your software so you know if any component has a known security issue.

**SLSA (Supply chain Levels for Software Artifacts).** A checklist that proves your software wasn't tampered with between writing and deploying it.

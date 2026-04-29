---
title: Offline Pack
description: How to use release PDF, DOCX, and Markdown artifacts when staff cannot access the live site.
sidebar:
  order: 4
---

Some agencies cannot rely on GitHub Pages during training, council briefings, or field work. The release workflow publishes an offline pack containing:

- `ai-quickstart-guide.pdf` — read-only playbook for distribution.
- `ai-quickstart-guide.docx` — editable copy for local annotations and policy review.
- `playbook.md` — print-safe Markdown source generated from the MDX site.

## When to use it

Use the offline pack when staff are on locked-down networks, training rooms do not have reliable internet, or legal/procurement reviewers need a Word copy for redlines. The live site remains the best experience for interactive forms, calculators, and path-aware components.

## What does not work offline

Interactive browser components are represented by static fallback notes in the exported playbook. For the fillable experience, use the live site:

- Readiness Assessment
- AUP Wizard
- Review Committee Charter Wizard
- Risk Tier Picker
- Use Case Intake Form
- Use Case Inventory
- ROI Calculator
- Compliance Matrix filter
- Starter Project Selector

## Operating pattern

1. Download the latest release offline pack.
2. Distribute the PDF for broad reading.
3. Use the DOCX for legal, HR, procurement, or executive edits.
4. Keep generated edits in your agency fork, not only in local Word files.
5. Re-export after each upstream upgrade so the offline copy does not drift from the site.

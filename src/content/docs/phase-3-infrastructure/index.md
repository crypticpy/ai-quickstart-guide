---
title: Phase 3 — Infrastructure & Security
description: Stand up a secure, isolated development environment. Months 2–5.
sidebar:
  order: 1
---

> **Status:** Placeholder. Scheduled for Sprint 3.

## Objective

Stand up a secure, isolated development environment where teams can experiment with AI without risking production systems or exposing sensitive data.

## Deliverables

- Cloud sandbox provisioning guide (Azure primary; AWS / GCP alternatives)
- Identity & access management (Entra ID / Okta / Auth0)
- CI/CD pipeline (GitHub Actions, trunk-based, SBOM, SLSA Level 2)
- Secrets management (Key Vault / Secrets Manager / Vault)
- Container orchestration (Azure Container Apps / Kubernetes)
- Security baseline (DLP, network segmentation, data classification)
- Observability foundation (OpenTelemetry, centralized logging, basic SLOs)

## Hard dependency

Phase 3 cannot start before Phase 1 governance is complete. Cloud provisioning requests need governance approval; security policies must exist before infrastructure is configured.

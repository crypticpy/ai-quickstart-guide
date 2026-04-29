---
title: "Lab 8 — Capstone: End-to-End AI Feature"
description: Capstone session where developers integrate three or more platform modules into a deployed AI feature passing CI/CD, security review, and documentation gates.
sidebar:
  order: 9
---

## Lab brief

Lab 8 is the integration test for everything Track 4 has taught. Developers compose three or more platform modules into a working AI feature, push it through the agency CI/CD pipeline, pass a security review, and ship documentation a successor team could pick up. This is the lab that proves the cohort can build for production, not just for a sandbox.

## Audience and prerequisites

- Track 1 (AI Foundations) completed
- Working dev environment with Labs 1–7 deliverables available
- Cloud sandbox access from [Phase 3](/phase-3-infrastructure/cloud-sandbox/)
- Reviewed [Phase 3 CI/CD pipeline](/phase-3-infrastructure/cicd-pipeline/) and the Phase 5 module catalog
- A scoped Tier-1 or Tier-2 use case from the intake pipeline

## Skills covered

- Composing three or more platform modules into one feature: Auth, Data Grid, and AI Orchestration from [Phase 5](/phase-5-platform/) at minimum
- Deploy to staging via the [Phase 3 CI/CD pipeline](/phase-3-infrastructure/cicd-pipeline/) with eval gates and rollback
- Security review preparation and documentation
- End-to-end observability and cost dashboards
- Handoff documentation for a successor team

## Lab output

A deployed AI feature using three or more platform modules — Auth, Data Grid, and AI Orchestration at minimum — running in staging behind eval gates, committed to the cohort repo.

## Success criteria

- Working code in CI with all required jobs green: build, eval, contract tests, security scan
- Code review passed by the lab facilitator and a non-cohort senior reviewer
- Feature deliverable committed to the cohort repo with deployment manifest
- At least three platform modules integrated (Auth, Data Grid, AI Orchestration) and one additional module of the developer's choosing
- Security review checklist completed and signed; rollback path demonstrated

## What this lab does NOT cover

- Production launch to general users — that is the [Phase 6 starter project](/phase-6-starter-projects/) responsibility
- Long-term feature ownership and on-call rotation — defined post-Track-4 by the platform team
- New module creation — that was Lab 7; Lab 8 consumes existing modules

## Resources

- [Phase 3 CI/CD pipeline](/phase-3-infrastructure/cicd-pipeline/)
- [Phase 5 — Modular Platform](/phase-5-platform/) module catalog
- NIST AI RMF Manage function (deployment, monitoring, incident response)
- Agency security review checklist (provided in the lab)

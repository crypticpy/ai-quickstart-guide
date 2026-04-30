---
title: CI/CD Pipeline
description: Protected-branch development, automated tests, SBOM generation, artifact signing, and SLSA Level 2 maturity targets — implemented on GitHub Actions, Azure DevOps, GitLab, or cloud-native runners.
sidebar:
  order: 4
---

The CI/CD pipeline is what turns "we should review this before deploy" into "this cannot deploy without review." Every gate that exists in policy — eval pass, security scan, license check, signed image — should exist in the pipeline as code, or it will be applied inconsistently. The Phase 3 target is a pipeline that runs on every change, deploys to every environment, attests its outputs, and refuses to ship anything that fails a gate. Small agencies can begin with protected branches, tests, secret scanning, and a documented manual deploy approval, then add SBOMs, signing, and provenance as maturity increases.

Pipeline tooling is largely interchangeable: GitHub Actions, Azure DevOps Pipelines, GitLab CI, and Google Cloud Build all support the gates this page describes. The agency's existing source-of-truth for code (typically GitHub or GitLab) usually decides the runner choice; do not introduce a second CI system to chase a feature.

## Trunk-based development

The branching model is decided in [Phase 4](/phase-4-dev-stack/). For new AI services, trunk-based development is the default:

- One long-lived branch (`main`).
- Short-lived feature branches (≤2 days) merged via PR.
- All merges to `main` go through CI gates.
- Releases are tags on `main`, not separate branches.
- Hotfixes branch from the last released tag, are tagged, and immediately merge back to `main`.

Trunk-based development keeps eval results, SBOMs, and provenance close to the artifact being shipped. If the agency uses release branches, vendor delivery branches, or change-control windows, apply the same gates to every protected branch and build once/promote by digest.

## Pipeline stages

The standard pipeline runs the following stages on every change. Failures block merge or deploy.

### Stage 1 — Static checks (target: 2 minutes)

- Lint and format (`ruff` or `flake8` for Python; `eslint` + `prettier` for TS; `golangci-lint`; `clippy`).
- Type check (`mypy --strict`, `tsc --noEmit`, etc.).
- License compliance scan against the agency's allowed-license list.
- Secret scan (`gitleaks`, `trufflehog`) — fail on any match.

### Stage 2 — Unit + contract tests (target: 5 minutes)

- Unit tests with coverage threshold (≥75% line coverage as a baseline; team can raise per repo).
- Contract tests (`pact` or equivalent) for any cross-service surface.
- Eval tests for AI components — the regression suite from [Track 4 Lab 4.6](/phase-2-education/track-4-developers/) runs as a CI gate. Drop in score below threshold blocks merge.

### Stage 3 — Build, scan, and sign (target: 5 minutes)

- Build container image with reproducible build flags (or build provenance via `slsa-github-generator` / `slsa-buildkit-provenance`).
- Generate SBOM (`syft`) and attach to the image.
- Scan image for vulnerabilities (`trivy`, `grype`, or cloud-native: ECR scanning, Defender for Containers, Artifact Registry scanning). Block on critical CVEs in production-bound builds.
- Sign image with `cosign` using an OIDC-issued, ephemeral key (sigstore / Fulcio). The signature is the build's identity claim — no human key, no long-lived signing material.
- Generate SLSA Level 2 provenance attestation (`slsa-github-generator` or equivalent for the chosen runner). Attach to the image.

### Stage 4 — Deploy to staging (auto)

- Apply IaC drift check; block if drift detected.
- Deploy via the platform's GitOps controller (Argo CD, Flux) or `kubectl apply` / `az containerapp update` / `gcloud run deploy`. Workload-identity authentication; no long-lived cloud keys in the pipeline.
- Run smoke tests against the staged deploy.
- Run full eval suite against the staged AI workloads.

### Stage 5 — Deploy to production (gated)

- Manual approval from a named approver (review-path designate for Tier-2; AI program lead or manager sponsor for Tier-1).
- Image must have a signed SLSA attestation (verified at admission).
- Eval gate must have passed in staging within last 24 hours.
- Deploy with progressive rollout (10% → 50% → 100%) and automatic rollback on SLO breach.

## SBOM generation

The SBOM is the primary artifact for "are we affected by CVE-XXXX?" The agency-wide pattern:

- Use **CycloneDX** as the SBOM format (broad tool support; works with the major scanners).
- Generate at build time with `syft packages dir:. -o cyclonedx-json` (or equivalent).
- Attach to the image as an OCI artifact (`cosign attest`).
- Push to a central SBOM repository (Dependency-Track, GUAC, or a simple S3/Blob/Storage bucket with index).
- Re-scan SBOMs nightly; alert on new CVEs against any deployed image.

Federal secure software attestation focuses on secure development practices. Depending on criticality, risk, and procurement language, agencies may also request supporting artifacts such as SBOMs. Generate SBOMs even when they are not strictly required; they make vulnerability response much faster. They are not free after automation, because someone still has to store, scan, triage, and remediate findings, but the operational cost is usually worth it.

## Artifact signing and verification

Signing closes the loop on supply chain. Without it, an image with the right name could come from anywhere; with it, the cluster admission controller verifies the image was built by the expected pipeline.

- **Sign at build time.** `cosign sign --key ... ` or, preferred, `cosign sign --identity-token` (keyless, OIDC-issued).
- **Verify at admission.** Use a Kubernetes admission controller (Kyverno, Connaisseur, Gatekeeper with a verify policy) that rejects images without a valid signature from the agency's OIDC issuer.
- **Verify at deploy.** For non-Kubernetes runtimes (Container Apps, App Runner, Cloud Run), verify in the deploy stage of the pipeline before the deploy command runs.

## SLSA Level 2 in practice

SLSA L2 is a strong standard/large-agency target and a useful maturity add for small agencies. The SLSA v1.1 model focuses on hosted builds and provenance. In practice, L2 requires:

1. The build runs on a hosted, version-controlled build platform (any major CI/CD service qualifies).
2. The build generates provenance describing what was built, by which build, from which source.
3. The provenance is signed by the build platform.
4. The provenance is non-falsifiable by the project authors.

The shortest path depends on the current runner and vendor support. Verify against the runner's current documentation before freezing the implementation:

- **GitHub Actions:** use the current SLSA generator or artifact attestation path supported for the repository type.
- **GitLab CI:** use GitLab's current provenance and attestation support where available.
- **Azure DevOps:** generate provenance through the build system or container build tooling, then attest with the agency's chosen signing approach.
- **Cloud Build:** use generated build provenance and verify it before promotion.

Document the chosen path in an ADR (Architecture Decision Record) so the agency has a stable answer when an auditor asks "show me your provenance."

## Eval as a gate

Adding model evals to the gate is the single most effective AI-specific CI improvement. The pattern:

1. The eval suite (from Track 4 Lab 4.6) is a directory of `(input, expected_output_signal)` cases plus a scorer.
2. The pipeline runs the suite against the candidate model + prompts on every PR.
3. Aggregate score must be within a tolerance band of the baseline; significant regressions block merge.
4. The PR comment shows score deltas and links to per-case diffs.

This is the Phase 3 hook for what Phase 5 will produce in volume. Even a 30-case eval suite catches more drift than no suite at all. Build it as soon as the first AI workload is in CI.

## Pipeline-as-code in the repo

Every pipeline definition lives in the repo it builds. No "click-ops" pipeline configuration. The reasons:

- Reviewable in PR.
- Reproducible across forks.
- Version-controlled with the code under change.
- Diffable when something breaks.

The pipeline definitions are themselves code: linted, tested where possible, and reviewed.

## Runners and isolation

CI runners are an attractive target — they hold credentials and run untrusted code (PR contributions). Pin them down:

- **Use ephemeral runners** wherever possible (GitHub Actions hosted runners, GitLab SaaS runners, ephemeral self-hosted via Actions Runner Controller / Kaniko).
- **No long-lived cloud keys on runners.** OIDC federation only.
- **Network egress allowlist.** Runners should not have free internet — only the package mirror, the registry, and necessary cloud endpoints.
- **Per-repo isolation.** A runner for one repository should not be able to reach another repository's secrets or another team's environment.

## Cost and time budgets

Pipelines that take 30+ minutes drive developers to push less often, which defeats the safety the pipeline is supposed to provide. Targets:

- Per-PR pipeline (lint + tests + build + sign): under 10 minutes.
- Full deploy-to-staging cycle: under 20 minutes.
- Full deploy-to-prod (after approval): under 10 minutes for the deploy itself.

Caching, parallelism, and selective test runs (`pytest --testmon`, `nx affected`) are how teams hold these targets as the codebase grows.

## Common pipeline failures

- **Manual artifact promotion.** "We build in dev and copy the image to prod" defeats provenance. Build once, promote with attestation.
- **The pipeline has admin in production.** It should not. Use deploy-only roles.
- **Eval gate is advisory, not blocking.** Then it gets ignored within a sprint. Make it block.
- **Secrets in CI variables.** Tempting, but rotates poorly and is hard to audit. Use the secrets manager via federated identity.
- **Nightly long-running tests.** Useful as a safety net, but the daily failure surface should be on the per-PR pipeline. If a class of failure only shows up at night, it shows up in production too.

## Related

- [Identity & Access](/phase-3-infrastructure/identity-access/) — the federated identity the pipeline uses
- [Container Orchestration](/phase-3-infrastructure/container-orchestration/) — admission control and verification
- [Secrets Management](/phase-3-infrastructure/secrets-management/) — what the pipeline retrieves at deploy time
- [Track 4 — Developer Upskilling](/phase-2-education/track-4-developers/) — where developers learn the eval discipline this pipeline enforces

# Security Policy

## Supported Versions

Security fixes target the current `main` branch and the latest tagged release. Before `v1.0.0`, maintainers may not backport fixes to older public-preview tags unless the issue is severe and easy to isolate.

## Reporting a Vulnerability

Do not open a public issue for vulnerabilities that include exploit details, secrets, private data, or a working attack path.

Preferred reporting path:

1. Use GitHub's private vulnerability reporting feature if it is enabled for the repository.
2. If private reporting is not available, open a public issue that says a vulnerability report is available and ask maintainers for a private contact path. Do not include exploit details in the issue.

Include:

- affected file, page, workflow, or code sample
- what an attacker or user could do
- whether the issue affects the published site, sample code, release workflow, or documentation guidance
- any safe reproduction steps that do not disclose secrets or private data

## Secrets and Private Data

Never commit:

- API keys, tokens, passwords, certificates, or private keys
- internal URLs, tenant IDs, or non-public infrastructure details
- real resident, student, patient, employee, benefit, enforcement, permit, or case data
- private procurement or vendor-confidential material

If a secret is committed, rotate it immediately through the owning provider before opening a cleanup PR.

## Scope

Security-sensitive areas include:

- GitHub Actions workflows
- release artifact generation
- interactive browser components
- Track 4 code samples
- guidance about secrets, identity, CI/CD, observability, AI-assisted development, and deployment

The guide itself is advisory. Agencies remain responsible for their own production security review, threat modeling, and compliance requirements.

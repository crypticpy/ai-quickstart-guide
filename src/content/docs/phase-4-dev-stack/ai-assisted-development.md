---
title: AI-Assisted Development
description: Common AI coding tool patterns, example configurations, reviewer expectations, and AI-generated code disclosure norms for government work.
sidebar:
  order: 5
---

By 2026, AI-assisted coding is part of normal software work. The [2026 JetBrains AI Pulse](https://blog.jetbrains.com/research/2026/04/which-ai-coding-tools-do-developers-actually-use-at-work/) found 90% of professional developers regularly use AI coding tools at work (10,000+ developer sample, January 2026 wave). Agencies that ban these tools often discover their developers are using personal accounts on personal laptops. The practical stance is neither prohibition nor laissez-faire. It is _configured_ adoption: a small set of approved tools, configured for government data handling, with clear reviewer expectations and a firm rule that the human committing the code is responsible for the code regardless of who or what wrote it.

## Common tool patterns

The agency does not need to approve every popular tool. Pick one or more tools that fit these patterns and can meet procurement, data-use, identity, and audit expectations.

| Pattern | Example tools | Fit |
| --- | --- | --- |
| Inline assistant | GitHub Copilot, JetBrains AI Assistant, Tabnine | Steady-state coding inside an open file; low-friction adoption |
| Agentic CLI/editor | Claude Code, OpenAI Codex, Aider | Bounded multi-file edits, exploratory work, refactors, long-context reasoning |
| AI-native IDE | Cursor, Windsurf, JetBrains IDEs with agents | Teams that want a single tool for completion, chat, and agentic edits |

Claude Code, GitHub Copilot, and Cursor are used below as concrete examples because they are common in 2026. They are not a universal approved list. If the agency has already procured a different tool, apply the same baseline controls to that tool.

## Minimum path when procurement is not ready

If there is no approved tenant, do not put agency code, secrets, confidential data, or production infrastructure into personal AI accounts. Developers can still learn with public samples, synthetic code, the Track 4 labs, or the reference implementation stripped of agency data. Move agency-code use into the approved tenant once procurement, data terms, and admin controls are ready.

## Configuration baseline (all tools)

Every approved tool should be configured to:

1. **Use the agency's tenant.** Tools that support enterprise/government tenants are configured against that tenant, not personal accounts. This puts admin controls and audit logs in the agency's hands.
2. **Disable model-training or product-improvement use of agency code where the tool supports it.** Verify the current admin setting and contract language.
3. **Use the agency's network where feasible.** Larger agencies may require egress proxy controls; smaller agencies may start with approved tenants, MFA, and admin review.
4. **Authenticate via SSO where available.** Personal Anthropic / OpenAI / GitHub accounts should not be used for agency code.
5. **Carry a deny-list** for sensitive paths (e.g., `secrets/`, `infra/production/`) where agentic tools should refuse to write without explicit per-action approval.

## Per-tool configuration

### Claude Code

- **Tenant.** Use the agency-procured Claude plan or API tier. Personal API keys should not be used for agency code.
- **Settings.** Project-level `.claude/settings.json` can be checked into each repo with shared configuration. Enterprise managed policies, where available, should override user/project settings for required controls. See Anthropic's [Claude Code settings](https://docs.anthropic.com/en/docs/claude-code/settings).
- **Permissions.** Deny reads of `.env`, credential files, and secret directories. Require approval for shell commands, file writes outside the project root, and sensitive paths by default.
- **Hooks.** Optional but recommended: a `PreToolUse` hook that logs approved metadata about tool calls and a `PostToolUse` hook that runs the formatter on edited files. Avoid logging secrets, raw protected code, or prompt content unless approved. See Anthropic's [hooks reference](https://docs.anthropic.com/en/docs/claude-code/hooks).
- **Skills / commands.** The agency can publish shared commands or skills (e.g., review, scaffold module, run evals) to encode common workflows. Treat named commands as local examples, not universal product features.
- **MCP servers.** Read-only MCP servers (monitoring, issue tracker, internal docs) can be useful. Write-capable MCP servers go through the same governance as any tool that mutates state. They need an authorization scope and an audit path. See Anthropic's [MCP documentation](https://docs.anthropic.com/en/docs/claude-code/mcp).
- **Code review.** AI-suggested commit messages are fine; AI-authored PR descriptions need a human review pass. Any automated review output is advisory, not authoritative.

### GitHub Copilot

- **Tier.** Copilot Business or Copilot Enterprise are common agency choices. GitHub currently states that Business and Enterprise data is not used to train GitHub's models; document the current statement and contract terms in the procurement package.
- **Public code matching.** Enable blocking or code referencing for suggestions matching public code where supported. This reduces, but does not eliminate, license and provenance risk.
- **Content exclusions.** Configure path-level exclusions so Copilot avoids `secrets/`, `infra/production/secrets/`, etc. Verify current [content exclusion](https://docs.github.com/en/copilot/concepts/content-exclusion-for-github-copilot) coverage before relying on it; GitHub documents limitations across some modes, symlinks, and remote filesystems.
- **Audit log.** Review Copilot audit logs. Small agencies can start with quarterly admin review of seats, settings, and policy changes. Standard/large agencies can stream logs to SIEM. GitHub's [audit log documentation](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-enterprise/review-audit-logs) notes that local client prompt/session data is not included.
- **Chat mode.** Authorized in IDE; not authorized for non-coding use (the chatbot is not the agency's general-purpose AI).

### Cursor

- **Tenant.** Cursor for Business or Enterprise where approved. Agency-procured workspace; SSO via the agency IdP where available.
- **Privacy mode.** Enabled by default for all users. Verify current [Cursor privacy and security](https://docs.cursor.com/account/privacy) documentation and contract terms, including code retention, prompts, telemetry, embeddings, metadata, and model-training use.
- **Indexing.** Cursor's repo indexing is opt-in per repo. Tier-2/3 repos should default to no indexing unless security approves the current indexing/data-handling model.
- **Extensions.** Cursor inherits VS Code extensions; the agency's allowlist (signed publishers, approved categories) applies.

### Foundation model used

AI coding tools rely on one or more foundation models. The agency should know which models are enabled and how they are selected.

- A **model ID** is the provider-maintained slug used in API calls or tool configuration, such as `<provider-model-id>`.
- Providers and tool vendors maintain current model lists; do not freeze model IDs in agency standards.
- Configure an allowed model list where the tool supports it.
- Review enabled models at renewal, when the vendor announces a model change, or when the agency's risk tier/data rules change.

When a model is procured for tool use, the [procurement addendum](/phase-1-governance/procurement-guardrails/) applies. Vendor terms should include the data non-use clause or the agency's approved equivalent.

## Reviewer expectations

The hardest part of AI-assisted development is that AI-written code looks plausible whether or not it is correct. The reviewer's posture has to compensate.

### What reviewers do

1. **Read the code as if a junior wrote it.** Plausibility is not correctness. Don't approve patterns you wouldn't approve from a human contributor just because they came from an AI.
2. **Trace the data flow.** AI-generated code is especially likely to drop error handling, skip edge cases, and silently swallow exceptions. Walk the happy path and one failure path.
3. **Check tests carefully.** AI-generated tests often test "the function returns" rather than "the function does the right thing." Read the assertions; don't just count them.
4. **Look for hallucinated imports / APIs.** Version drift between the model's training data and the current libraries shows up as nonexistent function names or removed parameters. The type checker catches most; some slip through.
5. **Look for license-laundered code.** A long, distinctive code block from an AI may originate from a copyleft repo. The Copilot public-code-match block helps. Reviewers add a sanity check on suspicious blocks.
6. **Check the diff size.** AI-generated PRs trend large because the tool produces a lot of code easily. Apply the [PR size discipline](/phase-4-dev-stack/coding-standards/) at least as strictly as for human-authored work.

### What reviewers do NOT need to do

- **Demand AI-free PRs.** That's a policy nobody can enforce. The discipline is review quality, not authorship purity.
- **Treat AI commits with extra suspicion across the board.** Code from a tool is no less reviewable than code from a person. "This came from Claude" is not a finding by itself.

## AI-generated code: disclosure norms

The agency does not require detailed annotation of which lines an AI suggested. That requirement is unenforceable and provides no actual security benefit. What it does require:

- **Attribution in commits when material.** When the bulk of a PR is AI-generated (an agent run, a refactor done by Claude Code), the commit message says so via a `Co-Authored-By:` trailer or a one-line note. This is professional courtesy and helps with future debugging.
- **Author responsibility.** The committer is responsible. "Claude wrote it" is not a defense for a bug or a vulnerability that ships.
- **No secret-leakage attempts.** Don't paste agency secrets, customer PII, or Tier-3 data into a tool's chat box even when the tool claims privacy. If the tool is on an agency tenant with the data non-use clause, it is in scope; if it is a personal account, it is not.
- **Don't hide AI authorship.** Stripping `Co-Authored-By` trailers to make work look hand-authored is dishonest and rots audit trail.

## Tool-use boundaries

The agency draws three lines.

### What AI tools can do

- Write and modify application code in repos they have access to.
- Run tests, linters, type checkers, formatters.
- Read documentation, source code, logs the developer can already read.
- Author PR descriptions (with human review pass).
- Generate commit messages.
- Author ADR drafts (with human review pass).

### What AI tools may do with explicit, scoped approval

- Make multi-file refactor edits (developer reviews the diff before commit).
- Run agentic loops over a bounded task (developer sets the scope).
- Use MCP tools that mutate external state (Linear ticket creation, Sentry issue closure). Each external write capability is reviewed individually.

### What AI tools should not do

- Commit code without a developer reading the diff.
- Push to remote branches that have any external visibility (e.g., a published PR branch on github.com) without a developer reviewing.
- Deploy to any environment.
- Modify production secrets, IAM, or infrastructure.
- Authorize their own elevation (e.g., bypass the deny-list).
- Use long-lived API keys belonging to a developer's account in CI or any shared pipeline.

Some boundaries are enforceable in tool configuration and CI; others depend on training, review, and audit. Trust at higher boundaries is built one ADR at a time as the agency's confidence grows.

## Pre-commit and pre-push hooks

A small set of hooks prevent the most common AI-assisted-coding mistakes:

```yaml
# .pre-commit-config.yaml (excerpt)
repos:
  - repo: https://github.com/gitleaks/gitleaks
    hooks: [{ id: gitleaks }]
  - repo: https://github.com/pre-commit/pre-commit-hooks
    hooks:
      - id: detect-private-key
      - id: trailing-whitespace
      - id: end-of-file-fixer
  - repo: local
    hooks:
      - id: aup-check
        name: AUP boundary check
        entry: scripts/aup_check.sh
        language: script
```

The `aup-check` script (agency-supplied) flags any commit touching paths in the deny list (`secrets/`, `infra/production/`) and prompts the developer to confirm. Catches the common case of an agentic edit drifting into protected territory.

## Logging and audit

Each tool's audit trail should be reviewed in a way that matches agency size:

- **Minimum:** Quarterly admin review of seats, enabled models, settings, and policy exceptions.
- **Standard:** Export or retain vendor/admin audit events where available.
- **Large/regulated:** Stream supported audit logs to the agency SIEM and monitor policy changes.
- **Local hooks:** For agentic tools, approved hooks can log tool-call metadata with redaction. Do not log secrets or protected content unless the use case has approved capture rules.

These records help answer questions like "who has access to the tool," "which models were enabled," and "were sensitive paths excluded." Product audit logs may not show every prompt, local edit, or client-side context, so do not rely on them as the only control.

## Cost and quota

AI tools are cheap per developer-hour but the costs add up.

- **Per-developer cap.** Most tool tiers come with a generous quota; configure alerts at 70% / 90% of monthly quota.
- **Track aggregate cost** in the same dashboard as platform AI cost. The line "is this tooling worth it" needs evidence.
- **Watch agentic costs.** A long Claude Code session that runs many tool calls costs materially more than inline completion. Budget accordingly.

## Training and Track 4

Track 4 Lab 4 introduces AI-assisted development to the developer cohort. Topics:

- Approved tool patterns and any agency-procured tools.
- Reviewer expectations (this page).
- A worked example: take a small task, do it three ways (no AI, with Copilot inline, with Claude Code agentically). Compare quality and time.
- The boundaries above.

After Lab 4, every developer who is shipping code should understand the approved tool rules and reviewer expectations. Use of an AI tool is encouraged where approved and useful, not required for every developer or task.

## Common AI-assisted-development failures

- **No tenant.** Developers use personal accounts because the agency hasn't procured a tier. Procure early, or restrict use to synthetic/sample code until approval catches up.
- **Permissive defaults.** A tool installed with full file-write and shell access by default leads to a "the AI deleted my branch" incident within months. Default to ask-for-approval; relax explicitly.
- **No reviewer training.** Reviewers approve plausible-looking AI code at a higher rate than they approve human code. Train them.
- **Banning the tools.** Drives usage underground and loses audit and policy. Configure and train instead.
- **One tool, no rationale.** Different developers benefit from different tools, but procurement and security matter. Approve the smallest set of tools the agency can support well.
- **AI-generated code with no tests.** The tool will write code without tests if asked. The agency standard is the same as for human code: tests required. Hold the line.

## Related

- [Coding Standards](/phase-4-dev-stack/coding-standards/): the bar that applies to AI-authored code as much as human-authored
- [Testing Strategy](/phase-4-dev-stack/testing-strategy/): what reviewers check
- [Track 4, Developer Upskilling](/phase-2-education/track-4-developers/): where the cohort learns these tools
- [Acceptable Use Policy](/phase-1-governance/acceptable-use-policy/): the organizational AUP these tool configurations operationalize

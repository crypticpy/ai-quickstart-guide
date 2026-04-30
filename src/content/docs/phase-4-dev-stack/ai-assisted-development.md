---
title: AI-Assisted Development
description: Claude Code, GitHub Copilot, and Cursor configured for government work. Approved configurations, reviewer expectations, and AI-generated code disclosure norms.
sidebar:
  order: 5
---

By 2026, AI-assisted coding is not a choice the agency can avoid. The [2026 JetBrains AI Pulse](https://blog.jetbrains.com/research/2026/04/which-ai-coding-tools-do-developers-actually-use-at-work/) found 90% of professional developers regularly use AI coding tools at work (10,000+ developer sample, January 2026 wave). Agencies that ban these tools simply discover their developers are using personal accounts on personal laptops. The right stance is neither prohibition nor laissez-faire. It is _configured_ adoption: a small set of approved tools, configured for government data handling, with clear reviewer expectations and a non-negotiable rule that the human committing the code is responsible for the code regardless of who or what wrote it.

## The three approved tools

Most agencies should approve and configure these three. A team can use one, two, or all three depending on workflow.

| Tool               | Strength                                                                | Fit                                                                       |
| ------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Claude Code**    | Agentic, multi-file edits, deep codebase understanding, terminal-native | Larger refactors, exploratory work, agentic tasks, long-context reasoning |
| **GitHub Copilot** | Inline completion, IDE-integrated, mature in the IDEs                   | Steady-state coding inside an open file; team familiarity                 |
| **Cursor**         | IDE that is itself AI-augmented; strong agent + completion combo        | Teams that want a single tool for both inline and chat-style assistance   |

Other tools (Cody, Tabnine, Codeium, Aider) are not prohibited but are not on the agency-supported list. Teams using them are on their own for support and integration.

## Configuration baseline (all tools)

Every approved tool is configured to:

1. **Use the agency's tenant.** Tools that support enterprise/government tenants are configured against that tenant, not personal accounts. This puts admin controls and audit logs in the agency's hands.
2. **Disable telemetry on agency code where the tool supports it.** Most tools have an "improve the model with my code" toggle; turn it off.
3. **Use the agency's network.** No tool is allowed to make calls bypassing the agency's egress proxy.
4. **Authenticate via SSO.** Personal Anthropic / OpenAI / GitHub accounts are not authorized for agency code.
5. **Carry a deny-list** for sensitive paths (e.g., `secrets/`, `infra/production/`) where agentic tools should refuse to write without explicit per-action approval.

## Per-tool configuration

### Claude Code

- **Tenant.** Use Claude for Work or the API tier procured by the agency. Personal API keys are not authorized.
- **Settings.** Project-level `.claude/settings.json` checked into each repo with the agency's standard configuration. Permissions tier set to require approval for shell commands and file writes outside the project root by default.
- **Hooks.** Optional but recommended: a `PreToolUse` hook that logs every tool call to the agency's central log; a `PostToolUse` hook that runs the formatter on edited files.
- **Skills.** The agency can publish a shared skill set (e.g., `/freview`, `/scaffold-module`, `/run-evals`) to encode common workflows.
- **MCP servers.** Read-only MCP servers (Sentry, Linear, internal docs) are encouraged. Write-capable MCP servers go through the same governance as any tool that mutates state. They need an authorization scope and an audit log.
- **Code review.** AI-suggested commit messages are fine; AI-authored PR descriptions need a human review pass. Output of `/freview` (Anthropic's own review skill) is advisory, not authoritative.

### GitHub Copilot

- **Tier.** Copilot Business or Copilot Enterprise (the latter for >100 developers). Both exclude agency code from training; document this in the procurement package.
- **Public code matching.** Enable "block suggestions matching public code." This reduces (does not eliminate) the risk of a license-incompatible suggestion.
- **Content exclusions.** Configure path-level exclusions so Copilot does not see `secrets/`, `infra/production/secrets/`, etc.
- **Audit log.** Forward Copilot audit log to the agency's SIEM.
- **Chat mode.** Authorized in IDE; not authorized for non-coding use (the chatbot is not the agency's general-purpose AI).

### Cursor

- **Tenant.** Cursor for Business or Enterprise. Agency-procured workspace; SSO via the agency IdP.
- **Privacy mode.** Enabled by default for all users. This disables retention of agency code on Cursor servers.
- **Indexing.** Cursor's repo indexing is opt-in per repo. Tier-2/3 repos may opt out depending on data classification; coordinate with security.
- **Extensions.** Cursor inherits VS Code extensions; the agency's allowlist (signed publishers, approved categories) applies.

### Foundation model used

All three tools rely on a foundation model. The agency should know which:

- Claude Code uses Anthropic models (Claude 4.x family).
- Copilot defaults to GPT-class models with Claude as an alternative; configure per the agency's preferred model.
- Cursor offers a model picker; the agency's allowed model list is configured at the workspace level.

When a model is procured for tool use, the [procurement addendum](/phase-1-governance/procurement-guardrails/) applies. Vendor terms must include the data non-use clause.

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

### What AI tools must not do

- Commit code without a developer reading the diff.
- Push to remote branches that have any external visibility (e.g., a published PR branch on github.com) without a developer reviewing.
- Deploy to any environment.
- Modify production secrets, IAM, or infrastructure.
- Authorize their own elevation (e.g., bypass the deny-list).
- Use long-lived API keys belonging to a developer's account in CI or any shared pipeline.

The boundary is enforceable in the tool configurations and in CI. Trust at higher boundaries is built one ADR at a time as the agency's confidence grows.

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

Each tool's audit log goes to the agency's central log:

- **Claude Code:** server-side audit log via the API tier; per-session telemetry to the agency's chosen backend.
- **GitHub Copilot:** Copilot audit log forwarded via webhook or pull.
- **Cursor:** Enterprise audit log forwarded similarly.

These logs answer questions like "in the past month, who used AI tools on the eligibility module" and "did any tool see paths outside its scope." Run a quarterly review with security.

## Cost and quota

AI tools are cheap per developer-hour but the costs add up.

- **Per-developer cap.** Most tool tiers come with a generous quota; configure alerts at 70% / 90% of monthly quota.
- **Track aggregate cost** in the same dashboard as platform AI cost. The line "is this tooling worth it" needs evidence.
- **Watch agentic costs.** A long Claude Code session that runs many tool calls costs materially more than inline completion. Budget accordingly.

## Training and Track 4

Track 4 Lab 4 introduces AI-assisted development to the developer cohort. Topics:

- The three approved tools, configured.
- Reviewer expectations (this page).
- A worked example: take a small task, do it three ways (no AI, with Copilot inline, with Claude Code agentically). Compare quality and time.
- The boundaries above.

After Lab 4, every developer who is shipping code is expected to use at least one approved tool for at least some of their work and to understand the reviewer expectations from both sides.

## Common AI-assisted-development failures

- **No tenant.** Developers use personal accounts because the agency hasn't procured a tier. Procure on day one of Phase 4; the per-seat cost is small.
- **Permissive defaults.** A tool installed with full file-write and shell access by default leads to a "the AI deleted my branch" incident within months. Default to ask-for-approval; relax explicitly.
- **No reviewer training.** Reviewers approve plausible-looking AI code at a higher rate than they approve human code. Train them.
- **Banning the tools.** Drives usage underground and loses audit and policy. Configure and train instead.
- **One tool, no choice.** Different developers benefit from different tools. Approve all three; let teams pick.
- **AI-generated code with no tests.** The tool will write code without tests if asked. The agency standard is the same as for human code: tests required. Hold the line.

## Related

- [Coding Standards](/phase-4-dev-stack/coding-standards/): the bar that applies to AI-authored code as much as human-authored
- [Testing Strategy](/phase-4-dev-stack/testing-strategy/): what reviewers check
- [Track 4, Developer Upskilling](/phase-2-education/track-4-developers/): where the cohort learns these tools
- [Acceptable Use Policy](/phase-1-governance/acceptable-use-policy/): the organizational AUP these tool configurations operationalize

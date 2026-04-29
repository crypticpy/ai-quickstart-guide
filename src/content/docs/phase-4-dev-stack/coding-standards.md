---
title: Coding Standards
description: Linting, formatting, naming conventions, commit messages, PR review policy, and dependency hygiene — enforced in CI, not by code review fatigue.
sidebar:
  order: 4
---

The job of coding standards is not to make every file look the same. It is to remove the categories of disagreement that consume PR review time and make code review about the things that actually matter — design, behavior, edge cases — rather than spaces vs. tabs. Every standard on this page is enforced in CI. If a rule cannot be enforced, do not write it as a rule; write it as guidance.

## What is enforced (the bar)

Every repository in the agency platform meets the following bar. Phase 3's CI/CD pipeline enforces it; the agency's reference implementation models it.

| Surface         | Standard                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------ |
| Lint            | Stack-appropriate linter passes with zero warnings (no warnings-as-errors-with-exceptions) |
| Format          | Stack-appropriate formatter has been run; CI blocks unformatted commits                    |
| Type check      | Strict type checking passes (TS strict, mypy strict, .NET nullable enabled, etc.)          |
| Test coverage   | ≥75% line coverage on new code; module owners can raise the bar                            |
| Secret scan     | Pre-commit hook + CI scan; any match blocks merge                                          |
| Dependency scan | License compliance + critical CVE block in CI                                              |
| Commit message  | Conventional Commits format on `main`                                                      |
| PR title        | Same Conventional Commits format                                                           |
| PR size         | Soft cap at ~400 lines changed; large PRs require justification in description             |
| PR description  | Filled-in template — what / why / how to test / risk                                       |
| Branch lifetime | ≤2 days; auto-close branches inactive for 14 days                                          |
| Squash on merge | Required. The merge commit message is the PR title.                                        |

## Per-language tool choices

The point is not which tool but to pick one and run it everywhere.

### Python

- **Lint + format:** `ruff` (replaces flake8, isort, black, pylint). Configured in `pyproject.toml`.
- **Type check:** `mypy` in strict mode, or `pyright`. Both work; pick one.
- **Test runner:** `pytest`. Use `pytest-asyncio` for async tests.
- **Package manager:** `uv` (fast) or `poetry` (more conservative). Either is fine; pick one for the agency.
- **Pre-commit:** `pre-commit` framework with `ruff`, `gitleaks`, `mypy`.

### TypeScript / Node

- **Lint:** `eslint` with the agency's shared config (`@agency/eslint-config`). Strict ruleset.
- **Format:** `prettier`. No exceptions, no negotiation about width.
- **Type check:** `tsc --noEmit` with `strict: true`, `noUncheckedIndexedAccess: true`.
- **Test runner:** `vitest` (faster, leaner) or `jest` (more conservative). Pick one.
- **Package manager:** `pnpm` (workspace-friendly, fast) is the recommended default.

### .NET / C#

- **Lint + format:** Roslyn analyzers + `dotnet format`. `<TreatWarningsAsErrors>true` in shared `Directory.Build.props`.
- **Style:** `.editorconfig` published from the agency's shared config repo.
- **Test runner:** `xUnit` (recommended) or `NUnit`. `FluentAssertions` for readable assertions.
- **Nullability:** `<Nullable>enable</Nullable>` everywhere.

### Java

- **Lint + format:** `checkstyle` + `spotless` (with `google-java-format` or `palantir-java-format`).
- **Static analysis:** `errorprone` + `spotbugs`.
- **Test runner:** JUnit 5 + AssertJ; Testcontainers for integration tests.
- **Build tool:** Gradle (Kotlin DSL) or Maven. Pick one.

### Go

- **Lint:** `golangci-lint` with the agency's shared config (recommended set: `errcheck`, `govet`, `staticcheck`, `unused`, `gosec`, `gocyclo`).
- **Format:** `gofmt` + `goimports`. Non-negotiable.
- **Test runner:** standard `go test`; `testify` for assertions; `gotestsum` for CI output.

## Naming conventions

Naming is where the agency benefits most from boring uniformity. Each language has community defaults; follow them.

- **Variables and functions** in the language's idiomatic case (`snake_case` Python, `camelCase` JS/TS/Java/C# locals, `PascalCase` C# methods, `camelCase` Go).
- **Files** kebab-case in TypeScript; snake_case in Python; PascalCase in C#; lowercase package names in Go and Java.
- **Tests** mirror the source: `foo.py` → `test_foo.py`; `Foo.ts` → `Foo.test.ts`; `FooService.cs` → `FooServiceTests.cs`.
- **No abbreviations** unless they are agency-wide vocabulary (e.g., `aup`, `pii`). `usr`, `mgr`, `cfg` are not okay; `user`, `manager`, `config` are.
- **No Hungarian notation** in any modern stack. The type system or annotations cover this.
- **Modules and packages** named for the domain noun, not the technical layer. `eligibility` not `eligibility_handlers`.

## Commit messages

Conventional Commits, lowercase:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`, `build`, `revert`. Scope is the module or area; subject is imperative ("add", not "added").

Examples:

```
feat(orchestration): add prompt cache to retrieval layer
fix(auth): reject tokens with mismatched audience claim
docs(readme): document local dev quickstart
```

The reason: changelog generation, semantic versioning automation, and PR triage all depend on parseable commit history. The cost is small; the benefit is permanent.

## PR review policy

The standard agency PR review:

- **Two reviewers** for production code; **one** for documentation, infra, and tests-only changes.
- **One reviewer must be from the module's CODEOWNERS** for that path.
- **No author self-merge.** A reviewer merges or the PR sits.
- **Required checks** all green: lint, type, unit, contract, eval (if AI), security scan, license scan.
- **Required PR description fields:** what, why, how to test, risk. Empty descriptions block merge.
- **Stale PRs** (no activity for 7 days) get a nudge bot ping; abandoned (14 days) get auto-closed with a "reopen if still relevant" comment.

What reviewers actually look for, in order:

1. Does this match the design we agreed to (or is there an ADR amending it)?
2. Does this add net complexity or remove it?
3. Are the tests testing behavior, not implementation?
4. Are the failure modes obvious?
5. Are there security implications (auth, input handling, secrets)?
6. Is there any AI-generated code that the reviewer should be skeptical of?

## PR size discipline

Large PRs are reviewed badly. The 400-line soft cap exists because reviewers stop reading carefully past that point. Strategies for staying small:

- Land scaffolding first (empty files, types, no logic). Land logic in follow-ups.
- Land tests-first or tests-with-implementation; do not land logic without tests.
- Use feature flags to land partial work behind a gate that defaults to off.
- Refactor in a separate PR from feature work.

When a large PR is unavoidable (e.g., ADR-driven architectural change), the description must justify why and link to the ADR.

## Dependency hygiene

Every dependency is a long-term commitment. Standards:

- **Pin the lockfile.** `uv.lock`, `poetry.lock`, `pnpm-lock.yaml`, `package-lock.json`, `Gemfile.lock`, `go.sum`. Always committed.
- **Renovate or Dependabot** opens PRs for dep bumps. Patch updates automerge if CI is green; minor and major need human review.
- **License allowlist.** A repo-level config blocks GPL/AGPL where the agency's policy says so; warns on uncommon licenses.
- **CVE blocking** in CI: critical CVEs in production-bound builds block; high-severity warns; low/medium goes to a tracked backlog.
- **Dependency justification** for new direct deps: a new direct dependency is a one-line PR comment ("why this lib, what considered, license check").
- **Periodic prune.** Quarterly, run dependency analysis (e.g., `depcheck`, `python-pyflakes` unused) and remove unused.

## Logging

- **Structured logs only** (JSON) in production. Free-text `print()` and `console.log()` are forbidden in committed code.
- Use the stack's idiomatic structured logger (`structlog` Python; `pino` Node; Serilog .NET; `logback` + `logstash-logback-encoder` Java; `zap` or `slog` Go).
- Every log carries `trace_id` and `span_id` from the active OTel context (the [observability foundation](/phase-3-infrastructure/observability/) injects these automatically).
- **Never log secrets, tokens, or full PII.** Use a redaction filter at the logger or rely on the logger's drop-key configuration.
- **Levels.** `debug` for local; `info` for state changes; `warn` for handled failures; `error` for unhandled. `info` is not "general chatter" — be sparing.

## Error handling

- **Don't swallow exceptions** silently. If you catch, you log AND act.
- **Don't catch broad exceptions** unless you are the top-level boundary handler.
- **Wrap external calls** in retry-with-backoff at one well-known place (e.g., the LLM adapter), not scattered through the codebase.
- **Surface failures to users** with actionable messages, not stack traces. Internal users can see request IDs to share with support.

## Concurrency

- **Use the stack's idiomatic async** (asyncio, async/await, structured concurrency in Java/Kotlin, goroutines+channels). Don't invent your own thread pool.
- **No fire-and-forget** of meaningful work. Either `await` it, or queue it on a durable queue with retries.
- **Cancellation propagation:** in async stacks, when a request is cancelled, downstream calls (LLM, retrieval, DB) are cancelled too. Test this.

## Internationalization and accessibility

For frontend code:

- **All user-visible strings** go through the i18n layer; no hard-coded English in components.
- **Semantic HTML.** Buttons are buttons, links are links. ARIA only where semantics fall short.
- **Color contrast** WCAG AA minimum; AAA for primary text.
- **Keyboard reachability** for every interactive element. Tab order makes sense.
- **CI accessibility check** with `axe-core` or `pa11y`. Block merge on regressions.

## Comments and documentation

- **Default to no comments.** Names and types should carry the meaning.
- Add a comment when _why_ is not obvious from code: a hidden constraint, a workaround for a specific bug or upstream behavior, an invariant the type system can't express.
- **No commit-context comments.** "Added for ticket SUP-3413" rots; the commit history is the source of truth.
- **Public API surfaces** get docstrings (Python) or JSDoc/TSDoc (TS) or XML doc comments (.NET) — used for generated documentation.
- **README per repo** with: what, run locally, run tests, deploy, where to look for help. Five sections, half a page.

## What is NOT in standards

- **Code style debates that the formatter handles** (line width, brace placement, single vs. double quotes). Run the formatter; move on.
- **Personal preferences** about specific patterns the language idiomatically supports both ways. Don't legislate idiom.
- **One-off project rules.** If a rule applies only to one repository, it lives in that repo's CONTRIBUTING.md, not the agency-wide standard.

## Adopting standards in existing repos

Agencies always have legacy repos. Don't blanket-apply new standards retroactively — the noise drowns out signal. Strategy:

- Apply standards to all _new_ repos and all _new code_ in existing repos (CI gates run on changed lines, not the whole file).
- Schedule a once-per-quarter "format the world" PR per repo: run the formatter, type checker baseline, etc., over the whole codebase.
- Backfill tests when touching code, not as a separate effort.
- Don't rewrite working code for standards compliance unless there's a parallel reason to touch it.

## Common standards failures

- **Standards documents nobody can find.** Live in a single agency repo (`agency/dev-standards`) referenced from every other repo's README. Versioned. PRs are the change mechanism.
- **Standards as PDF.** Reviewers won't open them. Standards are markdown in a repo, in the IDE.
- **Strict rules with twenty exceptions.** Means the rule is wrong. Drop it or revise.
- **Linter configured but not in CI.** Becomes "remember to run the linter," which becomes "no linting."
- **Format-only.** Linting and formatting catch obvious things; type checking and tests catch real things. All four matter.

## Related

- [CI/CD Pipeline](/phase-3-infrastructure/cicd-pipeline/) — where these standards are enforced
- [Reference Implementation](/phase-4-dev-stack/reference-implementation/) — the worked example
- [AI-Assisted Development](/phase-4-dev-stack/ai-assisted-development/) — special considerations for AI-generated code
- [Testing Strategy](/phase-4-dev-stack/testing-strategy/) — the testing standard this references

# Deck Source: Environment Setup Basics

## How to use this file

Paste or upload this Markdown into an AI presentation tool such as Gamma, Beautiful.ai, ChatGPT, Claude, PowerPoint Copilot, or another deck-generation workflow. Ask it to create a first-draft presentation from the slide-by-slide source below.

Before presenting, replace placeholders, verify local policy and legal references, apply agency branding, and review for accessibility.

## Deck instructions

- Audience: sponsors, managers, IT leads, security reviewers, vendors, and project owners
- Session length: 60 minutes
- Desired deck length: 12 slides
- Tone: practical, calm, plain-language, public-sector appropriate
- Reading level: accessible to non-specialists
- Format: 16:9 presentation
- Use speaker notes: yes
- Use AI-generated images: optional; prefer simple diagrams and neutral workplace scenes
- Do not invent laws, statistics, dates, agency facts, vendor claims, or cloud capabilities
- Keep each slide readable: 3-5 bullets maximum unless the slide is an exercise

## Localization checklist

- Replace `[Agency]`, `[program lead]`, `[first use case]`, and other placeholders.
- Confirm the current cloud, SaaS, identity, security, records, procurement, and accessibility context.
- Confirm whether sandbox, development, staging, and production are separate today.
- Add agency branding only after content and evidence review.

## Import prompt

Create a first-draft environment setup basics deck from this Markdown source. Follow slide breaks exactly. Use speaker notes as presenter notes. Do not invent laws, statistics, vendor claims, agency facts, or cloud capabilities. Preserve placeholders in square brackets unless I provide local details.

---

# Slide 1: Environment Setup Basics

Main point: [Agency] needs separated places to learn, build, test, and operate AI safely.

Bullets:

- Program: [AI Quickstart]
- Use case focus: [first use case]
- Owner: [program lead]
- Date: [date]

Speaker notes:

Open by saying this is a practical operating model, not a complex enterprise architecture lecture. The goal is to make sure real data and real users do not become part of experiments by accident.

Image guidance:

Simple path diagram with four labeled spaces: Sandbox, Development, Staging/Test, Production.

Evidence and review notes:

Verify program name, use case, owner, and date.

---

# Slide 2: Why Separation Matters

Main point: Environment separation prevents experiments from turning into unmanaged production.

Bullets:

- Safer learning
- Cleaner testing
- Stronger evidence
- Easier rollback
- Better accountability

Speaker notes:

Explain that the same idea applies whether the agency uses cloud accounts, resource groups, projects, workspaces, or a managed SaaS tenant. The durable rule is to know where work belongs and what it can touch.

Image guidance:

Neutral split-screen visual: left side messy shared space, right side organized labeled spaces. Avoid fear-based imagery.

Evidence and review notes:

No external claims.

---

# Slide 3: The Four Spaces

Main point: Each environment has a different job.

Bullets:

- Sandbox: learn and prototype
- Development: build and integrate
- Staging/Test: validate before launch
- Production: serve real users

Speaker notes:

Use plain language. Sandbox is where ideas start. Development is where builders make the idea real. Staging is where the agency asks whether it is ready. Production is where the service must be operated.

Image guidance:

Four-column diagram with one short purpose statement under each environment.

Evidence and review notes:

No external claims.

---

# Slide 4: The Data Rule

Main point: Sandbox can be flexible on tools only because it is strict on data.

Bullets:

- Synthetic data in sandbox
- Sanitized data in staging
- Approved data in production
- Secrets separated by environment
- Logs treated as sensitive

Speaker notes:

Emphasize that many early AI mistakes happen when real data creeps into a prototype. Prompts, responses, logs, and screenshots can all become sensitive records.

Image guidance:

Simple data ladder showing synthetic, sanitized, approved real data.

Evidence and review notes:

Verify local data classification language before presenting.

---

# Slide 5: Small Agency Path

Main point: Small agencies can start with a controlled minimum and still be responsible.

Bullets:

- Approved tool or tenant
- One named admin
- MFA or SSO where available
- No sensitive real data
- Budget and logs visible

Speaker notes:

This path is for getting started without pretending every agency has a platform team. Production still needs a separate, reviewed setup before real users rely on the service.

Image guidance:

Plain checklist with five items. Avoid implying this is production-ready for all use cases.

Evidence and review notes:

Verify local tool approval and identity capabilities.

---

# Slide 6: Standard Agency Path

Main point: Medium organizations should make separation repeatable.

Bullets:

- Separate non-prod and prod
- CI/CD promotion gates
- Environment-specific secrets
- Central logs and cost views
- Repeatable provisioning

Speaker notes:

The standard path is about consistency. The team should be able to create a new environment from a known pattern instead of guessing each time.

Image guidance:

Moderate-detail architecture diagram with separate non-prod and prod boxes connected by a gated pipeline.

Evidence and review notes:

Verify current cloud and CI/CD tooling.

---

# Slide 7: Larger Agency Path

Main point: Larger and regulated organizations need stronger boundaries and central oversight.

Bullets:

- Separate accounts or subscriptions
- Central security logging
- Policy-as-code
- Private networking where needed
- Formal access review

Speaker notes:

Keep this high-level. The audience does not need a full enterprise landing-zone design in this session. They need to know what stronger separation looks like and what to ask internal platform or vendor teams to provide.

Image guidance:

Layered diagram: organization boundary, environment boundaries, shared security/logging layer.

Evidence and review notes:

Verify local enterprise architecture terms before presenting.

---

# Slide 8: Promotion Path

Main point: Work moves forward by evidence, not by informal approval.

Bullets:

- Sandbox to development
- Development to staging
- Staging to production
- Production to routine review

Speaker notes:

Explain that apps, prompts, models, retrieval indexes, and infrastructure all need promotion discipline. The gate can be lightweight for Tier-1 work and stronger for higher-risk use cases.

Image guidance:

Horizontal flow with gates between each environment.

Evidence and review notes:

No external claims.

---

# Slide 9: Production Gates

Main point: Production launch needs enough evidence to make a defensible decision.

Bullets:

- Tests and evals pass
- Security scan reviewed
- Privacy/data rules satisfied
- Monitoring and feedback live
- Rollback path ready

Speaker notes:

Make clear that the agency can scale the gate by risk tier. The key is to decide the required evidence before launch pressure arrives.

Image guidance:

Go/no-go checklist with green, yellow, and red status markers.

Evidence and review notes:

Verify local readiness criteria and approval roles.

---

# Slide 10: Operations After Launch

Main point: Production AI needs routine maintenance after the launch demo.

Bullets:

- Weekly feedback review
- Monthly CVE review
- Monthly prompt/model review
- Quarterly drift review
- Incident retrospectives

Speaker notes:

AI systems can change because code changes, model behavior changes, retrieval sources change, or user behavior changes. The maintenance calendar is how the agency keeps trust from decaying.

Image guidance:

Simple calendar visual with weekly, monthly, quarterly, and incident-triggered rows.

Evidence and review notes:

Verify local vulnerability management and incident processes.

---

# Slide 11: Vendor Questions

Main point: Agencies do not need to build everything themselves, but they should know what to ask.

Bullets:

- How are environments separated?
- What data is allowed where?
- How are CVEs handled?
- What telemetry do we get?
- How do we pause or roll back?

Speaker notes:

This slide is especially important for smaller organizations. The questions help them buy or partner responsibly without pretending to have deep platform staff.

Image guidance:

Vendor conversation card with five question prompts.

Evidence and review notes:

No external claims.

---

# Slide 12: Local Next Steps

Main point: The next action is to document the target model and assign owners.

Bullets:

- Fill environment map
- Choose promotion gates
- Assign maintenance owners
- List vendor or IT asks
- Set review date

Speaker notes:

Close with decisions, not vague agreement. Capture the environment map and unresolved questions before the meeting ends.

Image guidance:

Action list with owner and due-date placeholders.

Evidence and review notes:

Replace with local owners and due dates.

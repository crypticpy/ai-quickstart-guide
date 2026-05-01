# Deck Source: Environment Design Workshop

## How to use this file

Paste or upload this Markdown into an AI presentation tool such as Gamma, Beautiful.ai, ChatGPT, Claude, PowerPoint Copilot, or another deck-generation workflow. Ask it to create a first-draft workshop deck from the slide-by-slide source below.

Before presenting, replace placeholders, verify local policy and technical details, apply agency branding, and review for accessibility.

## Deck instructions

- Audience: AI program lead, IT/cloud lead, security, privacy, product owner, vendor or implementation partner
- Session length: 90 minutes
- Desired deck length: 11 slides
- Tone: practical, collaborative, decision-oriented
- Reading level: accessible to mixed technical and non-technical participants
- Format: 16:9 presentation
- Use speaker notes: yes
- Use AI-generated images: optional; prefer simple diagrams and worksheet-style slides
- Do not invent laws, statistics, dates, agency facts, vendor claims, or architecture details
- Keep each slide readable: 3-5 bullets maximum unless the slide is an exercise

## Localization checklist

- Replace `[Agency]`, `[first use case]`, `[cloud/SaaS platform]`, and owner placeholders.
- Confirm current environment names, current data rules, and existing security tools.
- Confirm whether a vendor, central IT team, or internal delivery team owns implementation.
- Add agency branding only after content and evidence review.

## Import prompt

Create a first-draft environment design workshop deck from this Markdown source. Follow slide breaks exactly. Use speaker notes as presenter notes. Do not invent laws, statistics, vendor claims, agency facts, architecture details, or approval status. Preserve placeholders in square brackets unless I provide local details.

---

# Slide 1: Environment Design Workshop

Main point: This workshop chooses the first practical environment model for [first use case].

Bullets:

- Agency: [Agency]
- Use case: [first use case]
- Platform: [cloud/SaaS platform]
- Decision owner: [owner]

Speaker notes:

Frame this as a working session. The output is a documented target model, not a perfect architecture.

Image guidance:

Workshop title slide with a simple architecture sketch, no fictional seals or badges.

Evidence and review notes:

Verify local names and platform.

---

# Slide 2: Decisions We Need Today

Main point: The session should leave with specific decisions and open asks.

Bullets:

- Environment boundaries
- Data allowed per environment
- Promotion gates
- Maintenance owners
- Vendor or IT asks

Speaker notes:

Explain that unanswered questions are acceptable if they are assigned. Ambiguity without an owner is the problem.

Image guidance:

Decision checklist.

Evidence and review notes:

No external claims.

---

# Slide 3: Current-State Map

Main point: Start with what exists today before designing the target model.

Bullets:

- Current cloud or SaaS tenant
- Current identity path
- Current logs and alerts
- Current security scans
- Current support owner

Speaker notes:

Ask participants to name the current system of record for each item. If no one knows, mark it as an open ask.

Image guidance:

Blank current-state worksheet with five labeled boxes.

Evidence and review notes:

Replace with local facts during the workshop.

---

# Slide 4: Target Environment Boundaries

Main point: Choose the smallest separation that protects production and real data.

Bullets:

- Sandbox: [boundary]
- Development: [boundary]
- Staging/Test: [boundary]
- Production: [boundary]

Speaker notes:

Boundary can mean account, subscription, project, resource group, workspace, tenant, or namespace. The exact technical answer depends on the platform.

Image guidance:

Four-box target-state diagram with placeholders.

Evidence and review notes:

Verify against cloud, SaaS, or vendor architecture.

---

# Slide 5: Data Rules

Main point: Each environment needs a clear data rule.

Bullets:

- Sandbox: [data rule]
- Development: [data rule]
- Staging/Test: [data rule]
- Production: [data rule]

Speaker notes:

Prompt the room to be explicit about PII, protected records, regulated data, prompt logs, response logs, screenshots, and exports.

Image guidance:

Data-rule table with one row per environment.

Evidence and review notes:

Verify local privacy, records, and data classification terms.

---

# Slide 6: Access And Secrets

Main point: Access and secrets should be separated before real data enters the system.

Bullets:

- Human access by role
- Workload identity
- Environment-specific secrets
- Break-glass process
- Access review cadence

Speaker notes:

Ask who can deploy, who can view logs, who can change secrets, and who can approve emergency access. Do not let production rely on shared accounts.

Image guidance:

Role-access matrix with placeholder roles.

Evidence and review notes:

Verify current identity and secrets tooling.

---

# Slide 7: Promotion Gates

Main point: The production path should require visible evidence.

Bullets:

- Functional tests
- AI evals
- CVE/security scan
- Privacy/data review
- Monitoring and rollback

Speaker notes:

Decide which gates are required for the first launch and which are deferred. Deferred gates need owners and dates.

Image guidance:

Pipeline with five gates before production.

Evidence and review notes:

Verify local security and production-readiness standards.

---

# Slide 8: Monitoring And Feedback

Main point: The team needs visibility into quality, safety, cost, and user experience.

Bullets:

- Logs, metrics, traces
- Eval score and drift
- Cost by use case
- User feedback
- Safety and DLP events

Speaker notes:

Ask where each signal will be visible and who reviews it. A dashboard nobody checks does not operate the service.

Image guidance:

Simple dashboard mockup with five panels and placeholder values.

Evidence and review notes:

Do not invent metrics; use placeholders.

---

# Slide 9: Maintenance Calendar

Main point: Production support includes recurring work after launch.

Bullets:

- Weekly feedback and cost review
- Monthly CVE and dependency review
- Monthly prompt/model review
- Quarterly drift and access review
- Incident-triggered retrospective

Speaker notes:

Assign owners while the right people are in the room. If a task has no owner, it is a launch risk.

Image guidance:

Calendar grid with weekly, monthly, quarterly, and incident-triggered rows.

Evidence and review notes:

Verify local vulnerability and incident review cadence.

---

# Slide 10: Open Asks

Main point: Open questions should become assigned asks, not unresolved risk.

Bullets:

- Vendor ask: [item]
- IT ask: [item]
- Security ask: [item]
- Sponsor ask: [item]

Speaker notes:

Capture the minimum required answer, owner, and due date for each ask. Keep the list short enough to act on.

Image guidance:

Action table with owner and due-date columns.

Evidence and review notes:

Replace with actual asks before finalizing the deck.

---

# Slide 11: Decision Record

Main point: The workshop closes by recording the target model and next review date.

Bullets:

- Path chosen: [sandbox-only/standard/production-ready]
- Environments approved: [list]
- Gates approved: [list]
- Next review: [date]

Speaker notes:

End with a visible decision. If the group cannot approve the model yet, record the blocker and the next decision meeting.

Image guidance:

Decision summary card.

Evidence and review notes:

Verify decision authority and records location.

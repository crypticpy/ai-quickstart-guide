---
title: Glossary
description: Plain-language definitions of AI and modern-development terms used throughout the guide.
sidebar:
  order: 4
---

This glossary favors plain language over vendor jargon. The definitions are intentionally short so program leads, department managers, legal reviewers, procurement staff, and technologists can use the same words during AI adoption work.

## 0-9

**90-day quickstart.** The first operating cycle in this guide: set policy, launch intake, start training, plan infrastructure, and choose starter candidates before attempting a major deployment.

## A

**Acceptable Use Policy (AUP).** The agency rulebook for how staff may and may not use AI tools, including approved tools, data limits, human review, and reporting expectations.

**Accessibility.** Designing services so people with disabilities can use them; AI tools still need accessible interfaces, outputs, and review processes.

**Accountability.** Clear ownership for an AI system's decisions, errors, approvals, monitoring, and public communication.

**ADR (Architecture Decision Record).** A short record of an important technical decision, the options considered, and why the agency chose one path.

**Agent.** An AI-powered workflow that can take multiple steps, use tools, or call systems; agents need tighter controls than one-off chat prompts.

**AI-assisted development.** Using AI tools to help write, review, test, or explain code while keeping humans responsible for quality, security, and licensing.

**AI governance.** The policies, roles, review steps, controls, and monitoring that make AI use responsible and auditable.

**AI literacy.** Basic staff understanding of what AI can do, where it fails, what data may be used, and when human judgment is required.

**AI Review Committee.** The cross-functional group that reviews AI use cases, assigns or confirms risk tiers, sets conditions, and records decisions.

**API.** A defined way for software systems to communicate; AI applications often use APIs to call models, databases, identity systems, and business systems.

**API-first design.** Designing the API contract before building the application so systems can integrate cleanly and be tested consistently.

**Architecture Decision Record (ADR).** See ADR.

**Audit log.** A record of who did what, when, from where, and against which system or data; audit logs are essential for incident review and public accountability.

**Automation.** Software performing a task with little or no human intervention; AI automation should be limited when decisions affect rights, benefits, safety, or access.

## B

**Bias.** A pattern where a system produces unfair, inaccurate, or uneven outcomes for different groups, often because of data, design, or deployment choices.

**Business owner.** The department leader responsible for the workflow an AI tool supports, including outcomes, staffing impact, and user adoption.

## C

**Champion.** A trained staff member who helps peers use approved AI tools, surfaces workflow ideas, and provides feedback to the program team.

**Change management.** The people-side work of adoption: communication, training, manager support, feedback, and handling fear or resistance.

**Cloud sandbox.** A controlled environment where teams can prototype safely without touching production systems or sensitive data too early.

**CJI (Criminal Justice Information).** Sensitive justice-related information governed by strict access, handling, and audit requirements.

**CI/CD.** Continuous integration and continuous delivery; automated checks and deployment steps that make software changes safer and repeatable.

**Container.** A packaged application and its dependencies that can run consistently across environments.

**Content filter.** A control that blocks or flags unsafe, disallowed, sensitive, or policy-violating AI inputs or outputs.

**Contract testing.** Tests that verify systems still follow their agreed API contracts, reducing integration failures between teams.

## D

**Data classification.** Labeling data by sensitivity, such as public, internal, confidential, or restricted, so the right controls apply.

**Data minimization.** Using only the data needed for a task and avoiding unnecessary collection, sharing, or retention.

**Data non-use clause.** Contract language saying the vendor may not use agency data to train or improve its models except as explicitly allowed.

**Decision support.** AI that helps a human make a decision but does not make the final decision itself.

**DLP (Data Loss Prevention).** Tools and rules that detect or block sensitive data from leaving approved systems or being entered into unapproved tools.

**Drift.** A change in system behavior over time, either because data changes, models change, prompts change, or the operating environment changes.

## E

**Egress control.** Rules that limit where systems can send data on the internet or private networks.

**Evaluation.** A structured way to test AI quality, safety, accuracy, usefulness, and failure modes before and after deployment.

**Explainability.** The ability to give a meaningful account of why a system produced an output or recommendation.

## F

**Fallback.** The manual or non-AI process used when an AI tool is unavailable, unsafe, or producing poor results.

**FERPA.** The federal law protecting education records; relevant when AI tools touch student information.

**Foundation model.** A large general-purpose AI model that can be adapted to many tasks, such as drafting, summarizing, coding, or question answering.

**FTI (Federal Tax Information).** Tax information protected by strict federal handling requirements.

## G

**Generative AI.** AI that creates text, images, code, audio, summaries, or other new content based on a user's request and context.

**Grounding.** Providing an AI system with trusted source material so its answer is based on agency-approved context rather than guesswork.

## H

**Hallucination.** An AI output that sounds confident but is wrong, unsupported, fabricated, or not grounded in the provided sources.

**HITL (Human in the Loop).** A process where a human reviews, approves, corrects, or overrides AI output before it affects people or operations.

**Hexagonal architecture.** A software design pattern that keeps core business logic separate from databases, user interfaces, vendors, and AI providers.

**HIPAA.** The federal law protecting health information; relevant when AI tools process health or benefits-related data.

## I

**IaC (Infrastructure as Code).** Managing cloud and infrastructure settings through version-controlled code instead of manual console changes.

**Identity and access management (IAM).** The systems and rules that control who can log in, what they can access, and what actions they can take.

**Impact assessment.** A structured review of likely effects on residents, staff, privacy, equity, security, rights, and operations before deployment.

**Incident response.** The prepared process for detecting, containing, fixing, and communicating about security, privacy, or operational failures.

**Internal Developer Platform (IDP).** A self-service platform that lets developers create environments, deploy apps, and use approved services without repeated tickets.

**Inner source.** Using open-source practices inside the agency, such as shared repositories, contribution guides, reviews, and reusable modules.

**Intake.** The process for collecting, classifying, reviewing, and tracking proposed AI use cases.

## L

**Landing zone.** A preconfigured cloud foundation with identity, networking, logging, policy, budgets, and security controls built in.

**Large Language Model (LLM).** An AI model trained to understand and generate language, often used for drafting, summarizing, coding, and question answering.

**Least privilege.** Giving users and systems only the access they need to do their job, and no more.

**Lifecycle.** The full path of an AI system from idea, review, procurement, build, test, deployment, monitoring, change, and retirement.

## M

**Machine learning.** Software that learns patterns from data rather than following only hand-written rules.

**Model card.** A short document describing a model's purpose, training context, known limits, evaluation results, and appropriate uses.

**Model substitution.** A vendor or team replacing the underlying model; this can change system behavior and should trigger review or re-evaluation.

**Monitoring.** Ongoing checks of system performance, cost, errors, safety, usage, and outcomes after launch.

**MVP (Minimum Viable Product).** The smallest useful version of a system that can be tested with real users and improved.

## O

**Observability.** Logs, metrics, traces, and dashboards that help teams understand what a system is doing and diagnose problems.

**OpenAPI.** A standard format for describing APIs so humans and tools can understand, test, and generate integrations from them.

**Orchestration.** Coordinating model calls, tools, prompts, retrieval, business rules, and human review into one workflow.

## P

**PII (Personally Identifiable Information).** Information that identifies or can be linked to a person, such as name, address, Social Security number, case ID, or email.

**Pilot.** A limited trial used to learn whether a tool works in context; pilots still need governance, controls, and success criteria.

**Policy-as-code.** Enforcing rules through automated technical controls, such as blocking untagged cloud resources or unsigned deployments.

**Privacy impact assessment.** A review of how a system collects, uses, shares, retains, and protects personal information.

**Procurement guardrails.** Required contract terms and review checks for AI vendors, including data use, security, audit, accessibility, and model-change notice.

**Prompt.** The instruction or question given to an AI model.

**Prompt injection.** A technique where malicious or untrusted text tries to override the AI system's instructions or make it reveal data.

**Prototype.** An early working version used to test feasibility; it should not be treated as production simply because people like it.

## R

**RAG (Retrieval-Augmented Generation).** An AI pattern that retrieves relevant documents and gives them to the model before it answers.

**RBAC (Role-Based Access Control).** Access based on a person's role, such as case worker, supervisor, analyst, administrator, or auditor.

**Records retention.** Rules for how long records must be kept, where they are stored, and when they can be deleted.

**Red teaming.** Structured attempts to make a system fail, produce unsafe outputs, leak data, or bypass controls before real users rely on it.

**Reference implementation.** A working example that shows the recommended architecture and patterns in practice.

**Responsible AI.** Building and using AI in ways that are lawful, fair, secure, transparent, accountable, and useful.

**Risk tier.** A category that determines how much review and control an AI use case needs before it can proceed.

**ROI (Return on Investment).** The expected value from a project compared with its cost, including staff time, licensing, operations, and risk reduction.

## S

**Sandbox.** A controlled place to test ideas without affecting production systems or exposing sensitive data unnecessarily.

**SBOM (Software Bill of Materials).** A list of software components and dependencies used in an application.

**Secrets management.** Secure storage and rotation of passwords, API keys, certificates, and tokens.

**Shadow AI.** Staff use of unapproved AI tools or workflows, often because approved options are missing, unclear, or too slow.

**SLA (Service Level Agreement).** A formal commitment about service availability or response times.

**SLO (Service Level Objective).** An internal reliability target, such as uptime, latency, or support response time.

**SLSA (Supply-chain Levels for Software Artifacts).** A framework for protecting software build and release processes from tampering.

**Starter project.** The first production AI application chosen for manageable risk, clear user value, and strong learning potential.

**Synthetic data.** Artificially created data used for testing or training when real sensitive data is not appropriate.

## T

**Tier 1 use case.** A lower-risk AI use, usually internal, advisory, and not involving sensitive decisions or restricted data.

**Tier 2 use case.** A moderate-risk AI use that may involve internal sensitive data, operational reliance, or broader staff adoption.

**Tier 3 use case.** A high-risk AI use that may affect rights, benefits, safety, eligibility, enforcement, public access, or vulnerable populations.

**Traceability.** The ability to connect a decision, output, model version, prompt, data source, reviewer, and approval record.

**Training data.** Data used to teach or tune a model; agencies should know whether their data can be used this way by vendors.

## U

**Use case.** A specific workflow or problem where AI might help, described with users, data, risks, value, and success measures.

**User acceptance testing (UAT).** Testing with real users to confirm the tool works for the job they actually do.

## V

**Vector database.** A database that stores mathematical representations of text or other content so similar items can be found quickly.

**Vendor lock-in.** Becoming dependent on one vendor's tools, contracts, or data formats in a way that makes switching costly or impractical.

**Versioning.** Tracking changes to models, prompts, APIs, datasets, policies, and code so teams know exactly what changed and when.

## W

**Workflow automation.** Software that moves a process across steps, systems, or approvals; AI may assist with classification, drafting, routing, or summarization.

**Working group.** A small team that does the weekly drafting, coordination, and issue clearing needed to move the AI program forward.

**Wraparound control.** A policy, process, or technical safeguard placed around an AI tool, such as human review, logging, access limits, and output disclaimers.

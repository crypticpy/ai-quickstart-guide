---
title: Budget Methodology
description: How to estimate Year 1 cost for an agency AI program with sourced inputs and a downloadable spreadsheet.
sidebar:
  order: 4
---

## What this page replaces

The [Pick Your Path](/getting-started/pick-your-path/) comparison table shows Year 1 ranges of $50K to $150K for Small, $150K to $400K for Standard, and $400K to $1M+ for Large. Those numbers are planning anchors, not promises. This page shows how they were built so a finance team can rebuild them with their own pay bands, locality, procurement vehicle, and accounting treatment for existing staff time.

> **Last reviewed: April 30, 2026.** Rebuild salary, cloud, model, and licensing assumptions against current pay tables, contracts, and provider pricing before using these ranges in a budget request.

Read this when you need to defend the totals in a budget memo, when your CFO wants to see the inputs, or when you want to swap a default for a number you trust more.

## The four cost categories

1. **People.** The largest cost in every variant.
2. **Cloud and AI services.** Inference, storage, retrieval infrastructure.
3. **Tooling and licenses.** Per-developer and per-org software.
4. **External services.** Legal counsel, training facilitation, audits, and penetration tests.

Every dollar figure on this page is either sourced or explicitly labeled as an estimate. Every default is overridable in the [downloadable worksheet](#download-the-worksheet).

## 1. People cost

People cost dominates every other line. The math is straightforward.

### How to compute

1. Start with a **base salary**. Use the BLS median for the role, or use your locality's actual pay band if you have one.
2. Multiply by the **public-sector loaded-cost factor**. A reasonable anchor is roughly 1.61x base salary for state and local government workers, which captures benefits, retirement contributions, and payroll tax. Source: [BLS Employer Costs for Employee Compensation](https://www.bls.gov/news.release/ecec.toc.htm).
3. Multiply by **FTE allocation**. A developer who spends 50% of their time on the AI program is 0.5 FTE.

The product is the annual loaded cost for that role at that allocation.

### Sourced inputs

| Role                                              | BLS / OPM source                                                                                                       | Median base               | Loaded cost (~1.61x)                         |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------- |
| Software Developer                                | [BLS 15-1252, Software Developers](https://www.bls.gov/oes/current/oes151252.htm)                                      | $133,080                  | ~$214,259                                    |
| Computer and Information Systems Manager          | [BLS 11-3021](https://www.bls.gov/oes/current/oes113021.htm)                                                           | $171,200                  | ~$275,632                                    |
| Information Security Analyst                      | [BLS 15-1212](https://www.bls.gov/oes/current/oes151212.htm)                                                           | $124,910                  | ~$201,105                                    |
| GS-12 step 1 (mid-level dev, Rest of US locality) | [OPM 2025 General Schedule](https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/2025/general-schedule/) | ~$74,441 base + locality  | ~$120K to $150K loaded depending on locality |
| GS-13 step 1 (typical senior dev)                 | [OPM 2025 General Schedule](https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/2025/general-schedule/) | ~$88,520 base + locality  | ~$143K to $180K loaded                       |
| GS-14 step 1 (lead or manager)                    | [OPM 2025 General Schedule](https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/2025/general-schedule/) | ~$104,604 base + locality | ~$170K to $215K loaded                       |

Locality pay changes by year and location. Check the OPM table for your specific locality before pinning a number.

### Worked example

A Standard agency staffs the AI program with 1.0 FTE dedicated developer, 0.5 FTE program manager, and 0.25 FTE security review.

- 1.0 FTE Software Developer: $133,080 x 1.61 x 1.0 = **$214,259**
- 0.5 FTE Computer and Information Systems Manager: $171,200 x 1.61 x 0.5 = **$137,816**
- 0.25 FTE Information Security Analyst: $124,910 x 1.61 x 0.25 = **$50,276**
- **People total: ~$402,000 per year**

That figure alone tops the Standard range. In practice agencies blend GS pay bands and BLS medians, the manager allocation is often 0.25 FTE rather than 0.5, and the security analyst is often 0.1 FTE. Adjust the inputs in the worksheet to match your actual staffing plan.

For Small agencies, the realistic line is 0.5 FTE total, often a single developer splitting time with other duties. For Large agencies, four FTEs across developer, manager, security, and product is closer to reality.

## 2. Cloud and AI services

This category is variable, not fixed. Match it to expected workload.

### Variable inputs

- **Inference (model API calls).** Tokens per month multiplied by per-token rate. Rates change frequently. Do not pin a per-token number in your budget memo. Pull current pricing from the source the day you build the budget. Two sample workloads:
  - **Light:** 5 million tokens per month. Typical for a single internal assistant used by 10 to 30 staff.
  - **Heavy:** 100 million tokens per month. Typical for a production-facing tool used by hundreds of constituents.
- **Storage and compute.** $200 to $2,000 per month depending on data size, retention policy, and whether you run any agency-side hosting. This is an estimate from agency interviews; confirm against the calculators below.
- **Vector database or retrieval infrastructure.** Roughly $100 to $500 per month for managed options (Pinecone, pgvector on managed Postgres). Higher if you self-host on dedicated compute.

Live pricing pages:

- [Anthropic API pricing](https://www.anthropic.com/pricing)
- [Amazon Bedrock pricing](https://aws.amazon.com/bedrock/pricing/)
- [Azure OpenAI pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/)
- [Google Vertex AI pricing](https://cloud.google.com/vertex-ai/pricing)

For storage and compute estimates, use the [AWS Pricing Calculator](https://calculator.aws/) or the [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/).

### Worked example

Light workload, light storage, managed retrieval:

- Inference (5M tokens/mo, mid-tier model): roughly $50 to $300/mo depending on the provider and model. Pull the current per-million-token rate from the pricing page above.
- Storage and compute: $300/mo.
- Managed vector DB: $200/mo.
- **Monthly: ~$550 to $800. Annual: ~$6,600 to $10,000.**

That figure sits inside the Small variant's $5K to $15K cloud line. Heavy workloads can push the Standard variant past $50K and the Large variant past $200K.

## 3. Tooling and licenses

These costs scale with team size.

### Per-developer tools

- **GitHub Copilot Business.** See [GitHub Copilot pricing](https://github.com/features/copilot#pricing) for the current per-user-per-month rate. Multiply by FTE count.
- **IDE licenses.** Most teams use VS Code (free). JetBrains All Products Pack runs roughly $25/mo per developer; see [JetBrains pricing](https://www.jetbrains.com/store/).
- **Observability and monitoring.** Varies by ingest volume. See [Datadog pricing](https://www.datadoghq.com/pricing/) and [Honeycomb pricing](https://www.honeycomb.io/pricing).
- **CI/CD.** Most CI minutes are included in the source-control plan. Call out an exception only if you run self-hosted runners or hit the included-minutes ceiling.

### Per-org tools

- **Single sign-on.** Okta and Microsoft Entra ID both publish per-user-per-month rates. See [Okta pricing](https://www.okta.com/pricing/) and [Microsoft Entra pricing](https://www.microsoft.com/en-us/security/business/microsoft-entra-pricing).
- **Secrets manager.** AWS Secrets Manager, Azure Key Vault, and HashiCorp Vault all bill per secret or per operation. Most agencies land between $50 and $500 per month.
- **Source control.** GitHub Enterprise or GitLab Premium. See [GitHub pricing](https://github.com/pricing) and [GitLab pricing](https://about.gitlab.com/pricing/).

For a Standard agency with 5 to 15 IT staff and 2 to 4 people on the AI program, this category typically lands at $10K to $25K per year.

## 4. External services

These are one-time or annual costs that do not flow through normal payroll.

- **Legal counsel for the governance sprint.** $3K to $8K for a Small agency 2-day sprint, $25K or more for a Standard agency multi-week engagement. Anchor: typical hourly rates for lawyers from [BLS 23-1011, Lawyers](https://www.bls.gov/oes/current/oes231011.htm), median around $148,000/year or roughly $71/hour, multiplied by typical outside counsel rates of 2x to 4x for billable work. Twenty hours of outside counsel at $200/hour is $4,000; one hundred hours at $250/hour is $25,000.
- **Training facilitation.** $5K for a small internal cohort using the existing curriculum, up to $50K for a Large agency contracting an external facilitator across multiple cohorts and tracks. Use the [Curriculum Map](/resources/frameworks-cited/) per-track effort estimates as a starting point.
- **Annual audit and penetration test.** $15K to $50K depending on scope. Public ranges vary; anchor against your existing security audit vendor or the [GSA Multiple Award Schedule](https://www.gsa.gov/buy-through-us/products-and-services/professional-services) for IT security services.

## How the path budgets are built

The Small, Standard, and Large ranges in [Pick Your Path](/getting-started/pick-your-path/) are assembled from the components above.

| Component             | Small                     | Standard                          | Large                           |
| --------------------- | ------------------------- | --------------------------------- | ------------------------------- |
| People                | 0.5 FTE x ~$215K = ~$107K | 1.5 FTE blended x ~$215K = ~$320K | 4 FTE blended x ~$215K = ~$860K |
| Cloud and AI services | $5K to $15K               | $20K to $60K                      | $100K to $300K                  |
| Tooling               | $3K to $8K                | $10K to $25K                      | $50K to $150K                   |
| External              | $5K to $15K               | $25K to $75K                      | $100K to $300K                  |
| **Total Year 1**      | **~$120K to $145K**       | **~$375K to $480K**               | **~$1.1M to $1.6M**             |

A few notes on how these stack up against the headline ranges:

- The Small range published as "$50K to $150K" assumes the agency runs the [Governance Only off-ramp](/getting-started/pick-your-path/#small-agency-path-monthbymonth) or uses contract engineers part-time rather than carrying 0.5 FTE for a full year. A true 0.5 FTE allocation pushes the low end up. If your agency is actually closer to 0.25 FTE on the AI program, the published low end is realistic.
- The Standard range published as "$150K to $400K" is achievable when the agency reuses existing IT staff rather than hiring net-new headcount. The full-loaded math above is what the program costs when you account for fully attributed staff time.
- The Large range scales linearly with FTE count and inference volume.

These are anchored estimates. Real budgets vary by locality, existing infrastructure, procurement vehicle, usage volume, and how much staff time you treat as already allocated versus net-new.

## Download the worksheet

Download [budget-template.csv](/templates/budget-template.csv). Open it in Excel, Google Sheets, or Numbers. Save as .xlsx if you want formulas.

The worksheet has every line item from this page, plus columns for the source URL, the default value, your override, and notes. Replace the defaults with your locality pay bands, your expected token volume, and your actual tooling list, and the totals will match a budget memo your finance team can defend.

## Caveats

- **Procurement cycles can add long lead time.** The dollars on this page are operational, not procurement-cycle. Add procurement officer time and any third-party security review separately.
- **These figures are 2026 anchors.** Cloud AI service costs are dropping. Tooling licensing is evolving. Re-anchor annually, especially the inference per-token rates.
- **Match to the variant for your agency size.** The component math should map to the [Pick Your Path](/getting-started/pick-your-path/) variant your agency picked. If you are between sizes, use the Standard inputs and reduce FTE allocation rather than mixing rows from two variants.

## See also

- [Pick Your Path](/getting-started/pick-your-path/). The variant table this page sources its anchors from.
- [ROI Calculator](/resources/roi-calculator/). Pair the cost side with a savings model for a single use case.
- [Quarterly Milestone Report Template](/resources/quarterly-report/). How to roll budget actuals into sponsor reporting.
- [Council or Board Budget Memo template](/resources/template-library/#council-or-board-budget-memo). The funding-request memo that consumes the totals here.

/** @jsxImportSource preact */
import { useEffect, useMemo, useState } from "preact/hooks";
import { printDocument, type Block } from "../lib/printDocument";

/* The ROI calculator helps a department director or budget officer build a
 * defensible cost / savings / payback case for a single AI use case. The
 * calculation is intentionally simple — annual recurring costs vs annual
 * recurring savings — because most agency budget reviewers can follow that
 * arithmetic in their head. */

const STORAGE_KEY = "aqg.roi.v1";

interface FormState {
  agency: string;
  useCase: string;
  preparedBy: string;
  // Costs (annual unless noted)
  vendorAnnual: string;
  computeAnnual: string;
  staffImplOneTime: string;
  trainingOneTime: string;
  ongoingStaffAnnual: string;
  legalReviewOneTime: string;
  // Savings drivers
  staffHoursSavedPerWeek: string;
  blendedHourlyRate: string;
  errorReductionAnnual: string;
  cycleTimeSavingsAnnual: string;
  // Horizon
  horizonYears: string;
}

const EMPTY: FormState = {
  agency: "",
  useCase: "",
  preparedBy: "",
  vendorAnnual: "",
  computeAnnual: "",
  staffImplOneTime: "",
  trainingOneTime: "",
  ongoingStaffAnnual: "",
  legalReviewOneTime: "",
  staffHoursSavedPerWeek: "",
  blendedHourlyRate: "",
  errorReductionAnnual: "",
  cycleTimeSavingsAnnual: "",
  horizonYears: "3",
};

function loadState(): FormState {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<FormState>;
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...EMPTY };
  }
}

function saveState(s: FormState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* localStorage unavailable */
  }
}

const num = (v: string): number => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const fmt = (n: number): string =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtMonths = (n: number): string => {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n < 1) return "< 1 month";
  if (n >= 60) return "5+ years";
  return `${n.toFixed(1)} months`;
};

interface Computation {
  oneTimeCosts: number;
  annualCosts: number;
  annualStaffSavings: number;
  annualOtherSavings: number;
  annualSavings: number;
  netAnnual: number;
  paybackMonths: number;
  horizonNet: number;
  horizonROIPct: number;
}

function compute(s: FormState): Computation {
  const oneTimeCosts =
    num(s.staffImplOneTime) +
    num(s.trainingOneTime) +
    num(s.legalReviewOneTime);

  const annualCosts =
    num(s.vendorAnnual) + num(s.computeAnnual) + num(s.ongoingStaffAnnual);

  const annualStaffSavings =
    num(s.staffHoursSavedPerWeek) * 52 * num(s.blendedHourlyRate);

  const annualOtherSavings =
    num(s.errorReductionAnnual) + num(s.cycleTimeSavingsAnnual);

  const annualSavings = annualStaffSavings + annualOtherSavings;
  const netAnnual = annualSavings - annualCosts;
  const paybackMonths = netAnnual > 0 ? (oneTimeCosts / netAnnual) * 12 : 0;

  const horizon = Math.max(1, Math.min(10, num(s.horizonYears) || 3));
  const horizonNet = netAnnual * horizon - oneTimeCosts;
  const totalCost = oneTimeCosts + annualCosts * horizon;
  const horizonROIPct = totalCost > 0 ? (horizonNet / totalCost) * 100 : 0;

  return {
    oneTimeCosts,
    annualCosts,
    annualStaffSavings,
    annualOtherSavings,
    annualSavings,
    netAnnual,
    paybackMonths,
    horizonNet,
    horizonROIPct,
  };
}

interface Field {
  key: keyof FormState;
  label: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}

const COST_FIELDS: Field[] = [
  {
    key: "vendorAnnual",
    label: "Vendor / SaaS license",
    hint: "Annual subscription, per-seat, or API spend",
    prefix: "$",
    suffix: "/yr",
  },
  {
    key: "computeAnnual",
    label: "Cloud / compute",
    hint: "Hosting, model inference, storage",
    prefix: "$",
    suffix: "/yr",
  },
  {
    key: "ongoingStaffAnnual",
    label: "Ongoing staff (operate / monitor)",
    hint: "Fraction of an FTE × loaded salary",
    prefix: "$",
    suffix: "/yr",
  },
  {
    key: "staffImplOneTime",
    label: "Implementation staff time",
    hint: "Internal hours × loaded rate, year 1 only",
    prefix: "$",
    suffix: "one-time",
  },
  {
    key: "trainingOneTime",
    label: "Training & change management",
    hint: "Curriculum delivery, materials, time off the floor",
    prefix: "$",
    suffix: "one-time",
  },
  {
    key: "legalReviewOneTime",
    label: "Legal / procurement review",
    hint: "Outside counsel, procurement officer time",
    prefix: "$",
    suffix: "one-time",
  },
];

const SAVINGS_FIELDS: Field[] = [
  {
    key: "staffHoursSavedPerWeek",
    label: "Staff hours saved per week",
    hint: "Across all users of the tool, total hours/week",
    suffix: "hrs/wk",
  },
  {
    key: "blendedHourlyRate",
    label: "Blended loaded hourly rate",
    hint: "Salary + benefits ÷ hours; typical gov range $45–$95",
    prefix: "$",
    suffix: "/hr",
  },
  {
    key: "errorReductionAnnual",
    label: "Error / rework reduction",
    hint: "Estimated annual value of avoided rework, fines, or appeals",
    prefix: "$",
    suffix: "/yr",
  },
  {
    key: "cycleTimeSavingsAnnual",
    label: "Cycle-time / throughput value",
    hint: "Faster permit / case / response times — only count if measurable",
    prefix: "$",
    suffix: "/yr",
  },
];

export default function ROICalculator() {
  const [state, setState] = useState<FormState>({ ...EMPTY });

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const c = useMemo(() => compute(state), [state]);

  const update = (key: keyof FormState, value: string) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset the calculator? Saved inputs will be cleared.")
    )
      return;
    setState({ ...EMPTY });
  };

  const horizon = Math.max(1, Math.min(10, num(state.horizonYears) || 3));

  const buildMarkdown = (): string => {
    const date = new Date().toISOString().slice(0, 10);
    const name = state.useCase.trim() || "Unnamed AI use case";
    const agency = state.agency.trim() || "Agency";
    const lines: string[] = [];
    lines.push(`# AI ROI Estimate — ${name}`);
    lines.push("");
    lines.push(`*Prepared: ${date}*`);
    lines.push("");
    lines.push(`- **Agency:** ${agency}`);
    if (state.preparedBy.trim())
      lines.push(`- **Prepared by:** ${state.preparedBy.trim()}`);
    lines.push(`- **Horizon:** ${horizon} year${horizon === 1 ? "" : "s"}`);
    lines.push("");
    lines.push("## Headline numbers");
    lines.push("");
    lines.push(`- **Net annual benefit:** ${fmt(c.netAnnual)}`);
    lines.push(`- **Payback period:** ${fmtMonths(c.paybackMonths)}`);
    lines.push(
      `- **${horizon}-year net:** ${fmt(c.horizonNet)} (ROI ${c.horizonROIPct.toFixed(0)}%)`,
    );
    lines.push("");
    lines.push("## Costs");
    lines.push("");
    lines.push("| Category | Amount |");
    lines.push("|---|---|");
    for (const f of COST_FIELDS)
      lines.push(`| ${f.label} | ${fmt(num(state[f.key]))} |`);
    lines.push(
      `| **One-time costs (subtotal)** | **${fmt(c.oneTimeCosts)}** |`,
    );
    lines.push(`| **Annual costs (subtotal)** | **${fmt(c.annualCosts)}** |`);
    lines.push("");
    lines.push("## Savings");
    lines.push("");
    lines.push("| Driver | Annual value |");
    lines.push("|---|---|");
    lines.push(
      `| Staff hours saved (${num(state.staffHoursSavedPerWeek)} hrs/wk × ${fmt(num(state.blendedHourlyRate))}/hr × 52) | ${fmt(c.annualStaffSavings)} |`,
    );
    lines.push(
      `| Error / rework reduction | ${fmt(num(state.errorReductionAnnual))} |`,
    );
    lines.push(
      `| Cycle-time / throughput value | ${fmt(num(state.cycleTimeSavingsAnnual))} |`,
    );
    lines.push(`| **Total annual savings** | **${fmt(c.annualSavings)}** |`);
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push(
      "*Estimates only. ROI for AI use cases tends to land in the lower half of stated ranges in the first year. Treat the staff-hours line as the conservative anchor and the error / cycle-time lines as upside.*",
    );
    return lines.join("\n");
  };

  const onExport = () => {
    if (typeof window === "undefined") return;
    const md = buildMarkdown();
    const slug = (state.useCase || "ai-roi")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "ai-roi"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onPrint = () => {
    const date = new Date().toISOString().slice(0, 10);
    const name = state.useCase.trim() || "Unnamed AI use case";
    const agency = state.agency.trim() || "Agency";

    const blocks: Block[] = [
      { kind: "heading", level: 2, text: "Headline numbers" },
      {
        kind: "definitionList",
        items: [
          { term: "Net annual benefit", definition: fmt(c.netAnnual) },
          { term: "Payback period", definition: fmtMonths(c.paybackMonths) },
          {
            term: `${horizon}-year net`,
            definition: `${fmt(c.horizonNet)} (ROI ${c.horizonROIPct.toFixed(0)}%)`,
          },
        ],
      },
      { kind: "heading", level: 2, text: "Costs" },
      {
        kind: "table",
        headers: ["Category", "Amount"],
        rows: [
          ...COST_FIELDS.map((f) => [f.label, fmt(num(state[f.key]))]),
          ["One-time costs (subtotal)", fmt(c.oneTimeCosts)],
          ["Annual costs (subtotal)", fmt(c.annualCosts)],
        ],
      },
      { kind: "heading", level: 2, text: "Savings" },
      {
        kind: "table",
        headers: ["Driver", "Annual value"],
        rows: [
          [
            `Staff hours saved (${num(state.staffHoursSavedPerWeek)} hrs/wk × ${fmt(num(state.blendedHourlyRate))}/hr × 52)`,
            fmt(c.annualStaffSavings),
          ],
          ["Error / rework reduction", fmt(num(state.errorReductionAnnual))],
          [
            "Cycle-time / throughput value",
            fmt(num(state.cycleTimeSavingsAnnual)),
          ],
          ["Total annual savings", fmt(c.annualSavings)],
        ],
      },
      { kind: "rule" },
      {
        kind: "callout",
        tone: "info",
        title: "How to read this estimate",
        text: "ROI for AI use cases tends to land in the lower half of stated ranges in the first year. Treat the staff-hours line as the conservative anchor and the error and cycle-time lines as upside that needs to be measured post-launch. Re-run the calculator at the 6- and 12-month marks with actuals.",
      },
    ];

    printDocument({
      title: `AI ROI Estimate — ${name}`,
      subtitle: agency,
      meta: [
        { label: "Agency", value: agency },
        { label: "Use case", value: name },
        {
          label: "Prepared by",
          value: state.preparedBy.trim() || "—",
        },
        {
          label: "Horizon",
          value: `${horizon} year${horizon === 1 ? "" : "s"}`,
        },
        { label: "Prepared", value: date },
      ],
      blocks,
    });
  };

  const renderField = (f: Field) => (
    <label key={f.key} class="aqg-tier__field">
      <span class="aqg-tier__label">
        {f.label}
        {f.hint ? <span class="aqg-roi__hint"> — {f.hint}</span> : null}
      </span>
      <span class="aqg-roi__inputrow">
        {f.prefix ? <span class="aqg-roi__affix">{f.prefix}</span> : null}
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={state[f.key]}
          placeholder="0"
          onInput={(e) =>
            update(f.key, (e.currentTarget as HTMLInputElement).value)
          }
        />
        {f.suffix ? <span class="aqg-roi__affix">{f.suffix}</span> : null}
      </span>
    </label>
  );

  return (
    <div class="aqg-tier">
      <div class="aqg-tier__inputs">
        <div class="aqg-tier__row">
          <label class="aqg-tier__field">
            <span class="aqg-tier__label">Agency</span>
            <input
              type="text"
              value={state.agency}
              placeholder="e.g., Springfield Public Health"
              onInput={(e) =>
                update("agency", (e.currentTarget as HTMLInputElement).value)
              }
            />
          </label>
          <label class="aqg-tier__field">
            <span class="aqg-tier__label">Use case</span>
            <input
              type="text"
              value={state.useCase}
              placeholder="e.g., 311 service request triage"
              onInput={(e) =>
                update("useCase", (e.currentTarget as HTMLInputElement).value)
              }
            />
          </label>
          <label class="aqg-tier__field">
            <span class="aqg-tier__label">Prepared by</span>
            <input
              type="text"
              value={state.preparedBy}
              placeholder="e.g., M. Rivera, Budget"
              onInput={(e) =>
                update(
                  "preparedBy",
                  (e.currentTarget as HTMLInputElement).value,
                )
              }
            />
          </label>
        </div>
      </div>

      <section class="aqg-roi__section">
        <h3 class="aqg-roi__section-title">Costs</h3>
        <div class="aqg-roi__grid">{COST_FIELDS.map(renderField)}</div>
      </section>

      <section class="aqg-roi__section">
        <h3 class="aqg-roi__section-title">Savings drivers</h3>
        <div class="aqg-roi__grid">{SAVINGS_FIELDS.map(renderField)}</div>
      </section>

      <section class="aqg-roi__section">
        <h3 class="aqg-roi__section-title">Horizon</h3>
        <label class="aqg-tier__field">
          <span class="aqg-tier__label">Years to evaluate</span>
          <select
            value={state.horizonYears}
            onChange={(e) =>
              update(
                "horizonYears",
                (e.currentTarget as HTMLSelectElement).value,
              )
            }
          >
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="3">3 years</option>
            <option value="5">5 years</option>
          </select>
        </label>
      </section>

      <div class="aqg-tier__result aqg-roi__result" aria-live="polite">
        <div class="aqg-roi__headlines">
          <div class="aqg-roi__metric">
            <span class="aqg-roi__metric-label">Net annual benefit</span>
            <span class="aqg-roi__metric-value">{fmt(c.netAnnual)}</span>
            <span class="aqg-roi__metric-detail">
              {fmt(c.annualSavings)} savings − {fmt(c.annualCosts)} annual costs
            </span>
          </div>
          <div class="aqg-roi__metric">
            <span class="aqg-roi__metric-label">Payback period</span>
            <span class="aqg-roi__metric-value">
              {fmtMonths(c.paybackMonths)}
            </span>
            <span class="aqg-roi__metric-detail">
              {fmt(c.oneTimeCosts)} one-time ÷ net annual
            </span>
          </div>
          <div class="aqg-roi__metric">
            <span class="aqg-roi__metric-label">{horizon}-year net</span>
            <span class="aqg-roi__metric-value">{fmt(c.horizonNet)}</span>
            <span class="aqg-roi__metric-detail">
              ROI {c.horizonROIPct.toFixed(0)}% over horizon
            </span>
          </div>
        </div>
      </div>

      <div class="aqg-tier__actions no-print">
        <button type="button" onClick={onExport}>
          Export estimate as Markdown
        </button>
        <button type="button" onClick={onPrint}>
          Print / Save as PDF
        </button>
        <button type="button" class="aqg-tier__reset" onClick={reset}>
          Reset
        </button>
      </div>

      <p class="aqg-tier__privacy no-print">
        Inputs are saved only in this browser. Nothing is sent to a server.
      </p>
    </div>
  );
}

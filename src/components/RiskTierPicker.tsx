/** @jsxImportSource preact */
import { useEffect, useMemo, useState } from "preact/hooks";
import { printDocument, type Block } from "../lib/printDocument";

type Tier = 1 | 2 | 3;

interface DimensionDef {
  id: string;
  label: string;
  prompt: string;
  options: { tier: Tier; label: string }[];
}

const DIMENSIONS: DimensionDef[] = [
  {
    id: "rights",
    label: "Rights, benefits, safety",
    prompt:
      "Does the use case affect a person's rights, benefits, employment, safety, or liberty?",
    options: [
      { tier: 1, label: "No — does not affect any of these" },
      {
        tier: 2,
        label:
          "Indirectly — informs a human decision that affects these things",
      },
      {
        tier: 3,
        label:
          "Directly — drives or strongly shapes the decision affecting these things",
      },
    ],
  },
  {
    id: "reversibility",
    label: "Reversibility of harm",
    prompt: "If the AI is wrong, how reversible is the consequence?",
    options: [
      { tier: 1, label: "Trivially reversible (edit, redo, ignore)" },
      { tier: 2, label: "Reversible with effort (re-do work, contact people)" },
      { tier: 3, label: "Hard to reverse or irreversible" },
    ],
  },
  {
    id: "data",
    label: "Data sensitivity",
    prompt: "What kind of data does the use case touch?",
    options: [
      { tier: 1, label: "Public or non-sensitive internal data only" },
      {
        tier: 2,
        label: "Internal sensitive data (HR, operational, non-PII)",
      },
      {
        tier: 3,
        label:
          "PII, PHI, criminal-justice, financial, immigration, or child-welfare data",
      },
    ],
  },
  {
    id: "audience",
    label: "Audience",
    prompt: "Who interacts with the AI's output?",
    options: [
      { tier: 1, label: "Internal staff only" },
      { tier: 2, label: "Staff plus a limited public audience" },
      {
        tier: 3,
        label: "General public, beneficiaries, applicants, or constituents",
      },
    ],
  },
  {
    id: "automation",
    label: "Automation level",
    prompt: "How much human review sits between the AI and an action?",
    options: [
      { tier: 1, label: "Suggests — a human always acts independently" },
      {
        tier: 2,
        label: "Recommends — a human approves before any action is taken",
      },
      {
        tier: 3,
        label:
          "Decides or filters — human review is post-hoc, optional, or absent",
      },
    ],
  },
];

const STORAGE_KEY = "aqg.risktier.v1";

interface FormState {
  useCaseName: string;
  description: string;
  answers: Record<string, Tier>;
}

const EMPTY: FormState = {
  useCaseName: "",
  description: "",
  answers: {},
};

const TIER_META: Record<
  Tier,
  {
    name: string;
    summary: string;
    reviewers: string[];
    documentation: string[];
    disclosures: string[];
    nextActions: { text: string; href: string }[];
  }
> = {
  1: {
    name: "Low (Tier 1)",
    summary:
      "Internal productivity use case with reversible consequences and no public-facing impact. Manager approval is sufficient; the use case is batch-noted to the Review Committee.",
    reviewers: ["Manager / supervisor", "AI Program Lead (notification only)"],
    documentation: [
      "Use case in the agency AI inventory",
      "Tool listed on the Approved AI Tools List for Tier-1 use",
      "30-day decision-log retention",
    ],
    disclosures: [
      "None required — but staff should still note AI assistance in work product where customary",
    ],
    nextActions: [
      {
        text: "Review the AUP",
        href: "/phase-1-governance/acceptable-use-policy/",
      },
      {
        text: "Add to AI use case inventory",
        href: "/phase-1-governance/risk-classification/",
      },
    ],
  },
  2: {
    name: "Medium (Tier 2)",
    summary:
      "AI shapes a staff-facing decision or a limited public communication. Review Committee approval and an AI Procurement Addendum (Section A + B) are required before deployment.",
    reviewers: [
      "AI Review Committee — simple majority approval",
      "Manager / supervisor",
      "Legal review when state or local law applies",
    ],
    documentation: [
      "Use case in the agency AI inventory",
      "Pre-launch evaluation and quarterly review",
      "1-year decision-log retention",
      "Vendor signs AI Procurement Addendum, Sections A + B",
      "Internal plain-language explanation maintained for staff",
    ],
    disclosures: [
      "Note in the workflow document and staff training that AI is in use",
      "If the output is shared with a council, court, or regulator, disclose AI involvement",
    ],
    nextActions: [
      {
        text: "Bring to next AI Review Committee meeting",
        href: "/phase-1-governance/review-committee/",
      },
      {
        text: "Attach Procurement Addendum to vendor contract",
        href: "/phase-1-governance/procurement-guardrails/",
      },
    ],
  },
  3: {
    name: "High (Tier 3)",
    summary:
      "AI directly drives a decision affecting a person's rights, benefits, employment, safety, or liberty. Two-thirds Review Committee approval, legal sign-off, public notice, contestation pathway, and a full impact assessment are required before deployment.",
    reviewers: [
      "AI Review Committee — two-thirds approval, including legal and equity officer",
      "Legal counsel — formal sign-off",
      "Designated Agency AI Official (per OMB M-24-10)",
      "Community / external advisor (Tier-3 deep-dive)",
    ],
    documentation: [
      "Use case in the agency AI inventory with impact summary",
      "Pre-launch bias and disparate-impact assessment",
      "Ongoing monitoring + annual audit",
      "7-year decision-log retention (or per applicable records schedule)",
      "Vendor signs AI Procurement Addendum, Sections A + B + C (bias testing rider, audit access, indemnification)",
    ],
    disclosures: [
      "Public notice in plain language describing what the AI does and what data it uses",
      "Contestation / appeal pathway for affected individuals",
      "Compliance disclosures required by Colorado AI Act, Texas TRAIGA, or similar state law in scope",
    ],
    nextActions: [
      {
        text: "Schedule a Review Committee Tier-3 deep-dive",
        href: "/phase-1-governance/review-committee/",
      },
      {
        text: "Check legislative requirements for your jurisdiction",
        href: "/phase-1-governance/legislative-compliance/",
      },
      {
        text: "Attach Procurement Addendum Section C",
        href: "/phase-1-governance/procurement-guardrails/",
      },
    ],
  },
};

function loadState(): FormState {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<FormState>;
    return { ...EMPTY, ...parsed, answers: parsed.answers ?? {} };
  } catch {
    return { ...EMPTY };
  }
}

function saveState(state: FormState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* localStorage unavailable; fail silently */
  }
}

function computeTier(answers: Record<string, Tier>): Tier | null {
  const values = DIMENSIONS.map((d) => answers[d.id]).filter(
    (v): v is Tier => typeof v === "number",
  );
  if (values.length < DIMENSIONS.length) return null;
  return Math.max(...values) as Tier;
}

function exportMarkdown(state: FormState, tier: Tier): string {
  const meta = TIER_META[tier];
  const date = new Date().toISOString().slice(0, 10);
  const name = state.useCaseName.trim() || "Unnamed use case";
  const desc = state.description.trim();

  const lines: string[] = [];
  lines.push(`# AI Use Case Classification — ${name}`);
  lines.push("");
  lines.push(`*Classified: ${date}*`);
  lines.push("");
  lines.push(`## Recommended tier: ${meta.name}`);
  lines.push("");
  lines.push(`> ${meta.summary}`);
  lines.push("");
  if (desc) {
    lines.push("## Use case description");
    lines.push("");
    lines.push(desc);
    lines.push("");
  }
  lines.push("## Dimension answers");
  lines.push("");
  lines.push("| Dimension | Tier | Answer |");
  lines.push("|---|---|---|");
  for (const d of DIMENSIONS) {
    const t = state.answers[d.id];
    const opt = d.options.find((o) => o.tier === t);
    lines.push(
      `| ${d.label} | ${t ?? "—"} | ${opt?.label ?? "Not answered"} |`,
    );
  }
  lines.push("");
  lines.push("## Required reviewers");
  lines.push("");
  for (const r of meta.reviewers) lines.push(`- ${r}`);
  lines.push("");
  lines.push("## Required documentation");
  lines.push("");
  for (const d of meta.documentation) lines.push(`- ${d}`);
  lines.push("");
  lines.push("## Required disclosures");
  lines.push("");
  for (const d of meta.disclosures) lines.push(`- ${d}`);
  lines.push("");
  lines.push("## Next actions");
  lines.push("");
  for (const a of meta.nextActions) lines.push(`- ${a.text}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(
    "_Tier is computed as the highest of the five dimension answers (any dimension reaching High → Tier 3 overall). The recommendation is a starting point; the AI Review Committee may adjust based on local context. Document any dissent in the meeting minutes._",
  );
  return lines.join("\n");
}

export default function RiskTierPicker() {
  const [state, setState] = useState<FormState>({ ...EMPTY });

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const tier = useMemo(() => computeTier(state.answers), [state.answers]);
  const answeredCount = Object.keys(state.answers).length;

  const setField = (key: keyof FormState, value: string) =>
    setState((s) => ({ ...s, [key]: value }));

  const setAnswer = (id: string, t: Tier) =>
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: t } }));

  const reset = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Reset this classification? Saved answers will be cleared.",
      );
      if (!ok) return;
    }
    setState({ ...EMPTY });
  };

  const onExport = () => {
    if (!tier) return;
    const md = exportMarkdown(state, tier);
    const date = new Date().toISOString().slice(0, 10);
    const slug = (state.useCaseName || "use-case")
      .replace(/\s+/g, "-")
      .toLowerCase();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-tier-${tier}-${date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onPrint = () => {
    if (!tier) return;
    const m = TIER_META[tier];
    const date = new Date().toISOString().slice(0, 10);
    const name = state.useCaseName.trim() || "AI Use Case";
    const desc = state.description.trim();

    const dimRows = DIMENSIONS.map((d) => {
      const t = state.answers[d.id];
      const opt = d.options.find((o) => o.tier === t);
      return [d.label, t ? `Tier ${t}` : "—", opt?.label ?? "Not answered"];
    });

    const blocks: Block[] = [
      { kind: "heading", level: 2, text: "Recommended risk tier" },
      { kind: "lead", text: `${m.name} — ${m.summary}` },
    ];

    if (desc) {
      blocks.push({ kind: "heading", level: 2, text: "Use case description" });
      blocks.push({ kind: "paragraph", text: desc });
    }

    blocks.push(
      { kind: "heading", level: 2, text: "Dimension answers" },
      {
        kind: "table",
        headers: ["Dimension", "Tier", "Answer"],
        rows: dimRows,
      },
      { kind: "heading", level: 2, text: "Required reviewers" },
      { kind: "list", items: m.reviewers },
      { kind: "heading", level: 2, text: "Required documentation" },
      { kind: "list", items: m.documentation },
      { kind: "heading", level: 2, text: "Required disclosures" },
      { kind: "list", items: m.disclosures },
      { kind: "heading", level: 2, text: "Next actions" },
      { kind: "list", items: m.nextActions.map((a) => a.text) },
      { kind: "rule" },
      {
        kind: "callout",
        tone: "info",
        title: "How the tier is computed",
        text: "Tier is the highest of the five dimension answers — any dimension reaching High pushes the overall use case to Tier 3. This recommendation is provisional. The AI Review Committee makes the final determination and may adjust based on local context. Document any dissent in the meeting minutes.",
      },
    );

    printDocument({
      title: `${name} — Risk Tier Determination`,
      subtitle: `Provisional classification: ${m.name}`,
      meta: [
        { label: "Use case", value: name },
        { label: "Recommended tier", value: m.name },
        { label: "Classified", value: date },
      ],
      blocks,
    });
  };

  const meta = tier ? TIER_META[tier] : null;

  return (
    <div class="aqg-tier">
      <div class="aqg-tier__inputs">
        <label class="aqg-tier__field">
          <span class="aqg-tier__label">Use case name</span>
          <input
            type="text"
            value={state.useCaseName}
            placeholder="e.g. 311 service request triage"
            onInput={(e) =>
              setField("useCaseName", (e.target as HTMLInputElement).value)
            }
          />
        </label>
        <label class="aqg-tier__field">
          <span class="aqg-tier__label">Description (optional)</span>
          <textarea
            rows={2}
            value={state.description}
            placeholder="One or two sentences describing what the AI will do, who it serves, and what data it touches."
            onInput={(e) =>
              setField("description", (e.target as HTMLTextAreaElement).value)
            }
          />
        </label>
      </div>

      <div class="aqg-tier__progress no-print">
        <strong>{answeredCount}</strong> / {DIMENSIONS.length} dimensions
        answered
      </div>

      <ol class="aqg-tier__list">
        {DIMENSIONS.map((d) => (
          <li key={d.id} class="aqg-tier__q">
            <div class="aqg-tier__dimension">{d.label}</div>
            <div class="aqg-tier__prompt">{d.prompt}</div>
            <div class="aqg-tier__options">
              {d.options.map((o) => (
                <label key={o.tier}>
                  <input
                    type="radio"
                    name={d.id}
                    value={o.tier}
                    checked={state.answers[d.id] === o.tier}
                    onChange={() => setAnswer(d.id, o.tier)}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      {tier && meta ? (
        <div
          class={"aqg-tier__result aqg-tier__result--t" + tier}
          aria-live="polite"
        >
          <div class="aqg-tier__badge">Tier {tier}</div>
          <h3>{meta.name}</h3>
          <p>{meta.summary}</p>

          <div class="aqg-tier__sections">
            <div>
              <h4>Required reviewers</h4>
              <ul>
                {meta.reviewers.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Required documentation</h4>
              <ul>
                {meta.documentation.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Required disclosures</h4>
              <ul>
                {meta.disclosures.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Next actions</h4>
              <ul>
                {meta.nextActions.map((a) => (
                  <li key={a.href}>
                    <a href={a.href}>{a.text}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div class="aqg-tier__pending no-print">
          <p>
            Answer all five dimensions to see the recommended tier and required
            governance.
          </p>
        </div>
      )}

      <div class="aqg-tier__actions no-print">
        <button type="button" onClick={onExport} disabled={!tier}>
          Export classification as Markdown
        </button>
        <button type="button" onClick={onPrint} disabled={!tier}>
          Print / Save as PDF
        </button>
        <button type="button" class="aqg-tier__reset" onClick={reset}>
          Reset
        </button>
      </div>

      <p class="aqg-tier__privacy no-print">
        Tier is computed as the highest of the five dimension answers — any
        dimension reaching High pushes the overall use case to Tier 3. The
        recommendation is a starting point; your Review Committee may adjust
        based on local context.
      </p>
      <p class="aqg-tier__privacy no-print">
        Your answers are saved only in this browser. Nothing is sent to a
        server.
      </p>
    </div>
  );
}

/** @jsxImportSource preact */
import { useEffect, useMemo, useState } from "preact/hooks";

type Tier = 1 | 2 | 3;

interface RadioOption {
  tier: Tier;
  label: string;
}

interface DataOption {
  id: string;
  tier: Tier;
  label: string;
}

const AUDIENCE_OPTIONS: RadioOption[] = [
  { tier: 1, label: "Internal staff only" },
  {
    tier: 2,
    label: "Staff plus a limited public audience (e.g., council, partners)",
  },
  {
    tier: 3,
    label: "General public, beneficiaries, applicants, or constituents",
  },
];

const DECISION_OPTIONS: RadioOption[] = [
  {
    tier: 1,
    label: "Advisory only — AI suggests; a human always acts independently",
  },
  {
    tier: 2,
    label:
      "Decision support — AI recommends; a human approves before any action",
  },
  {
    tier: 3,
    label:
      "Automated — AI decides or filters; human review is post-hoc, optional, or absent",
  },
];

const DATA_OPTIONS: DataOption[] = [
  { id: "public", tier: 1, label: "Public or non-sensitive internal data" },
  {
    id: "internal_sensitive",
    tier: 2,
    label: "Internal sensitive data (HR, operational, non-PII)",
  },
  { id: "pii", tier: 3, label: "Personally identifiable information (PII)" },
  { id: "phi", tier: 3, label: "Protected health information (PHI / HIPAA)" },
  {
    id: "criminal_justice",
    tier: 3,
    label: "Criminal justice / law enforcement data",
  },
  {
    id: "financial",
    tier: 3,
    label: "Financial / payment / benefits eligibility data",
  },
  { id: "immigration", tier: 3, label: "Immigration status data" },
  { id: "child_welfare", tier: 3, label: "Child welfare data" },
];

const STORAGE_KEY = "aqg.intake.v1";

interface FormState {
  useCaseName: string;
  sponsorName: string;
  sponsorRole: string;
  department: string;
  problem: string;
  audience: Tier | null;
  decision: Tier | null;
  data: Record<string, boolean>;
}

const EMPTY: FormState = {
  useCaseName: "",
  sponsorName: "",
  sponsorRole: "",
  department: "",
  problem: "",
  audience: null,
  decision: null,
  data: {},
};

const TIER_NEXT: Record<
  Tier,
  { label: string; summary: string; nextStep: string; href: string }
> = {
  1: {
    label: "Tier 1 (Low)",
    summary:
      "Looks like an internal productivity use case with reversible consequences. Manager approval is sufficient; the use case is batch-noted to the Review Committee.",
    nextStep:
      "Send this intake to your manager for sign-off, then add it to the AI use case inventory.",
    href: "/phase-1-governance/risk-classification/",
  },
  2: {
    label: "Tier 2 (Medium)",
    summary:
      "Looks like AI shapes a staff-facing decision or a limited public communication. Review Committee approval is required before deployment.",
    nextStep:
      "Submit this intake to the AI Review Committee for the next standing meeting.",
    href: "/phase-1-governance/review-committee/",
  },
  3: {
    label: "Tier 3 (High)",
    summary:
      "Looks like AI may directly drive a decision affecting rights, benefits, employment, safety, or liberty. A two-thirds Review Committee approval, legal sign-off, and a public-notice / contestation pathway will be required.",
    nextStep:
      "Submit this intake. The Review Committee will schedule a Tier-3 deep dive with legal and the equity officer.",
    href: "/phase-1-governance/risk-classification/",
  },
};

function loadState(): FormState {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<FormState>;
    return { ...EMPTY, ...parsed, data: parsed.data ?? {} };
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

function dataTier(data: Record<string, boolean>): Tier | null {
  const selected = DATA_OPTIONS.filter((o) => data[o.id]);
  if (selected.length === 0) return null;
  return Math.max(...selected.map((o) => o.tier)) as Tier;
}

function computeTier(s: FormState): Tier | null {
  const dt = dataTier(s.data);
  if (s.audience === null || s.decision === null || dt === null) return null;
  return Math.max(s.audience, s.decision, dt) as Tier;
}

function isComplete(s: FormState): boolean {
  return (
    s.useCaseName.trim() !== "" &&
    s.sponsorName.trim() !== "" &&
    s.sponsorRole.trim() !== "" &&
    s.department.trim() !== "" &&
    s.problem.trim() !== "" &&
    s.audience !== null &&
    s.decision !== null &&
    Object.values(s.data).some(Boolean)
  );
}

function exportMarkdown(s: FormState, tier: Tier | null): string {
  const date = new Date().toISOString().slice(0, 10);
  const name = s.useCaseName.trim() || "Unnamed use case";
  const audienceLabel =
    AUDIENCE_OPTIONS.find((o) => o.tier === s.audience)?.label ??
    "Not answered";
  const decisionLabel =
    DECISION_OPTIONS.find((o) => o.tier === s.decision)?.label ??
    "Not answered";
  const dataLabels = DATA_OPTIONS.filter((o) => s.data[o.id]).map(
    (o) => o.label,
  );

  const lines: string[] = [];
  lines.push(`# AI Use Case Intake — ${name}`);
  lines.push("");
  lines.push(`*Submitted: ${date}*`);
  lines.push("");
  lines.push("## Sponsor");
  lines.push("");
  lines.push(`- **Name:** ${s.sponsorName.trim() || "—"}`);
  lines.push(`- **Role:** ${s.sponsorRole.trim() || "—"}`);
  lines.push(`- **Department:** ${s.department.trim() || "—"}`);
  lines.push("");
  lines.push("## Problem statement");
  lines.push("");
  lines.push(s.problem.trim() || "_(not provided)_");
  lines.push("");
  lines.push("## Intake answers");
  lines.push("");
  lines.push("| Question | Answer |");
  lines.push("|---|---|");
  lines.push(`| Audience | ${audienceLabel} |`);
  lines.push(`| Decision impact | ${decisionLabel} |`);
  lines.push(
    `| Data sensitivity | ${dataLabels.length > 0 ? dataLabels.join("; ") : "Not answered"} |`,
  );
  lines.push("");
  if (tier !== null) {
    const meta = TIER_NEXT[tier];
    lines.push("## Provisional risk tier");
    lines.push("");
    lines.push(`**${meta.label}** — ${meta.summary}`);
    lines.push("");
    lines.push(
      "> *Provisional only. The AI Review Committee makes the final tier determination.*",
    );
    lines.push("");
    lines.push("## Recommended next step");
    lines.push("");
    lines.push(meta.nextStep);
    lines.push("");
  }
  lines.push("---");
  lines.push("");
  lines.push(
    "*Generated by the AI Quickstart Guide intake form. Locally submitted; nothing was sent to a server.*",
  );
  return lines.join("\n");
}

export default function IntakeForm() {
  const [state, setState] = useState<FormState>({ ...EMPTY });
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const tier = useMemo(() => computeTier(state), [state]);
  const complete = isComplete(state);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const toggleData = (id: string) => {
    setState((s) => ({ ...s, data: { ...s.data, [id]: !s.data[id] } }));
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Clear the intake form?")
    )
      return;
    setState({ ...EMPTY });
    setShowErrors(false);
  };

  const onExport = () => {
    if (!complete) {
      setShowErrors(true);
      return;
    }
    const md = exportMarkdown(state, tier);
    if (typeof window === "undefined") return;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = (state.useCaseName.trim() || "intake")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    a.download = `ai-intake-${slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const onPrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const errorClass = (filled: boolean) =>
    showErrors && !filled ? " aqg-tier__field--error" : "";

  return (
    <div class="aqg-tier">
      <div class="aqg-tier__inputs">
        <div
          class={
            "aqg-tier__field" + errorClass(state.useCaseName.trim() !== "")
          }
        >
          <label class="aqg-tier__label" for="aqg-intake-name">
            Use case name
          </label>
          <input
            id="aqg-intake-name"
            type="text"
            placeholder="e.g., 311 request triage assistant"
            value={state.useCaseName}
            onInput={(e) =>
              update("useCaseName", (e.currentTarget as HTMLInputElement).value)
            }
          />
        </div>

        <div class="aqg-tier__row">
          <div
            class={
              "aqg-tier__field" + errorClass(state.sponsorName.trim() !== "")
            }
          >
            <label class="aqg-tier__label" for="aqg-intake-sponsor">
              Sponsor name
            </label>
            <input
              id="aqg-intake-sponsor"
              type="text"
              placeholder="e.g., Sarah Chen"
              value={state.sponsorName}
              onInput={(e) =>
                update(
                  "sponsorName",
                  (e.currentTarget as HTMLInputElement).value,
                )
              }
            />
          </div>
          <div
            class={
              "aqg-tier__field" + errorClass(state.sponsorRole.trim() !== "")
            }
          >
            <label class="aqg-tier__label" for="aqg-intake-role">
              Sponsor role
            </label>
            <input
              id="aqg-intake-role"
              type="text"
              placeholder="e.g., Senior Analyst"
              value={state.sponsorRole}
              onInput={(e) =>
                update(
                  "sponsorRole",
                  (e.currentTarget as HTMLInputElement).value,
                )
              }
            />
          </div>
          <div
            class={
              "aqg-tier__field" + errorClass(state.department.trim() !== "")
            }
          >
            <label class="aqg-tier__label" for="aqg-intake-dept">
              Department
            </label>
            <input
              id="aqg-intake-dept"
              type="text"
              placeholder="e.g., Public Health"
              value={state.department}
              onInput={(e) =>
                update(
                  "department",
                  (e.currentTarget as HTMLInputElement).value,
                )
              }
            />
          </div>
        </div>
      </div>

      <ol class="aqg-tier__list">
        <li class="aqg-tier__q">
          <span class="aqg-tier__dimension">Question 1 — Problem</span>
          <span class="aqg-tier__prompt">
            What problem are you trying to solve, or what task takes too long
            today?
          </span>
          <div
            class={"aqg-tier__field" + errorClass(state.problem.trim() !== "")}
          >
            <textarea
              rows={4}
              placeholder="In plain language, describe the work you do today and where AI might help. Two or three sentences is fine."
              value={state.problem}
              onInput={(e) =>
                update(
                  "problem",
                  (e.currentTarget as HTMLTextAreaElement).value,
                )
              }
            />
          </div>
        </li>

        <li class="aqg-tier__q">
          <span class="aqg-tier__dimension">Question 2 — Audience</span>
          <span class="aqg-tier__prompt">
            Who interacts with the AI's output?
          </span>
          <div
            class={"aqg-tier__options" + errorClass(state.audience !== null)}
          >
            {AUDIENCE_OPTIONS.map((o) => (
              <label key={o.tier}>
                <input
                  type="radio"
                  name="aqg-intake-audience"
                  checked={state.audience === o.tier}
                  onChange={() => update("audience", o.tier)}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </li>

        <li class="aqg-tier__q">
          <span class="aqg-tier__dimension">Question 3 — Decision impact</span>
          <span class="aqg-tier__prompt">
            What kind of decision will the AI make or inform?
          </span>
          <div
            class={"aqg-tier__options" + errorClass(state.decision !== null)}
          >
            {DECISION_OPTIONS.map((o) => (
              <label key={o.tier}>
                <input
                  type="radio"
                  name="aqg-intake-decision"
                  checked={state.decision === o.tier}
                  onChange={() => update("decision", o.tier)}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </li>

        <li class="aqg-tier__q">
          <span class="aqg-tier__dimension">Question 4 — Data sensitivity</span>
          <span class="aqg-tier__prompt">
            What kind of data will the AI use? Check all that apply.
          </span>
          <div
            class={
              "aqg-tier__options" +
              errorClass(Object.values(state.data).some(Boolean))
            }
          >
            {DATA_OPTIONS.map((o) => (
              <label key={o.id}>
                <input
                  type="checkbox"
                  checked={!!state.data[o.id]}
                  onChange={() => toggleData(o.id)}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </li>

        <li class="aqg-tier__q">
          <span class="aqg-tier__dimension">Question 5 — Sponsor</span>
          <span class="aqg-tier__prompt">
            Confirmed above. The sponsor is the staff member accountable for
            this idea moving through review.
          </span>
        </li>
      </ol>

      {tier !== null && complete ? (
        <div class={`aqg-tier__result aqg-tier__result--t${tier}`}>
          <span class="aqg-tier__badge">{TIER_NEXT[tier].label}</span>
          <h3>Provisional classification</h3>
          <p>{TIER_NEXT[tier].summary}</p>
          <p>
            <strong>Next step:</strong> {TIER_NEXT[tier].nextStep}{" "}
            <a href={TIER_NEXT[tier].href}>Learn more.</a>
          </p>
          <p>
            <em>
              This is a starting point — the AI Review Committee makes the final
              tier determination.
            </em>
          </p>
        </div>
      ) : (
        <div class="aqg-tier__pending">
          Fill in all fields and answer questions 2–4 to receive a provisional
          risk tier.
        </div>
      )}

      <div class="aqg-tier__actions no-print">
        <button type="button" onClick={onExport} disabled={!complete}>
          Export as Markdown
        </button>
        <button type="button" onClick={onPrint} disabled={!complete}>
          Print / save as PDF
        </button>
        <button type="button" class="aqg-tier__reset" onClick={reset}>
          Reset
        </button>
      </div>

      <p class="aqg-tier__privacy no-print">
        Your inputs stay in your browser (localStorage). Nothing is sent to a
        server. Clearing your browser data will erase saved progress.
      </p>
    </div>
  );
}

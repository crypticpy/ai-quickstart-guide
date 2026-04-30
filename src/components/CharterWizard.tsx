/** @jsxImportSource preact */
import { useEffect, useMemo, useState } from "preact/hooks";
import { printDocument } from "../lib/printDocument";

interface FormState {
  agencyName: string;
  effectiveDate: string;
  chair: string;
  approvingBody: string;
  approvalDate: string;
  approvingBodyOfficer: string;
  cio: string;
  ciso: string;
  generalCounsel: string;
  hrDirector: string;
  equityOfficer: string;
  recordsSchedule: string;
}

const EMPTY: FormState = {
  agencyName: "",
  effectiveDate: "",
  chair: "",
  approvingBody: "",
  approvalDate: "",
  approvingBodyOfficer: "",
  cio: "",
  ciso: "",
  generalCounsel: "",
  hrDirector: "",
  equityOfficer: "",
  recordsSchedule: "",
};

const STORAGE_KEY = "aqg.charter.v1";

interface StepDef {
  title: string;
  intro: string;
  fields: FieldDef[];
}

interface FieldDef {
  key: keyof FormState;
  label: string;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  type?: "text" | "date";
}

const STEPS: StepDef[] = [
  {
    title: "Agency identity",
    intro:
      "Three fields populate the charter header and the chair line. The Chair is your AI Program Lead — the single accountable owner of AI governance day-to-day.",
    fields: [
      {
        key: "agencyName",
        label: "Agency name",
        placeholder: "e.g. City of Springfield",
        required: true,
      },
      {
        key: "chair",
        label: "Chair (AI Program Lead)",
        placeholder: "e.g. Director of Innovation & Technology",
        required: true,
        helper:
          "The named role or person who chairs the committee and signs minutes.",
      },
      {
        key: "effectiveDate",
        label: "Effective date",
        type: "date",
        required: true,
        helper:
          "When the charter takes effect. Usually the day after approval.",
      },
    ],
  },
  {
    title: "Approval",
    intro:
      "The body that adopts the charter and the officer who signs alongside the Chair.",
    fields: [
      {
        key: "approvingBody",
        label: "Approving body",
        placeholder: "e.g. City Council",
        required: true,
      },
      {
        key: "approvalDate",
        label: "Approval date",
        type: "date",
        required: true,
      },
      {
        key: "approvingBodyOfficer",
        label: "Approving body officer (countersignature)",
        placeholder: "e.g. Mayor, Board Chair, Council President",
        required: true,
        helper:
          "The officer who signs the charter alongside the Chair to certify approval by the body.",
      },
    ],
  },
  {
    title: "Voting members",
    intro:
      "Name a person or role for each seat. The rotating program-owner seat is appointed per use case and is not named here.",
    fields: [
      {
        key: "cio",
        label: "CIO or designee",
        placeholder: "e.g. Chief Information Officer",
        required: true,
      },
      {
        key: "ciso",
        label: "CISO or security lead",
        placeholder: "e.g. Information Security Officer",
        helper:
          "Optional — some agencies combine this seat with the CIO seat. Leave blank if not separately staffed.",
      },
      {
        key: "generalCounsel",
        label: "Legal counsel / General Counsel designee",
        placeholder: "e.g. City Attorney's Office, Senior Counsel",
        required: true,
      },
      {
        key: "hrDirector",
        label: "HR representative",
        placeholder: "e.g. HR Director",
        required: true,
      },
      {
        key: "equityOfficer",
        label: "Equity / civil rights officer",
        placeholder: "e.g. Equity Officer, Civil Rights Officer",
        helper:
          "Optional for small agencies. If there is no dedicated equity officer, name the role most often consulted on disparate-impact and civil-rights matters or leave blank and consult externally for Tier-3 uses.",
      },
    ],
  },
  {
    title: "Operational settings",
    intro:
      "Records retention is mandatory; the cadence and quorum default to the recommended values from the model charter.",
    fields: [
      {
        key: "recordsSchedule",
        label: "Records retention schedule reference",
        placeholder: "e.g. City Records Retention Schedule §AI-01",
        required: true,
        helper:
          "The records-schedule entry that governs committee minutes and decision logs. Required for open-records compliance.",
      },
    ],
  },
];

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

function saveState(state: FormState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* localStorage unavailable; fail silently */
  }
}

function isComplete(state: FormState, step: StepDef): boolean {
  return step.fields.every(
    (f) => !f.required || state[f.key].trim().length > 0,
  );
}

function renderCharterMarkdown(s: FormState): string {
  const agency = s.agencyName.trim() || "{{Agency Name}}";
  const effective = s.effectiveDate || "{{Effective Date}}";
  const chair = s.chair.trim() || "{{AI Program Lead}}";
  const approver = s.approvingBody.trim() || "{{Approving Body}}";
  const approval = s.approvalDate || "{{Approval Date}}";
  const officer = s.approvingBodyOfficer.trim() || "{{Approving Body Officer}}";
  const cio = s.cio.trim() || "{{CIO or designee}}";
  const ciso = s.ciso.trim();
  const counsel = s.generalCounsel.trim() || "{{General Counsel or designee}}";
  const hr = s.hrDirector.trim() || "{{HR Director or designee}}";
  const equity = s.equityOfficer.trim();
  const records = s.recordsSchedule.trim() || "{{Agency Records Schedule}}";

  const cisoLine = ciso
    ? `- ${ciso}`
    : "- _CISO or security lead (combined with CIO seat unless separately staffed)_";
  const equityLine = equity
    ? `- Equity / civil rights officer: ${equity}`
    : "- _Equity / civil-rights consultation assigned to legal, HR, or an external advisor for Tier-3 uses_";
  const votingCount = 5 + (ciso ? 1 : 0) + (equity ? 1 : 0);
  const standingQuorum = Math.max(3, Math.ceil(votingCount / 2));
  const tier3Quorum = Math.max(standingQuorum, Math.ceil((2 * votingCount) / 3));
  const equityRequirement = equity
    ? "legal and the equity officer"
    : "legal and documented equity/civil-rights consultation";

  return `# ${agency} AI Review Committee Charter

**Effective:** ${effective}
**Chair:** ${chair}
**Approved by:** ${approver} on ${approval}
**Review Cadence:** Annual

## 1. Purpose

The ${agency} AI Review Committee (the "Committee") is established to govern the responsible adoption of artificial intelligence (AI) systems in the conduct of agency business, consistent with the ${agency} AI Acceptable Use Policy and applicable federal, state, and local law.

## 2. Authority

The Committee derives its authority from ${approver} and is empowered to:

- Approve or deny Tier-2 and Tier-3 AI use cases as defined by the ${agency} Risk Classification Matrix
- Maintain the Approved AI Tools List
- Recommend amendments to the AI Acceptable Use Policy and Risk Classification Matrix
- Review vendor AI offerings prior to contract execution
- Investigate reported violations of AI policy and recommend remedial action

## 3. Composition

The Committee shall consist of the following voting members:

- Chair: ${chair}
- ${cio}
${cisoLine}
- Legal counsel: ${counsel}
- HR representative: ${hr}
${equityLine}
- Rotating program owner: appointed by the Chair on a per-use-case basis

For Tier-3 use cases, the Committee shall include one non-staff community or external subject-matter advisor identified by the Chair.

## 4. Cadence

- Standing meetings: bi-weekly, 60 minutes
- Tier-3 deep-dive: ad-hoc as queued
- Annual policy review: once per fiscal year
- Incident response: within 5 business days of report

Quorum is ${standingQuorum} of ${votingCount} voting members for standing meetings; ${tier3Quorum} of ${votingCount}, including ${equityRequirement}, for Tier-3 deep-dives.

## 5. Decision Rules

- Simple majority of voting members present, given quorum, for Tier-1 and Tier-2 matters
- Two-thirds of voting members present for Tier-3 approvals
- Sponsor recusal on their own use case
- Chair tie-break on Tier-1 and Tier-2; Tier-3 ties default to non-approval
- Legal veto on grounds of statutory non-compliance only, with written rationale

## 6. Recordkeeping

The Committee shall maintain minutes of each meeting, including use cases reviewed, tier classifications, votes, and rationales. Minutes are retained per ${records} and are subject to applicable open-records law.

## 7. Reporting

The Committee shall report annually to ${approver}, summarizing:

- Number and tier of use cases reviewed
- Approvals, denials, and pending matters
- Policy amendments proposed and adopted
- Reported incidents and resolution

## 8. Conflict of Interest

Members with a personal or financial interest in any vendor or use case under review shall disclose the interest and recuse from the relevant vote. Disclosures are recorded in the meeting minutes.

## 9. Amendment

This Charter may be amended by a two-thirds vote of the Committee, with subsequent approval by ${approver}.

---

## Signatures

Chair (${chair}): _____________________________________ Date: ____________

${officer} (${approver}): _____________________________________ Date: ____________
`;
}

export default function CharterWizard() {
  const [state, setState] = useState<FormState>({ ...EMPTY });
  const [step, setStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const totalSteps = STEPS.length;
  const currentStep = STEPS[step];
  const stepComplete = isComplete(state, currentStep);

  const allComplete = useMemo(
    () => STEPS.every((st) => isComplete(state, st)),
    [state],
  );

  const setField = (key: keyof FormState, value: string) =>
    setState((s) => ({ ...s, [key]: value }));

  const goNext = () => {
    if (!stepComplete) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (step < totalSteps - 1) setStep(step + 1);
    else setPreviewOpen(true);
  };

  const goBack = () => {
    setShowErrors(false);
    if (step > 0) setStep(step - 1);
  };

  const reset = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        "Reset all fields? This cannot be undone (state is stored only in your browser).",
      );
      if (!ok) return;
    }
    setState({ ...EMPTY });
    setStep(0);
    setShowErrors(false);
    setPreviewOpen(false);
  };

  const exportMarkdown = () => {
    const md = renderCharterMarkdown(state);
    const date = new Date().toISOString().slice(0, 10);
    const slug =
      (state.agencyName || "agency").replace(/\s+/g, "-").toLowerCase() +
      "-charter-" +
      date;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus(
      "Draft charter downloaded. Next step: confirm membership, cadence, and the approving body.",
    );
  };

  const printPdf = () => {
    const agency = state.agencyName.trim() || "Agency";
    const title = `${agency} AI Review Committee Charter`;
    const meta: { label: string; value: string }[] = [
      { label: "Effective", value: state.effectiveDate || "—" },
      { label: "Chair", value: state.chair.trim() || "—" },
      {
        label: "Approved by",
        value:
          state.approvingBody.trim() && state.approvalDate
            ? `${state.approvingBody.trim()} on ${state.approvalDate}`
            : state.approvingBody.trim() || "—",
      },
      { label: "Review cadence", value: "Annual" },
    ];

    // Strip the markdown title and meta block (already on the cover) and the
    // free-form signature lines (replaced by a structured signature block).
    const md = renderCharterMarkdown(state)
      .replace(/^# .*\n+/, "")
      .replace(
        /(\*\*Effective:\*\*[^\n]*\n)(\*\*Chair:\*\*[^\n]*\n)(\*\*Approved by:\*\*[^\n]*\n)(\*\*Review Cadence:\*\*[^\n]*\n)/,
        "",
      )
      .replace(/\n+## Signatures[\s\S]*$/, "")
      .trim();

    const chair = state.chair.trim() || "Chair";
    const officer = state.approvingBodyOfficer.trim() || "Officer";
    const approvingBody = state.approvingBody.trim() || "Approving Body";

    printDocument({
      title,
      subtitle: agency === "Agency" ? undefined : agency,
      meta,
      blocks: [
        { kind: "markdown", source: md },
        { kind: "rule" },
        { kind: "heading", level: 2, text: "Signatures" },
        {
          kind: "signature",
          lines: [
            { label: `Chair (${chair})` },
            { label: `${officer} (${approvingBody})` },
          ],
        },
      ],
    });
    setStatus("Print view opened. Use the PDF for the committee approval packet.");
  };

  const previewMd = useMemo(() => renderCharterMarkdown(state), [state]);

  return (
    <div class="aqg-wizard">
      <div class="aqg-wizard__steps no-print" aria-label="Wizard progress">
        {STEPS.map((s, i) => {
          const reached = i <= step;
          const done = i < step || (i === step && stepComplete);
          return (
            <button
              type="button"
              key={s.title}
              class={
                "aqg-wizard__step" +
                (i === step ? " is-current" : "") +
                (done ? " is-done" : "") +
                (reached ? "" : " is-locked")
              }
              onClick={() => {
                if (i <= step || isComplete(state, STEPS[i - 1] ?? STEPS[0])) {
                  setShowErrors(false);
                  setStep(i);
                }
              }}
              disabled={i > step && !isComplete(state, STEPS[step])}
            >
              <span class="aqg-wizard__step-num">{i + 1}</span>
              <span class="aqg-wizard__step-label">{s.title}</span>
            </button>
          );
        })}
      </div>

      <div class="aqg-wizard__panel">
        <h3 class="aqg-wizard__title">
          Step {step + 1} of {totalSteps}: {currentStep.title}
        </h3>
        <p class="aqg-wizard__intro">{currentStep.intro}</p>

        <div class="aqg-wizard__fields">
          {currentStep.fields.map((f) => {
            const v = state[f.key];
            const empty = f.required && v.trim().length === 0;
            const showError = showErrors && empty;
            return (
              <label
                key={f.key}
                class={"aqg-wizard__field" + (showError ? " has-error" : "")}
              >
                <span class="aqg-wizard__label">
                  {f.label}
                  {f.required ? <span aria-hidden="true"> *</span> : null}
                </span>
                <input
                  id={`aqg-charter-${f.key}`}
                  name={`aqg-charter-${f.key}`}
                  type={f.type ?? "text"}
                  value={v}
                  placeholder={f.placeholder}
                  onInput={(e) =>
                    setField(f.key, (e.target as HTMLInputElement).value)
                  }
                />
                {f.helper ? (
                  <span class="aqg-wizard__helper">{f.helper}</span>
                ) : null}
                {showError ? (
                  <span class="aqg-wizard__error">This field is required.</span>
                ) : null}
              </label>
            );
          })}
        </div>

        <div class="aqg-wizard__nav no-print">
          <button
            type="button"
            class="aqg-wizard__back"
            onClick={goBack}
            disabled={step === 0}
          >
            Back
          </button>
          <button type="button" class="aqg-wizard__next" onClick={goNext}>
            {step < totalSteps - 1 ? "Next" : "Review draft"}
          </button>
          <button type="button" class="aqg-wizard__reset" onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      {previewOpen ? (
        <div class="aqg-wizard__preview" aria-live="polite">
          <div class="aqg-wizard__preview-head">
            <h3>Draft Charter</h3>
            <p>
              Review the generated charter. Export as markdown to circulate for
              legal review and present to your approving body for adoption.
            </p>
            {!allComplete ? (
              <p class="aqg-wizard__preview-warn">
                Some required fields are still empty. The draft below contains
                placeholder text in <code>{"{{ braces }}"}</code> where data was
                missing.
              </p>
            ) : null}
          </div>
          <pre class="aqg-wizard__preview-body">{previewMd}</pre>
          <div class="aqg-wizard__actions no-print">
            <button type="button" onClick={exportMarkdown}>
              Export as Markdown
            </button>
            <button type="button" onClick={printPdf}>
              Print / Save as PDF
            </button>
            <button
              type="button"
              class="aqg-wizard__reset"
              onClick={() => setPreviewOpen(false)}
            >
              Edit answers
            </button>
          </div>
          {status ? (
            <p class="aqg-wizard__privacy aqg-tool-status no-print" aria-live="polite">
              {status}
            </p>
          ) : null}
        </div>
      ) : null}

      <p class="aqg-wizard__privacy no-print">
        Your answers are saved only in this browser. Nothing is sent to a
        server.
      </p>
    </div>
  );
}

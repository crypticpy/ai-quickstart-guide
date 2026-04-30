/** @jsxImportSource preact */
import { useEffect, useMemo, useState } from "preact/hooks";
import { printDocument } from "../lib/printDocument";

interface FormState {
  agencyName: string;
  aiProgramLead: string;
  ownerOffice: string;
  effectiveDate: string;
  approvingBody: string;
  approvalDate: string;
  onboardingWindow: string;
  applicableStateLaw: string;
  reviewCommitteeName: string;
  entityListRef: string;
  personnelPolicyRef: string;
}

const EMPTY: FormState = {
  agencyName: "",
  aiProgramLead: "",
  ownerOffice: "",
  effectiveDate: "",
  approvingBody: "",
  approvalDate: "",
  onboardingWindow: "30 days",
  applicableStateLaw: "",
  reviewCommitteeName: "AI Review Committee",
  entityListRef:
    "applicable sanctions, entity-list, export-control, grant, or state procurement rules",
  personnelPolicyRef: "",
};

const STORAGE_KEY = "aqg.aup.v1";

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
  type?: "text" | "date" | "textarea";
}

const STEPS: StepDef[] = [
  {
    title: "Agency identity",
    intro:
      "Who is adopting this policy and who owns it day-to-day. These four fields populate the policy header and the owner block.",
    fields: [
      {
        key: "agencyName",
        label: "Agency name",
        placeholder: "e.g. City of Springfield",
        required: true,
      },
      {
        key: "aiProgramLead",
        label: "AI Program Lead (named role or person)",
        placeholder: "e.g. Director of Innovation & Technology",
        required: true,
      },
      {
        key: "ownerOffice",
        label: "Office / Department of the AI Program Lead",
        placeholder: "e.g. Office of the CIO",
        required: true,
      },
      {
        key: "effectiveDate",
        label: "Effective date",
        type: "date",
        required: true,
        helper:
          "The date the policy takes effect. Usually the day after approval.",
      },
    ],
  },
  {
    title: "Approval",
    intro:
      "The body that adopts the policy and the date of adoption. For most agencies this is the city council, board of commissioners, or equivalent governing body.",
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
    ],
  },
  {
    title: "Scope & applicable law",
    intro:
      "Onboarding window controls how quickly new staff must complete AI Foundations training. The applicable-law field cites the controlling state AI statute(s) for your jurisdiction.",
    fields: [
      {
        key: "onboardingWindow",
        label: "Onboarding window for AI Foundations training",
        placeholder: "30 days",
        helper: "Default: 30 days. Some agencies use 60 or 90.",
      },
      {
        key: "applicableStateLaw",
        label: "Applicable state AI law(s)",
        type: "textarea",
        placeholder:
          "e.g. Texas TRAIGA (HB 149); Texas Public Information Act, Tex. Gov't Code §552",
        helper:
          "Cite the controlling state AI statute(s) for your jurisdiction. Use the Legislative Compliance Matrix to identify what applies.",
      },
    ],
  },
  {
    title: "Enforcement & references",
    intro:
      "These references appear in the enforcement section and the excluded-vendor clause. Defaults are provided; edit only if you have a more specific reference.",
    fields: [
      {
        key: "reviewCommitteeName",
        label: "AI Review Committee name",
        placeholder: "AI Review Committee",
        helper:
          "Default name. Some agencies prefer 'AI Governance Council' or include the agency name (e.g. 'Springfield AI Review Committee').",
      },
      {
        key: "entityListRef",
        label: "Sanctions / entity-list / procurement reference",
        placeholder:
          "applicable sanctions, entity-list, export-control, grant, or state procurement rules",
        helper:
          "Cite the source your excluded-vendor or excluded-jurisdiction clause will check against.",
      },
      {
        key: "personnelPolicyRef",
        label: "Agency personnel policy reference",
        placeholder: "e.g. City Personnel Manual, Article VII",
        helper:
          "The personnel manual / handbook section that governs disciplinary action. Used in Section 10 (Enforcement).",
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

function renderAUPMarkdown(s: FormState): string {
  const agency = s.agencyName.trim() || "{{Agency Name}}";
  const lead = s.aiProgramLead.trim() || "{{AI Program Lead}}";
  const office = s.ownerOffice.trim() || "{{Office / Department}}";
  const effective = s.effectiveDate || "{{Effective Date}}";
  const approver = s.approvingBody.trim() || "{{Approving Body}}";
  const approval = s.approvalDate || "{{Approval Date}}";
  const onboarding = s.onboardingWindow.trim() || "30 days";
  const stateLaw = s.applicableStateLaw.trim() || "applicable state AI law";
  const committee = s.reviewCommitteeName.trim() || "AI Review Committee";
  const entityList =
    s.entityListRef.trim() ||
    "applicable sanctions, entity-list, export-control, grant, or state procurement rules";
  const personnel = s.personnelPolicyRef.trim() || "agency personnel policy";

  return `# ${agency} Acceptable Use Policy for Artificial Intelligence

**Effective:** ${effective}
**Owner:** ${lead}, ${office}
**Approved by:** ${approver} on ${approval}
**Review Cadence:** Annual, or upon material change to applicable law

## 1. Purpose

This policy establishes the rules under which ${agency} staff, contractors, and authorized agents may evaluate, deploy, and use artificial intelligence (AI) systems in the conduct of agency business. It exists to enable responsible adoption of AI while protecting residents' rights, safeguarding agency data, and ensuring compliance with applicable federal, state, and local law.

## 2. Scope

This policy applies to:

- All ${agency} employees, including elected officials and appointed leadership
- All contractors, consultants, and vendors performing work for ${agency}
- All volunteers and interns with access to agency systems or non-public data
- Any AI system used for agency business, regardless of whether it is hosted by ${agency}, a vendor, or a third-party platform

## 3. Definitions

- **AI system** — any software that uses machine learning, large language models, generative models, or similar techniques to produce outputs (text, classifications, predictions, recommendations, decisions, images, code) from inputs.
- **Agency data** — any data created, received, maintained, or transmitted by ${agency} in the conduct of agency business, whether or not classified as a public record.
- **Sensitive data** — personally identifiable information (PII), protected health information (PHI), criminal-justice information (CJI), financial account information, immigration status, child-welfare records, attorney-client communications, and any data classified as confidential or restricted under federal, state, or agency policy.
- **Risk tier** — the Low / Medium / High classification assigned to a use case under the agency's Risk Classification Matrix.

## 4. General Principles

All staff using AI on behalf of the agency must:

1. **Verify outputs** before relying on them. AI systems produce errors and fabrications ("hallucinations"). The human user is accountable for the output, not the model.
2. **Disclose AI use** when an output materially shapes a public-facing communication, a decision affecting a person, or work product attributed to a staff member.
3. **Protect agency data** by using only AI tools approved for the relevant data sensitivity (see Section 6).
4. **Classify use cases** by risk tier before deployment and re-classify when scope changes.
5. **Comply with applicable law**, including ${stateLaw}, the applicable open-records statute, and federal AI requirements where they apply.

## 5. Risk Classification and Review

AI use cases are reviewed according to the agency's Risk Classification Matrix:

- **Tier 1 (Low)** — internal productivity or reference use with non-sensitive data and reversible consequences. Manager approval and inventory notation are usually sufficient.
- **Tier 2 (Medium)** — staff-facing decision support, limited public-facing use, or internal sensitive data. Review Committee approval is required before deployment.
- **Tier 3 (High)** — use cases that materially affect rights, benefits, employment, safety, liberty, housing, health, education, enforcement, or similar protected domains. Review Committee approval, counsel review, impact assessment, public notice where required, and a contestation or appeal pathway are required before deployment.

The ${committee} may escalate a use case to a higher tier based on local law, data sensitivity, public impact, or operational risk.

## 6. Tool Approval

The ${committee} maintains the Approved AI Tools List, classified by data sensitivity and risk tier. Staff may use:

- **Tier-1 (Low) tools** — for non-sensitive, internal productivity tasks. Public consumer AI services may be permitted in this tier with explicit guardrails on what may be entered.
- **Tier-2 (Medium) tools** — only with internal sensitive data, on agency-approved tenants with data non-use clauses in place. Staff must complete the AI Foundations training before use.
- **Tier-3 (High) tools** — only after a use case has been approved by the ${committee}, with all required impact assessments and disclosures in place.

**Prohibited unless explicitly approved:**

- Entering PII, PHI, CJI, or other sensitive data into any AI tool not on the Approved Tools List for that data class
- Deploying AI from vendors, sub-processors, models, or jurisdictions barred by ${entityList}
- Using AI to make a final, uncontested determination affecting a person's rights, benefits, employment, or liberty
- Bypassing the use-case intake and tier-classification process
- Sharing agency credentials with any AI service for the purpose of automating account access

## 7. Disclosure

Staff must disclose AI involvement when:

- An AI system materially shaped a recommendation, decision, or rationale provided to the public, a council, a court, or a regulator
- A public-facing communication (web content, press release, formal correspondence) was substantially generated by AI
- A high-tier (Tier-3) use case is deployed in production — with public notice in plain language as required by the use case's impact assessment

Disclosure formats are maintained by the ${committee} and updated as state law evolves.

## 8. Procurement and Contracts

Contracts under which a vendor will provide AI services to ${agency} should include the AI Procurement Addendum or a counsel-approved equivalent. Staff may not enter into AI service agreements — including no-cost trials and click-through terms — without procurement and legal review for any tool that will touch agency or sensitive data.

## 9. Training

All staff must complete AI Foundations training within ${onboarding} of hire and complete an annual refresher. Staff using Tier-2 or Tier-3 tools must complete additional role-specific training before access is granted.

## 10. Enforcement

Violations of this policy will be reviewed by the ${committee} in coordination with HR and, where applicable, legal. Consequences may include retraining, suspension of AI tool access, and disciplinary action consistent with ${personnel}.

Knowing or repeated entry of sensitive data into unapproved AI tools is grounds for immediate suspension of tool access pending review.

## 11. Reporting Concerns

Staff who observe a use of AI that may violate this policy, applicable law, or the rights of a member of the public should report the concern to the ${lead} or via the agency's existing whistleblower / ethics reporting channel. Retaliation is prohibited.

## 12. Review and Amendment

This policy is reviewed annually by the ${committee} and updated when:

- Applicable federal or state law materially changes
- A new tier of risk is identified that the existing matrix cannot classify
- Patterns of policy violation reveal a structural gap

Amendments are subject to approval by the ${approver}.

---

## Signature

I, _______________________________________, acknowledge that I have read and understood this policy, and I agree to comply with it in all use of AI on behalf of ${agency}.

Signed: ___________________________________
Date: ___________________________________
`;
}

export default function AUPWizard() {
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
    const md = renderAUPMarkdown(state);
    const date = new Date().toISOString().slice(0, 10);
    const slug =
      (state.agencyName || "agency").replace(/\s+/g, "-").toLowerCase() +
      "-aup-" +
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
      "Draft AUP downloaded. Next step: route it for counsel and policy-owner review before adoption.",
    );
  };

  const printPdf = () => {
    const agency = state.agencyName.trim() || "Agency";
    const title = `${agency} Acceptable Use Policy for Artificial Intelligence`;
    const meta: { label: string; value: string }[] = [
      { label: "Effective", value: state.effectiveDate || "—" },
      {
        label: "Owner",
        value:
          [state.aiProgramLead, state.ownerOffice]
            .map((s) => s.trim())
            .filter(Boolean)
            .join(", ") || "—",
      },
      {
        label: "Approved by",
        value:
          state.approvingBody.trim() && state.approvalDate
            ? `${state.approvingBody.trim()} on ${state.approvalDate}`
            : state.approvingBody.trim() || "—",
      },
      {
        label: "Review cadence",
        value: "Annual, or upon material change to applicable law",
      },
    ];

    // The cover page already shows agency + meta, so strip those from the
    // body markdown to avoid repeating them. We also drop the markdown title
    // and signature block (the latter becomes a structured signature block).
    const md = renderAUPMarkdown(state)
      .replace(/^# .*\n+/, "")
      .replace(
        /(\*\*Effective:\*\*[^\n]*\n)(\*\*Owner:\*\*[^\n]*\n)(\*\*Approved by:\*\*[^\n]*\n)(\*\*Review Cadence:\*\*[^\n]*\n)/,
        "",
      )
      .replace(/\n+## Signature[\s\S]*$/, "")
      .trim();

    printDocument({
      title,
      subtitle: agency === "Agency" ? undefined : agency,
      meta,
      blocks: [
        { kind: "markdown", source: md },
        { kind: "rule" },
        { kind: "heading", level: 2, text: "Signature" },
        {
          kind: "paragraph",
          text: `I acknowledge that I have read and understood this policy, and I agree to comply with it in all use of AI on behalf of ${agency}.`,
        },
        {
          kind: "signature",
          lines: [{ label: "Signed" }, { label: "Printed name" }],
        },
      ],
    });
    setStatus("Print view opened. Use the PDF for review packets or signature routing.");
  };

  const previewMd = useMemo(() => renderAUPMarkdown(state), [state]);

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
                {f.type === "textarea" ? (
                  <textarea
                    id={`aqg-aup-${f.key}`}
                    name={`aqg-aup-${f.key}`}
                    rows={3}
                    value={v}
                    placeholder={f.placeholder}
                    onInput={(e) =>
                      setField(f.key, (e.target as HTMLTextAreaElement).value)
                    }
                  />
                ) : (
                  <input
                    id={`aqg-aup-${f.key}`}
                    name={`aqg-aup-${f.key}`}
                    type={f.type ?? "text"}
                    value={v}
                    placeholder={f.placeholder}
                    onInput={(e) =>
                      setField(f.key, (e.target as HTMLInputElement).value)
                    }
                  />
                )}
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
            <h3>Draft AUP</h3>
            <p>
              Review the generated policy. Export as markdown to circulate for
              legal review and adoption.
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

/** @jsxImportSource preact */
import { useEffect, useMemo, useState } from "preact/hooks";
import { printDocument, type Block } from "../lib/printDocument";

type Domain =
  | "governance"
  | "education"
  | "infrastructure"
  | "devstack"
  | "platform"
  | "usecases";

interface Question {
  id: string;
  domain: Domain;
  prompt: string;
  options: { label: string; score: number }[];
}

const DOMAIN_LABEL: Record<Domain, string> = {
  governance: "Governance & Policy",
  education: "Culture & Education",
  infrastructure: "Infrastructure & Security",
  devstack: "Dev Stack & Practices",
  platform: "Modular Platform",
  usecases: "Use Cases & Sponsorship",
};

const QUESTIONS: Question[] = [
  {
    id: "g1",
    domain: "governance",
    prompt: "Does your agency have a written AI Acceptable Use Policy?",
    options: [
      { label: "No, and no plan to write one", score: 0 },
      { label: "No, but it is on the roadmap", score: 1 },
      { label: "Drafted but not yet adopted", score: 2 },
      { label: "Adopted, signed, and circulated", score: 3 },
    ],
  },
  {
    id: "g2",
    domain: "governance",
    prompt: "Is there a process to classify AI use cases by risk?",
    options: [
      { label: "No process exists", score: 0 },
      { label: "Informal — case-by-case", score: 1 },
      { label: "Documented matrix; not consistently used", score: 2 },
      { label: "Documented and routinely applied", score: 3 },
    ],
  },
  {
    id: "e1",
    domain: "education",
    prompt: "What share of staff have had any AI literacy training?",
    options: [
      { label: "None / no training offered", score: 0 },
      { label: "A few volunteers", score: 1 },
      { label: "Most of IT and some leadership", score: 2 },
      { label: "All staff, with regular refreshers", score: 3 },
    ],
  },
  {
    id: "e2",
    domain: "education",
    prompt:
      "Is there a way for non-technical staff to submit AI use case ideas?",
    options: [
      { label: "No intake mechanism", score: 0 },
      { label: "Informal — email IT", score: 1 },
      { label: "A form exists; no defined triage", score: 2 },
      { label: "Form + committee triage on a published cadence", score: 3 },
    ],
  },
  {
    id: "i1",
    domain: "infrastructure",
    prompt: "Do developers have a sandbox environment for AI experimentation?",
    options: [
      { label: "No — production or nothing", score: 0 },
      { label: "Personal accounts only", score: 1 },
      { label: "Shared sandbox; no SSO", score: 2 },
      { label: "Provisioned sandbox with SSO and CI/CD", score: 3 },
    ],
  },
  {
    id: "i2",
    domain: "infrastructure",
    prompt: "How is access to systems managed?",
    options: [
      { label: "Local accounts per system", score: 0 },
      { label: "Some SSO coverage", score: 1 },
      { label: "SSO across most systems", score: 2 },
      { label: "SSO + RBAC + service principals", score: 3 },
    ],
  },
  {
    id: "d1",
    domain: "devstack",
    prompt: "Is there a documented coding standard the team actually follows?",
    options: [
      { label: "No documented standard", score: 0 },
      { label: "Documented but inconsistently applied", score: 1 },
      { label: "Documented + linting in CI", score: 2 },
      { label: "Documented, enforced in CI, reviewed quarterly", score: 3 },
    ],
  },
  {
    id: "d2",
    domain: "devstack",
    prompt: "How is AI-assisted coding handled today?",
    options: [
      { label: "Forbidden or unaddressed", score: 0 },
      { label: "Allowed informally; no guardrails", score: 1 },
      { label: "Allowed with documented guardrails", score: 2 },
      { label: "Guardrails + audit trail + PR review requirements", score: 3 },
    ],
  },
  {
    id: "p1",
    domain: "platform",
    prompt: "How much code is reused between internal applications?",
    options: [
      { label: "Zero — every app is bespoke", score: 0 },
      { label: "Some shared utilities", score: 1 },
      { label: "A handful of shared modules", score: 2 },
      { label: "A maintained module catalog with versioning", score: 3 },
    ],
  },
  {
    id: "p2",
    domain: "platform",
    prompt: "Is there an API-first design practice?",
    options: [
      { label: "No API standards", score: 0 },
      { label: "APIs exist but no specs", score: 1 },
      { label: "OpenAPI specs for new services", score: 2 },
      { label: "Specs first + contract testing + API registry", score: 3 },
    ],
  },
  {
    id: "u1",
    domain: "usecases",
    prompt: "Is there an executive sponsor for AI work?",
    options: [
      { label: "No identified sponsor", score: 0 },
      { label: "Verbal interest from leadership", score: 1 },
      { label: "Named sponsor; no allocated budget", score: 2 },
      { label: "Named sponsor with budget authority", score: 3 },
    ],
  },
  {
    id: "u2",
    domain: "usecases",
    prompt: "How many candidate AI use cases has the agency identified?",
    options: [
      { label: "None / unsure", score: 0 },
      { label: "1–2 informal ideas", score: 1 },
      { label: "3–5 documented candidates", score: 2 },
      { label: "6+ scored, ranked, and triaged", score: 3 },
    ],
  },
];

const STORAGE_KEY = "aqg.readiness.v1";

interface SavedState {
  answers: Record<string, number>;
  agencyName: string;
}

const MATURITY_THRESHOLDS = [
  {
    min: 0,
    level: 1,
    name: "Crawl",
    summary:
      "Discovery — start with governance basics and AI literacy training.",
  },
  {
    min: 12,
    level: 2,
    name: "Walk",
    summary: "Foundation — sandbox and review committee come next.",
  },
  {
    min: 24,
    level: 3,
    name: "Run",
    summary: "Production — modular platform and first AI app are within reach.",
  },
  {
    min: 30,
    level: 4,
    name: "Fly",
    summary:
      "Scale — focus shifts to inner-source contributions and second-generation modules.",
  },
];

function levelFor(total: number) {
  return (
    [...MATURITY_THRESHOLDS].reverse().find((t) => total >= t.min) ??
    MATURITY_THRESHOLDS[0]
  );
}

function nextStepsForLevel(level: number): string[] {
  switch (level) {
    case 1:
      return [
        "Stand up Phase 1 governance: adopt the AI Acceptable Use Policy and risk classification matrix.",
        "Begin AI Foundations training for all staff (Phase 2, Track 1).",
        "Identify an executive sponsor and a named AI Program Lead.",
        "Inventory candidate AI use cases and route them through a simple intake.",
      ];
    case 2:
      return [
        "Charter the AI Review Committee and run its first standing meetings.",
        "Provision a developer sandbox with SSO and CI/CD (Phase 3).",
        "Select the agency dev stack and document the coding standard (Phase 4).",
        "Run two or three Tier-1 use cases end-to-end through the intake-to-deploy pipeline.",
      ];
    case 3:
      return [
        "Begin building the modular platform: auth, RBAC, API framework, AI orchestration (Phase 5).",
        "Pick the first starter project archetype and start the selection memo (Phase 6).",
        "Tighten observability and cost dashboards before the first production launch.",
        "Run a tabletop incident-response exercise.",
      ];
    case 4:
      return [
        "Open the platform to inner-source contributions; publish module scorecards.",
        "Pick the second starter project; rotate sponsorship to a different department.",
        "Track adoption and impact metrics; feed lessons learned into the platform roadmap.",
        "Mentor adjacent agencies — your maturity is now a regional asset.",
      ];
    default:
      return [];
  }
}

function loadState(): SavedState {
  if (typeof window === "undefined") return { answers: {}, agencyName: "" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { answers: {}, agencyName: "" };
    return JSON.parse(raw) as SavedState;
  } catch {
    return { answers: {}, agencyName: "" };
  }
}

function saveState(state: SavedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* localStorage unavailable; fail silently */
  }
}

export default function ReadinessAssessment() {
  const [agencyName, setAgencyName] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    const s = loadState();
    setAgencyName(s.agencyName);
    setAnswers(s.answers);
  }, []);

  useEffect(() => {
    saveState({ answers, agencyName });
  }, [answers, agencyName]);

  const answered = Object.keys(answers).length;
  const total = useMemo(
    () => Object.values(answers).reduce((sum, v) => sum + v, 0),
    [answers],
  );
  const maxScore = QUESTIONS.length * 3;
  const level = levelFor(total);

  const byDomain = useMemo(() => {
    const out: Record<Domain, { total: number; max: number }> = {
      governance: { total: 0, max: 0 },
      education: { total: 0, max: 0 },
      infrastructure: { total: 0, max: 0 },
      devstack: { total: 0, max: 0 },
      platform: { total: 0, max: 0 },
      usecases: { total: 0, max: 0 },
    };
    for (const q of QUESTIONS) {
      out[q.domain].max += 3;
      const v = answers[q.id];
      if (typeof v === "number") out[q.domain].total += v;
    }
    return out;
  }, [answers]);

  const setAnswer = (id: string, score: number) =>
    setAnswers((a) => ({ ...a, [id]: score }));

  const reset = () => {
    setAnswers({});
    setAgencyName("");
  };

  const exportMarkdown = () => {
    const date = new Date().toISOString().slice(0, 10);
    const lines: string[] = [];
    lines.push(`# AI Readiness Assessment — ${agencyName || "Unnamed agency"}`);
    lines.push("");
    lines.push(`*Completed: ${date}*`);
    lines.push("");
    lines.push(
      `## Overall score: ${total} / ${maxScore} — Level ${level.level} (${level.name})`,
    );
    lines.push("");
    lines.push(`> ${level.summary}`);
    lines.push("");
    lines.push("## By domain");
    lines.push("");
    lines.push("| Domain | Score |");
    lines.push("|---|---|");
    (Object.keys(DOMAIN_LABEL) as Domain[]).forEach((d) => {
      const { total: t, max } = byDomain[d];
      lines.push(`| ${DOMAIN_LABEL[d]} | ${t} / ${max} |`);
    });
    lines.push("");
    lines.push("## Answers");
    lines.push("");
    for (const q of QUESTIONS) {
      const v = answers[q.id];
      const choice =
        typeof v === "number"
          ? q.options.find((o) => o.score === v)?.label
          : "Not answered";
      lines.push(
        `- **${q.prompt}** — ${choice ?? "Not answered"}${typeof v === "number" ? ` *(${v}/3)*` : ""}`,
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `readiness-${(agencyName || "agency").replace(/\s+/g, "-").toLowerCase()}-${date}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printPdf = () => {
    const agency = agencyName.trim() || "Agency";
    const title = "AI Readiness Assessment";

    const meta: { label: string; value: string }[] = [
      { label: "Agency", value: agency },
      { label: "Score", value: `${total} of ${maxScore}` },
      {
        label: "Maturity level",
        value: `Level ${level.level} — ${level.name}`,
      },
      {
        label: "Questions answered",
        value: `${answered} of ${QUESTIONS.length}`,
      },
    ];

    const domainRows = (Object.keys(DOMAIN_LABEL) as Domain[]).map((d) => [
      DOMAIN_LABEL[d],
      `${byDomain[d].total} / ${byDomain[d].max}`,
    ]);

    const answersByDomain = (Object.keys(DOMAIN_LABEL) as Domain[])
      .map((d) => {
        const qs = QUESTIONS.filter((q) => q.domain === d);
        const items = qs.map((q) => {
          const v = answers[q.id];
          const choice =
            typeof v === "number"
              ? (q.options.find((o) => o.score === v)?.label ?? "Not answered")
              : "Not answered";
          const score = typeof v === "number" ? ` (${v}/3)` : "";
          return `**${q.prompt}** — ${choice}${score}`;
        });
        return { label: DOMAIN_LABEL[d], items };
      })
      .filter((d) => d.items.length > 0);

    const blocks: Block[] = [
      { kind: "heading", level: 2, text: "Summary" },
      {
        kind: "lead",
        text: `${agency} scored ${total} of ${maxScore} across ${QUESTIONS.length} readiness questions, placing the agency at Level ${level.level} (${level.name}).`,
      },
      { kind: "paragraph", text: level.summary },
      { kind: "heading", level: 2, text: "Score by domain" },
      {
        kind: "table",
        headers: ["Domain", "Score"],
        rows: domainRows,
      },
      { kind: "heading", level: 2, text: "Recommended next steps" },
      {
        kind: "list",
        items: nextStepsForLevel(level.level),
      },
      { kind: "heading", level: 2, text: "Detailed responses" },
    ];

    for (const dom of answersByDomain) {
      blocks.push({ kind: "heading", level: 3, text: dom.label });
      blocks.push({ kind: "list", items: dom.items });
    }

    blocks.push({ kind: "rule" });
    blocks.push({
      kind: "callout",
      tone: "info",
      title: "How to read this report",
      text: "Scores are self-reported snapshots. Re-run the assessment quarterly during build phases and annually after launch to track progress. The maturity levels (Crawl / Walk / Run / Fly) align with the six phases of the AI Quickstart Guide.",
    });

    printDocument({
      title,
      subtitle: agency,
      meta,
      blocks,
    });
  };

  return (
    <div class="aqg-readiness">
      <div class="aqg-readiness__header">
        <label>
          <span>Agency name (optional)</span>
          <input
            type="text"
            value={agencyName}
            onInput={(e) => setAgencyName((e.target as HTMLInputElement).value)}
            placeholder="e.g. City of Springfield IT"
          />
        </label>
        <div class="aqg-readiness__progress">
          <strong>{answered}</strong> / {QUESTIONS.length} answered
        </div>
      </div>

      <ol class="aqg-readiness__list">
        {QUESTIONS.map((q) => (
          <li key={q.id} class="aqg-readiness__q">
            <div class="aqg-readiness__domain">{DOMAIN_LABEL[q.domain]}</div>
            <div class="aqg-readiness__prompt">{q.prompt}</div>
            <div class="aqg-readiness__options">
              {q.options.map((o) => (
                <label key={o.score}>
                  <input
                    type="radio"
                    name={q.id}
                    value={o.score}
                    checked={answers[q.id] === o.score}
                    onChange={() => setAnswer(q.id, o.score)}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <div class="aqg-readiness__result" aria-live="polite">
        <h3>Score</h3>
        <p>
          <strong>
            {total} / {maxScore}
          </strong>{" "}
          — Level {level.level} ({level.name})
        </p>
        <p>{level.summary}</p>
        <table>
          <thead>
            <tr>
              <th>Domain</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(DOMAIN_LABEL) as Domain[]).map((d) => (
              <tr key={d}>
                <td>{DOMAIN_LABEL[d]}</td>
                <td>
                  {byDomain[d].total} / {byDomain[d].max}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div class="aqg-readiness__actions no-print">
        <button type="button" onClick={exportMarkdown}>
          Export as Markdown
        </button>
        <button type="button" onClick={printPdf}>
          Print / Save as PDF
        </button>
        <button type="button" onClick={reset} class="aqg-readiness__reset">
          Reset
        </button>
      </div>

      <p class="aqg-readiness__privacy no-print">
        Your answers are saved only in this browser. Nothing is sent to a
        server.
      </p>
    </div>
  );
}

/** @jsxImportSource preact */
import { useEffect, useMemo, useState } from "preact/hooks";
import {
  type AgencySize,
  onAgencySizeChange,
  readAgencySize,
} from "../lib/agencySize";

const NEXT_30: Record<AgencySize, string[]> = {
  Small: [
    "Book a 2-day governance sprint with counsel.",
    "Run the readiness assessment with the closest technical owner, legal, and one department sponsor.",
    "Adopt the AUP and risk-tier matrix with minimal edits.",
    "Schedule Track 1 for all staff in small cohorts.",
    "Name 4-6 champions and one manager sponsor.",
    "Create the intake mailbox or SharePoint folder.",
    "Create one starter repo template with format, test, and secret-scan commands.",
    "Pick one approved AI SaaS or managed AI service to evaluate with synthetic data.",
  ],
  Standard: [
    "Convene the Review Committee or review group and confirm membership.",
    "Run readiness assessment and baseline maturity scoring.",
    "Start Track 1, Track 2, Track 3, and Track 7 planning.",
    "Draft AUP, risk tiers, and procurement addendum.",
    "Open the intake form and seed 10 candidate use cases.",
    "Start a cloud sandbox or approved SaaS sandbox request with security review.",
    "Confirm the primary dev stack and starter repo template.",
    "Set milestone reporting cadence for the executive sponsor.",
  ],
  Large: [
    "Name policy, procurement, infrastructure, and training workstream leads.",
    "Confirm executive sponsor and architecture council cadence.",
    "Run readiness assessment by department or business unit.",
    "Launch committee sub-groups for policy and procurement.",
    "Plan parallel Track 1, Track 2, Track 3, and Track 7 cohorts.",
    "Start multi-environment sandbox and production-hardening design.",
    "Select 2-3 candidate starter archetypes for discovery.",
  ],
};

export default function AgencySetupWizard() {
  const [size, setSize] = useState<AgencySize>("Standard");
  const [state, setState] = useState("");
  const [cloud, setCloud] = useState("Existing primary cloud");
  const [idp, setIdp] = useState("Existing SSO / identity provider");
  const [archetype, setArchetype] = useState("RAG Chatbot");

  useEffect(() => {
    setSize(readAgencySize() ?? "Standard");
    return onAgencySizeChange((next) => setSize(next ?? "Standard"));
  }, []);

  const checklist = useMemo(() => {
    return [
      `Path: ${size}`,
      `Jurisdiction to localize first: ${state || "your state / locality"}`,
      `Cloud assumption: ${cloud}`,
      `Identity assumption: ${idp}`,
      `Starter-project bias: ${archetype}`,
      ...NEXT_30[size],
    ];
  }, [archetype, cloud, idp, size, state]);

  return (
    <section class="aqg-tier">
      <div class="aqg-tier__result">
        <h3>Your next 30 days</h3>
        <ol>
          {NEXT_30[size].map((action) => (
            <li>{action}</li>
          ))}
        </ol>
      </div>

      <h3>Agency setup wizard</h3>
      <div class="aqg-tier__grid">
        <label>
          State or local jurisdiction
          <input
            type="text"
            value={state}
            placeholder="e.g. Texas, Colorado, California"
            onInput={(e) => setState(e.currentTarget.value)}
          />
        </label>
        <label>
          Cloud
          <select
            value={cloud}
            onInput={(e) => setCloud(e.currentTarget.value)}
          >
            <option>Existing primary cloud</option>
            <option>Azure</option>
            <option>AWS</option>
            <option>Google Cloud</option>
            <option>No cloud selected yet</option>
          </select>
        </label>
        <label>
          Identity provider
          <select value={idp} onInput={(e) => setIdp(e.currentTarget.value)}>
            <option>Existing SSO / identity provider</option>
            <option>Microsoft Entra ID</option>
            <option>Okta</option>
            <option>Google Workspace</option>
            <option>No SSO yet</option>
          </select>
        </label>
        <label>
          Preferred starter archetype
          <select
            value={archetype}
            onInput={(e) => setArchetype(e.currentTarget.value)}
          >
            <option>RAG Chatbot</option>
            <option>Meeting Transcriber</option>
            <option>Document Intelligence</option>
            <option>Workflow Automation</option>
            <option>NL Data Dashboard</option>
          </select>
        </label>
      </div>
      <div class="aqg-tier__pending">
        <strong>Tailored checklist:</strong>
        <ul>
          {checklist.map((item) => (
            <li>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

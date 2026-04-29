/** @jsxImportSource preact */
import { useMemo, useState } from "preact/hooks";

interface Row {
  jurisdiction: string;
  law: string;
  status: string;
  requirement: string;
  artifact: string;
  owner: string;
  reviewed: string;
  next: string;
}

const ROWS: Row[] = [
  {
    jurisdiction: "Federal",
    law: "OMB M-24-10",
    status: "In force",
    requirement: "AI official, use-case inventory, impact assessment for rights/safety AI",
    artifact: "Risk classification; use-case inventory",
    owner: "AI governance lead",
    reviewed: "2026-04-29",
    next: "2026-07-29",
  },
  {
    jurisdiction: "Federal",
    law: "OMB M-25-22",
    status: "In force",
    requirement: "AI procurement clauses, vendor disclosure, decision logs",
    artifact: "Procurement guardrails",
    owner: "Procurement counsel",
    reviewed: "2026-04-29",
    next: "2026-07-29",
  },
  {
    jurisdiction: "California",
    law: "SB 942 / AB 2013",
    status: "Phased",
    requirement: "AI-content disclosure and training-data transparency",
    artifact: "AUP; vendor questionnaire",
    owner: "Legal",
    reviewed: "2026-04-29",
    next: "2026-07-29",
  },
  {
    jurisdiction: "Colorado",
    law: "SB24-205",
    status: "Effective 2026",
    requirement: "Risk program, impact assessments, notice, appeal path",
    artifact: "Risk classification; review committee",
    owner: "Legal",
    reviewed: "2026-04-29",
    next: "2026-07-29",
  },
  {
    jurisdiction: "Texas",
    law: "TRAIGA HB 149",
    status: "Effective 2026",
    requirement: "Consumer AI disclosure and prohibited-use controls",
    artifact: "AUP; risk classification",
    owner: "Policy lead",
    reviewed: "2026-04-29",
    next: "2026-07-29",
  },
  {
    jurisdiction: "Illinois / NYC",
    law: "AI employment rules",
    status: "In force",
    requirement: "Candidate notice, AEDT bias audit, published results where required",
    artifact: "Procurement guardrails; Tier-3 controls",
    owner: "HR + legal",
    reviewed: "2026-04-29",
    next: "2026-07-29",
  },
  {
    jurisdiction: "Maryland / Connecticut / Washington",
    law: "State agency AI inventory laws",
    status: "In force",
    requirement: "Agency inventory, risk assessment, legislative reporting",
    artifact: "Use-case inventory",
    owner: "Review committee chair",
    reviewed: "2026-04-29",
    next: "2026-07-29",
  },
  {
    jurisdiction: "Local",
    law: "CCOPS / surveillance ordinances",
    status: "Varies",
    requirement: "Council approval and public-impact report for surveillance technology",
    artifact: "Risk classification; public notice",
    owner: "City attorney",
    reviewed: "2026-04-29",
    next: "Quarterly",
  },
];

export default function ComplianceMatrix() {
  const [query, setQuery] = useState("");
  const [jurisdiction, setJurisdiction] = useState("All");
  const jurisdictions = ["All", ...Array.from(new Set(ROWS.map((r) => r.jurisdiction)))];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROWS.filter((row) => {
      const matchesJurisdiction =
        jurisdiction === "All" || row.jurisdiction === jurisdiction;
      const matchesQuery =
        !q ||
        Object.values(row).some((value) => value.toLowerCase().includes(q));
      return matchesJurisdiction && matchesQuery;
    });
  }, [jurisdiction, query]);

  return (
    <section class="aqg-tier">
      <div class="aqg-tier__field">
        <label for="compliance-jurisdiction">Jurisdiction</label>
        <select
          id="compliance-jurisdiction"
          value={jurisdiction}
          onInput={(e) => setJurisdiction(e.currentTarget.value)}
        >
          {jurisdictions.map((j) => (
            <option value={j}>{j}</option>
          ))}
        </select>
      </div>
      <div class="aqg-tier__field">
        <label for="compliance-search">Search requirements</label>
        <input
          id="compliance-search"
          type="text"
          value={query}
          placeholder="e.g. inventory, notice, procurement"
          onInput={(e) => setQuery(e.currentTarget.value)}
        />
      </div>
      <div class="aqg-tier__result">
        <p>
          Showing <strong>{rows.length}</strong> compliance row
          {rows.length === 1 ? "" : "s"}. Verify current law with counsel before
          deployment.
        </p>
      </div>
      <div class="sl-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Jurisdiction</th>
              <th>Law</th>
              <th>Status</th>
              <th>Requirement</th>
              <th>Artifact</th>
              <th>Owner</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr>
                <td>{row.jurisdiction}</td>
                <td>{row.law}</td>
                <td>{row.status}</td>
                <td>{row.requirement}</td>
                <td>{row.artifact}</td>
                <td>{row.owner}</td>
                <td>
                  Last: {row.reviewed}
                  <br />
                  Next: {row.next}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

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
    law: "OMB M-25-21",
    status: "Federal in force",
    requirement:
      "Federal CAIO, AI strategy, use-case inventory, high-impact AI practices; state/local only if incorporated",
    artifact: "Risk classification; use-case inventory",
    owner: "AI governance lead",
    reviewed: "2026-04-30",
    next: "2026-07-30",
  },
  {
    jurisdiction: "Federal",
    law: "OMB M-25-22",
    status: "Federal in force",
    requirement:
      "Federal AI acquisition planning, privacy/IP/data rights, lock-in reduction, testing and monitoring",
    artifact: "Procurement guardrails",
    owner: "Procurement counsel",
    reviewed: "2026-04-30",
    next: "2026-07-30",
  },
  {
    jurisdiction: "Federal",
    law: "EO 14319 / OMB M-26-04",
    status: "Federal LLM guidance",
    requirement:
      "Truth-seeking and ideological-neutrality expectations for federal LLM procurements",
    artifact: "Procurement guardrails",
    owner: "Procurement counsel",
    reviewed: "2026-04-30",
    next: "2026-07-30",
  },
  {
    jurisdiction: "California",
    law: "SB 942 / AB 2013",
    status: "Operative 2026",
    requirement:
      "Covered-provider AI-content provenance/detection and public training-data documentation",
    artifact: "AUP; vendor questionnaire",
    owner: "Legal",
    reviewed: "2026-04-30",
    next: "2026-07-30",
  },
  {
    jurisdiction: "Colorado",
    law: "SB24-205 / SB25B-004",
    status: "Delayed to 2026-06-30",
    requirement: "Risk program, impact assessments, notice, appeal path",
    artifact: "Risk classification; review committee",
    owner: "Legal",
    reviewed: "2026-04-30",
    next: "2026-07-30",
  },
  {
    jurisdiction: "Texas",
    law: "TRAIGA HB 149",
    status: "Effective 2026-01-01",
    requirement:
      "Consumer AI disclosure, governmental social-scoring limits, biometric restrictions, AI Council",
    artifact: "AUP; risk classification",
    owner: "Policy lead",
    reviewed: "2026-04-30",
    next: "2026-07-30",
  },
  {
    jurisdiction: "Illinois",
    law: "AI Video Interview Act / HB 3773",
    status: "In force / 2026",
    requirement:
      "Video-interview notice/consent where applicable; AI employment notice and anti-discrimination rules",
    artifact: "Procurement guardrails; Tier-3 controls",
    owner: "HR + legal",
    reviewed: "2026-04-30",
    next: "2026-07-30",
  },
  {
    jurisdiction: "New York City",
    law: "Local Law 144",
    status: "In force",
    requirement:
      "AEDT bias audit, candidate/employee notice, and public audit results where in scope",
    artifact: "Procurement guardrails; Tier-3 controls",
    owner: "HR + legal",
    reviewed: "2026-04-30",
    next: "2026-07-30",
  },
  {
    jurisdiction: "Maryland / Connecticut",
    law: "State agency AI inventory laws",
    status: "In force",
    requirement: "Agency inventory, risk assessment, legislative reporting",
    artifact: "Use-case inventory",
    owner: "Review committee chair",
    reviewed: "2026-04-30",
    next: "2026-07-30",
  },
  {
    jurisdiction: "Washington",
    law: "SB 5152",
    status: "In force",
    requirement:
      "Synthetic-media disclosure rules for electioneering communications",
    artifact: "AUP public communication disclosure",
    owner: "Communications + legal",
    reviewed: "2026-04-30",
    next: "2026-07-30",
  },
  {
    jurisdiction: "Local",
    law: "CCOPS / surveillance ordinances",
    status: "Varies",
    requirement: "Council approval and public-impact report for surveillance technology",
    artifact: "Risk classification; public notice",
    owner: "City attorney",
    reviewed: "2026-04-30",
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

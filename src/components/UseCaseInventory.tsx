/** @jsxImportSource preact */
import { useEffect, useState } from "preact/hooks";

interface Item {
  name: string;
  sponsor: string;
  department: string;
  tier: string;
  status: string;
  vendorSystem: string;
  dataCategory: string;
  decisionSupport: string;
  impactAssessment: string;
  nextReview: string;
}

const STORAGE_KEY = "aqg.inventory.v1";
const EMPTY: Item = {
  name: "",
  sponsor: "",
  department: "",
  tier: "Tier 1",
  status: "Submitted",
  vendorSystem: "",
  dataCategory: "Public / non-sensitive",
  decisionSupport: "No decision support",
  impactAssessment: "Not needed",
  nextReview: "",
};

function loadItems(): Item[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({ ...EMPTY, ...item }));
  } catch {
    return [];
  }
}

export default function UseCaseInventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Item>(EMPTY);
  const [status, setStatus] = useState("");

  useEffect(() => setItems(loadItems()), []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const add = () => {
    if (!draft.name.trim()) return;
    setItems((current) => [...current, draft]);
    setDraft(EMPTY);
    setStatus("Use case added. Export the inventory before a review meeting or quarterly update.");
  };

  const remove = (index: number) =>
    setItems((current) => current.filter((_, i) => i !== index));

  const exportCsv = () => {
    const rows = [
      [
        "Use case",
        "Sponsor",
        "Department",
        "Tier",
        "Status",
        "Vendor / system",
        "Data category",
        "Decision support",
        "Impact assessment",
        "Next review",
      ],
      ...items.map((i) => [
        i.name,
        i.sponsor,
        i.department,
        i.tier,
        i.status,
        i.vendorSystem,
        i.dataCategory,
        i.decisionSupport,
        i.impactAssessment,
        i.nextReview,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-use-case-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("CSV inventory downloaded. Use it for spreadsheets, dashboards, or bulk review.");
  };

  const exportMarkdown = () => {
    const lines = [
      "# AI Use Case Inventory",
      "",
      `Exported: ${new Date().toISOString().slice(0, 10)}`,
      "",
      "| Use case | Sponsor | Department | Tier | Status | Vendor / system | Data category | Decision support | Impact assessment | Next review |",
      "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
      ...items.map(
        (i) =>
          `| ${i.name || "—"} | ${i.sponsor || "—"} | ${i.department || "—"} | ${i.tier} | ${i.status} | ${i.vendorSystem || "—"} | ${i.dataCategory} | ${i.decisionSupport} | ${i.impactAssessment} | ${i.nextReview || "—"} |`,
      ),
      "",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-use-case-inventory-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Markdown inventory downloaded. Use it for committee packets or versioned records.");
  };

  const update = (key: keyof Item, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  return (
    <section class="aqg-tier">
      <div class="aqg-tier__grid">
        <label>
          Use case
          <input
            id="aqg-inventory-name"
            name="aqg-inventory-name"
            type="text"
            value={draft.name}
            onInput={(e) => update("name", e.currentTarget.value)}
            placeholder="e.g. 311 triage assistant"
          />
        </label>
        <label>
          Sponsor
          <input
            id="aqg-inventory-sponsor"
            name="aqg-inventory-sponsor"
            type="text"
            value={draft.sponsor}
            onInput={(e) => update("sponsor", e.currentTarget.value)}
            placeholder="Name / role"
          />
        </label>
        <label>
          Department
          <input
            id="aqg-inventory-department"
            name="aqg-inventory-department"
            type="text"
            value={draft.department}
            onInput={(e) => update("department", e.currentTarget.value)}
            placeholder="Department"
          />
        </label>
        <label>
          Tier
          <select
            id="aqg-inventory-tier"
            name="aqg-inventory-tier"
            value={draft.tier}
            onInput={(e) => update("tier", e.currentTarget.value)}
          >
            <option>Tier 1</option>
            <option>Tier 2</option>
            <option>Tier 3</option>
          </select>
        </label>
        <label>
          Status
          <select
            id="aqg-inventory-status"
            name="aqg-inventory-status"
            value={draft.status}
            onInput={(e) => update("status", e.currentTarget.value)}
          >
            <option>Submitted</option>
            <option>Approved for pilot</option>
            <option>Needs refinement</option>
            <option>Deferred</option>
            <option>Retired</option>
          </select>
        </label>
        <label>
          Vendor / system
          <input
            id="aqg-inventory-vendor-system"
            name="aqg-inventory-vendor-system"
            type="text"
            value={draft.vendorSystem}
            onInput={(e) => update("vendorSystem", e.currentTarget.value)}
            placeholder="Tool, vendor, or internal system"
          />
        </label>
        <label>
          Data category
          <select
            id="aqg-inventory-data-category"
            name="aqg-inventory-data-category"
            value={draft.dataCategory}
            onInput={(e) => update("dataCategory", e.currentTarget.value)}
          >
            <option>Public / non-sensitive</option>
            <option>Internal</option>
            <option>Sensitive</option>
            <option>Regulated / confidential</option>
            <option>Unknown</option>
          </select>
        </label>
        <label>
          Decision support
          <select
            id="aqg-inventory-decision-support"
            name="aqg-inventory-decision-support"
            value={draft.decisionSupport}
            onInput={(e) => update("decisionSupport", e.currentTarget.value)}
          >
            <option>No decision support</option>
            <option>Informs a staff decision</option>
            <option>Materially supports a decision</option>
            <option>Automates or filters a decision</option>
          </select>
        </label>
        <label>
          Impact assessment
          <select
            id="aqg-inventory-impact-assessment"
            name="aqg-inventory-impact-assessment"
            value={draft.impactAssessment}
            onInput={(e) => update("impactAssessment", e.currentTarget.value)}
          >
            <option>Not needed</option>
            <option>Needed</option>
            <option>In progress</option>
            <option>Complete</option>
            <option>Counsel review</option>
          </select>
        </label>
        <label>
          Next review
          <input
            id="aqg-inventory-next-review"
            name="aqg-inventory-next-review"
            type="date"
            value={draft.nextReview}
            onInput={(e) => update("nextReview", e.currentTarget.value)}
          />
        </label>
      </div>
      <p>
        <button type="button" onClick={add} disabled={!draft.name.trim()}>
          Add to inventory
        </button>{" "}
        <button type="button" onClick={exportCsv} disabled={items.length === 0}>
          Export CSV
        </button>
        <button
          type="button"
          onClick={exportMarkdown}
          disabled={items.length === 0}
        >
          Export as Markdown
        </button>
      </p>
      {status ? (
        <p class="aqg-tier__privacy aqg-tool-status" aria-live="polite">
          {status}
        </p>
      ) : null}
      <div class="sl-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Use case</th>
              <th>Sponsor</th>
              <th>Department</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Vendor / system</th>
              <th>Data category</th>
              <th>Decision support</th>
              <th>Impact assessment</th>
              <th>Next review</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colspan={11}>No use cases recorded in this browser yet.</td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr>
                  <td>{item.name}</td>
                  <td>{item.sponsor || "—"}</td>
                  <td>{item.department || "—"}</td>
                  <td>{item.tier}</td>
                  <td>{item.status}</td>
                  <td>{item.vendorSystem || "—"}</td>
                  <td>{item.dataCategory}</td>
                  <td>{item.decisionSupport}</td>
                  <td>{item.impactAssessment}</td>
                  <td>{item.nextReview || "—"}</td>
                  <td>
                    <button type="button" onClick={() => remove(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p class="aqg-tier__privacy">
        Inventory entries are stored only in this browser. Export CSV for the
        system of record your agency uses.
      </p>
    </section>
  );
}

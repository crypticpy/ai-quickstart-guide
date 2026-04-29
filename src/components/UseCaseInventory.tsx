/** @jsxImportSource preact */
import { useEffect, useState } from "preact/hooks";

interface Item {
  name: string;
  sponsor: string;
  department: string;
  tier: string;
  status: string;
  nextReview: string;
}

const STORAGE_KEY = "aqg.inventory.v1";
const EMPTY: Item = {
  name: "",
  sponsor: "",
  department: "",
  tier: "Tier 1",
  status: "Submitted",
  nextReview: "",
};

function loadItems(): Item[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function UseCaseInventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Item>(EMPTY);

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
  };

  const remove = (index: number) =>
    setItems((current) => current.filter((_, i) => i !== index));

  const exportCsv = () => {
    const rows = [
      ["Use case", "Sponsor", "Department", "Tier", "Status", "Next review"],
      ...items.map((i) => [
        i.name,
        i.sponsor,
        i.department,
        i.tier,
        i.status,
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
  };

  const exportMarkdown = () => {
    const lines = [
      "# AI Use Case Inventory",
      "",
      `Exported: ${new Date().toISOString().slice(0, 10)}`,
      "",
      "| Use case | Sponsor | Department | Tier | Status | Next review |",
      "| --- | --- | --- | --- | --- | --- |",
      ...items.map(
        (i) =>
          `| ${i.name || "—"} | ${i.sponsor || "—"} | ${i.department || "—"} | ${i.tier} | ${i.status} | ${i.nextReview || "—"} |`,
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
  };

  const update = (key: keyof Item, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  return (
    <section class="aqg-tier">
      <div class="aqg-tier__grid">
        <label>
          Use case
          <input
            type="text"
            value={draft.name}
            onInput={(e) => update("name", e.currentTarget.value)}
            placeholder="e.g. 311 triage assistant"
          />
        </label>
        <label>
          Sponsor
          <input
            type="text"
            value={draft.sponsor}
            onInput={(e) => update("sponsor", e.currentTarget.value)}
            placeholder="Name / role"
          />
        </label>
        <label>
          Department
          <input
            type="text"
            value={draft.department}
            onInput={(e) => update("department", e.currentTarget.value)}
            placeholder="Department"
          />
        </label>
        <label>
          Tier
          <select value={draft.tier} onInput={(e) => update("tier", e.currentTarget.value)}>
            <option>Tier 1</option>
            <option>Tier 2</option>
            <option>Tier 3</option>
          </select>
        </label>
        <label>
          Status
          <select
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
          Next review
          <input
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
          Export Markdown
        </button>
      </p>
      <div class="sl-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Use case</th>
              <th>Sponsor</th>
              <th>Department</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Next review</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colspan={7}>No use cases recorded in this browser yet.</td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr>
                  <td>{item.name}</td>
                  <td>{item.sponsor || "—"}</td>
                  <td>{item.department || "—"}</td>
                  <td>{item.tier}</td>
                  <td>{item.status}</td>
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

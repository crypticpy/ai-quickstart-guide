import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const exportFile = path.join(root, "exports/playbook.md");

const result = spawnSync(process.execPath, ["scripts/build-playbook.mjs"], {
  cwd: root,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const text = fs.readFileSync(exportFile, "utf8");
const componentNames = [
  "AgencyPathPicker",
  "AgencyRouteChooser",
  "AgencySetupWizard",
  "AtAGlance",
  "AUPWizard",
  "CharterWizard",
  "ComplianceMatrix",
  "FreshnessNote",
  "IntakeForm",
  "PhaseBanner",
  "ReadinessAssessment",
  "RiskTierPicker",
  "ROICalculator",
  "StarterProjectSelector",
  "Takeaways",
  "UseCaseInventory",
];

const failures = [];
for (const name of componentNames) {
  const pattern = new RegExp(`<\\/?${name}\\b`);
  if (pattern.test(text)) failures.push(name);
}

if (failures.length > 0) {
  console.error("Print export contains unresolved component tags:");
  for (const name of failures) console.error(`- ${name}`);
  process.exit(1);
}

console.log(`Checked ${path.relative(root, exportFile)} for unresolved component tags.`);

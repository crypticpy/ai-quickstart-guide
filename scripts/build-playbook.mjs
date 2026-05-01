import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "src/content/docs");
const outDir = path.join(root, "exports");
const outFile = path.join(outDir, "playbook.md");

const order = [
  "index.mdx",
  "getting-started",
  "phase-1-governance",
  "phase-2-education",
  "phase-3-infrastructure",
  "phase-4-dev-stack",
  "phase-5-platform",
  "phase-6-starter-projects",
  "resources",
];

fs.mkdirSync(outDir, { recursive: true });
const chunks = [];

for (const item of order) {
  const full = path.join(docsDir, item);
  if (!fs.existsSync(full)) continue;
  const files = fs.statSync(full).isDirectory()
    ? walk(full).filter((file) => /\.(md|mdx)$/.test(file)).sort()
    : [full];
  for (const file of files) {
    const rel = path.relative(docsDir, file).replaceAll(path.sep, "/");
    chunks.push(`\n\n<!-- Source: ${rel} -->\n\n${prepareMarkdown(fs.readFileSync(file, "utf8"))}`);
  }
}

fs.writeFileSync(outFile, chunks.join("\n\n---\n"), "utf8");
console.log(`Wrote ${path.relative(root, outFile)}`);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function prepareMarkdown(source) {
  let text = source.replace(/\r\n/g, "\n");
  text = text.replace(/^---\n[\s\S]*?\n---\n?/, "");
  text = text.replace(/^import .*$/gm, "");
  text = text.replace(/<PhaseBanner\b([^>]*)\/>/g, (_, attrs) => phaseBannerFallback(attrs));
  text = text.replace(/<AtAGlance\b([^>]*)\/>/g, (_, attrs) => atAGlanceFallback(attrs));
  text = text.replace(/<FreshnessNote\b([^>]*)\/>/g, (_, attrs) => freshnessNoteFallback(attrs));
  text = text.replace(/<Takeaways\b([^>]*)\/>/g, (_, attrs) => takeawaysFallback(attrs));
  text = text.replace(/<([A-Z][A-Za-z0-9.]*)\b[^>]*client:[^>]*\/>/g, componentFallback);
  text = text.replace(/<([A-Z][A-Za-z0-9.]*)\s*\/>/g, componentFallback);
  text = text.replace(/<CardGrid[^>]*>|<\/CardGrid>|<Card[^>]*>|<\/Card>/g, "");
  text = text.replace(/<Tabs[^>]*>|<\/Tabs>|<TabItem[^>]*>|<\/TabItem>/g, "");
  text = text.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

function componentFallback(match, name) {
  const fallbacks = {
    AgencyRouteChooser:
      "> **Interactive route chooser omitted from print export.** Use the readiness assessment, path picker, and quickstart checklist to choose a route.",
    AgencySetupWizard:
      "> **Interactive setup wizard omitted from print export.** Use the Small, Standard, and Large path recommendations in this section.",
    ReadinessAssessment:
      "> **Interactive assessment omitted from print export.** Use the live site to score readiness and export the filled result.",
    AgencyPathPicker:
      "> **Interactive path picker omitted from print export.** Use the Small, Standard, and Large path descriptions in this playbook.",
    RiskTierPicker:
      "> **Interactive risk picker omitted from print export.** Use the risk matrix and examples in this section to classify the use case.",
    AUPWizard:
      "> **Interactive AUP wizard omitted from print export.** Use the model policy text below as the printable fallback.",
    CharterWizard:
      "> **Interactive charter wizard omitted from print export.** Use the model charter text below as the printable fallback.",
    IntakeForm:
      "> **Interactive intake form omitted from print export.** Use the intake questions in this section as the printable fallback.",
    ROICalculator:
      "> **Interactive ROI calculator omitted from print export.** Use the ROI categories and worksheet guidance in this section.",
    ComplianceMatrix:
      "> **Interactive compliance matrix omitted from print export.** Use the table in this section and verify requirements with counsel.",
    StarterProjectSelector:
      "> **Interactive starter selector omitted from print export.** Use the selection rubric and archetype comparison in this section.",
  };
  return fallbacks[name] ?? "";
}

function attrsToObject(attrs) {
  const out = {};
  for (const match of attrs.matchAll(/\s+([A-Za-z][A-Za-z0-9]*)="([^"]*)"/g)) {
    out[match[1]] = match[2];
  }
  return out;
}

function phaseBannerFallback(attrs) {
  const { phase, title, months, focus } = attrsToObject(attrs);
  const label = [phase, title].filter(Boolean).join(": ");
  return [
    `> **${label || "Phase overview"}**`,
    months ? `> Timeframe: ${months}.` : "",
    focus ? `> Focus: ${focus}` : "",
  ].filter(Boolean).join("\n");
}

function atAGlanceFallback(attrs) {
  const values = attrsToObject(attrs);
  const rows = [
    ["Audience", values.audience],
    ["Effort", values.effort],
    ["Output", values.output],
    ["Prerequisites", values.prerequisites],
    ["Next action", values.nextAction],
  ].filter(([, value]) => value);
  return ["> **At a glance**", ...rows.map(([label, value]) => `> - **${label}:** ${value}`)].join("\n");
}

function freshnessNoteFallback(attrs) {
  const { reviewed, note } = attrsToObject(attrs);
  return [
    "> **Freshness note**",
    reviewed ? `> Last reviewed: ${reviewed}.` : "",
    note ? `> ${note}` : "",
  ].filter(Boolean).join("\n");
}

function takeawaysFallback(attrs) {
  const { copy, avoid } = attrsToObject(attrs);
  return [
    "> **Takeaways**",
    copy ? `> Do: ${copy}` : "",
    avoid ? `> Avoid: ${avoid}` : "",
  ].filter(Boolean).join("\n");
}

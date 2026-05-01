import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const deckDir = path.join(root, "public/deck-sources");

if (!fs.existsSync(deckDir)) {
  console.error("Missing public/deck-sources directory.");
  process.exit(1);
}

const files = walk(deckDir).filter((file) => file.endsWith(".md")).sort();
const failures = [];

for (const file of files) {
  const rel = path.relative(root, file).replaceAll(path.sep, "/");
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");

  if (!text.startsWith("# Deck Source: ")) {
    failures.push(`${rel}: must start with "# Deck Source: "`);
  }
  if (!text.includes("## Deck instructions")) {
    failures.push(`${rel}: missing "## Deck instructions"`);
  }
  const preSlides = text.split(/\n---\n/)[0] ?? "";
  if (!hasLocalizationGuidance(preSlides)) {
    failures.push(`${rel}: missing localization, placeholder replacement, or local verification guidance before slides`);
  }

  const slideMatches = [...text.matchAll(/^# Slide \d+:/gm)];
  if (slideMatches.length === 0) {
    failures.push(`${rel}: no "# Slide N:" headings found`);
    continue;
  }

  const slideSections = text.split(/\n---\n/).filter((section) => /^# Slide \d+:/m.test(section));
  for (const section of slideSections) {
    const heading = section.match(/^# Slide \d+:[^\n]*/m)?.[0] ?? "Unknown slide";
    for (const required of ["Speaker notes:", "Image guidance:", "Evidence and review notes:"]) {
      if (!section.includes(required)) {
        failures.push(`${rel}: ${heading} missing "${required}"`);
      }
    }
    const visibleBullets = countVisibleBullets(section);
    if (visibleBullets > 5 && !/exercise|activity|agenda|workshop|rubric/i.test(heading)) {
      failures.push(`${rel}: ${heading} has ${visibleBullets} visible bullets; keep most slides to 5 or fewer`);
    }
  }
}

if (failures.length > 0) {
  console.error("Deck source validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Checked ${files.length} deck source files.`);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function countVisibleBullets(section) {
  const speakerStart = section.search(/\nSpeaker notes:\n/);
  const visible = speakerStart === -1 ? section : section.slice(0, speakerStart);
  return visible.split("\n").filter((line) => /^- /.test(line)).length;
}

function hasLocalizationGuidance(text) {
  return /## Localization checklist/i.test(text)
    || /replace .*placeholder/i.test(text)
    || /placeholder/i.test(text)
    || /localize/i.test(text)
    || /verify local/i.test(text)
    || /local details/i.test(text)
    || /agency facts/i.test(text)
    || /contract authority/i.test(text)
    || /legal references/i.test(text)
    || /workflow facts/i.test(text)
    || /approved, sanitized/i.test(text)
    || /locally approved/i.test(text);
}

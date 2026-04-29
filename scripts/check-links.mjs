import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "src/content/docs");
const files = walk(docsDir).filter((file) => /\.(md|mdx)$/.test(file));
const routes = new Set(["/"]);

for (const file of files) {
  const rel = path.relative(docsDir, file).replaceAll(path.sep, "/");
  const parsed = path.parse(rel);
  const route =
    parsed.name === "index"
      ? `/${parsed.dir ? `${parsed.dir}/` : ""}`
      : `/${parsed.dir ? `${parsed.dir}/` : ""}${parsed.name}/`;
  routes.add(route);
}

const failures = [];
for (const file of [
  ...files,
  path.join(root, "README.md"),
  path.join(root, "CONTRIBUTING.md"),
]) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  const links = extractLinks(text);
  for (const raw of links) {
    const url = normalizeInternal(raw);
    if (!url) continue;
    if (!routes.has(url)) {
      failures.push(`${path.relative(root, file)} -> ${raw} (expected ${url})`);
    }
  }
}

if (failures.length > 0) {
  console.error("Broken internal links:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Checked ${files.length} docs files against ${routes.size} routes.`);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function extractLinks(text) {
  const links = [];
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    links.push(match[1]);
  }
  for (const match of text.matchAll(/\blink:\s*([^\s]+)/g)) {
    links.push(match[1]);
  }
  for (const match of text.matchAll(/\bhref=["']([^"']+)["']/g)) {
    links.push(match[1]);
  }
  return links;
}

function normalizeInternal(raw) {
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  if (raw.startsWith("/ai-quickstart-guide/")) {
    raw = raw.replace("/ai-quickstart-guide", "");
  }
  const withoutHash = raw.split("#")[0].split("?")[0];
  if (!withoutHash || withoutHash === "/") return "/";
  const withSlash = withoutHash.endsWith("/") ? withoutHash : `${withoutHash}/`;
  return withSlash;
}

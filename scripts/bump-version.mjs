import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const KINDS = new Set(["major", "minor", "patch"]);
const root = path.resolve(import.meta.dirname, "..");

const kind = process.argv[2];
const note = process.argv.slice(3).join(" ").trim();

if (!KINDS.has(kind)) {
  console.error("Usage: node scripts/bump-version.mjs <major|minor|patch> [note]");
  process.exit(1);
}

const packagePath = path.join(root, "package.json");
const currentPath = path.join(root, "src/lib/release/current.ts");
const changelogPath = path.join(root, "CHANGELOG.md");

const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
const current = parseVersion(packageJson.version);
const next = bump(current, kind);
const version = format(next);
const today = new Date().toISOString().slice(0, 10);

packageJson.version = version;
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
await writeFile(currentPath, `export const APP_VERSION = "${version}";\n`);

const heading = `## ${version} — ${today}`;
const body = note.length > 0 ? `${heading}\n\n- ${note}\n` : `${heading}\n`;
const previous = await readFile(changelogPath, "utf8").catch(() => "# Changelog\n");
const nextLog = previous.startsWith("# Changelog")
  ? previous.replace("# Changelog\n", `# Changelog\n\n${body}`)
  : `${body}\n${previous}`;

await writeFile(changelogPath, nextLog);

console.log(`Resonance ${format(current)} → ${version} (${kind})`);

function parseVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(value));

  if (!match) {
    throw new Error(`package.json version is not semver: ${value}`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function bump(version, release) {
  if (release === "major") {
    return { major: version.major + 1, minor: 0, patch: 0 };
  }

  if (release === "minor") {
    return { major: version.major, minor: version.minor + 1, patch: 0 };
  }

  return { major: version.major, minor: version.minor, patch: version.patch + 1 };
}

function format(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}

// Runs Claude Code headless to review a campaign folder.
// Usage (from the client's repo): node <plugin>/scripts/review.mjs <campaign-folder>
// Exit code 1 if any finding is high severity, 2 on a script error.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The plugin folder holds the schema. The client's repo (where you run this) holds the emails and the findings.
const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = process.cwd();
const folder = process.argv[2];
if (!folder) {
  console.error("Usage: node scripts/review.mjs <campaign-folder>");
  process.exit(2);
}

const schema = JSON.stringify(JSON.parse(readFileSync(resolve(pluginRoot, "review/findings.schema.json"), "utf8")));
let prompt =
  `Review every email in ${folder} against brand/voice.md and .claude/rules/emails.md. ` +
  `If either file is missing, report one high finding saying which one. Report only real problems.`;

// If an earlier review of the same folder exists, include its findings.
const findingsPath = resolve(root, "review/findings.json");
try {
  const prev = JSON.parse(readFileSync(findingsPath, "utf8"));
  if (prev.folder === folder && Array.isArray(prev.findings)) {
    prompt +=
      " Earlier findings: " + JSON.stringify(prev.findings) +
      " These are findings from the last review. Report only problems that are new or still not fixed. Don't repeat ones that have been fixed.";
  }
} catch {
  // No earlier review. Start fresh.
}

const args = [
  "-p", prompt,
  "--output-format", "json",
  "--json-schema", schema,
  "--allowedTools", "Read,Glob,Grep",
];

// shell:true so Windows finds claude.cmd; args are quoted by hand.
const quote = (s) => `"${s.replace(/"/g, '\\"')}"`;
const run = spawnSync("claude", args.map(quote), {
  cwd: root,
  encoding: "utf8",
  shell: true,
  maxBuffer: 64 * 1024 * 1024,
});

if (run.status !== 0) {
  console.error("claude failed:", run.stderr || run.stdout);
  process.exit(2);
}

let parsed;
try {
  parsed = JSON.parse(run.stdout);
} catch {
  console.error("Could not parse claude output:\n" + run.stdout);
  process.exit(2);
}

// Output may be one object, or a list whose last item is the result.
const result = Array.isArray(parsed) ? parsed[parsed.length - 1] : parsed;
const out = result?.structured_output;
if (!out || !Array.isArray(out.findings)) {
  console.error("No structured_output in result:\n" + JSON.stringify(result, null, 2));
  process.exit(2);
}

mkdirSync(resolve(root, "review"), { recursive: true });
writeFileSync(findingsPath, JSON.stringify({ folder, findings: out.findings }, null, 2) + "\n");

const count = (sev) => out.findings.filter((f) => f.severity === sev).length;
const high = count("high");
console.log(
  `${folder}: ${out.findings.length} findings (${high} high, ${count("medium")} medium, ${count("low")} low)`
);
process.exit(high > 0 ? 1 : 0);

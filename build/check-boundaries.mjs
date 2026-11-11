#!/usr/bin/env node
/**
 * Checks the one-way dependencies between the zones (see the layout in report.mdx):
 *
 *   src/core   must NOT import src/app, report/ or build/  (the engine knows nothing about the page or the report)
 *   src/app    may import core and report/, not build/
 *   report/    may import "report-maker" and its own files, not src/ (use the public API)
 *   build/     may import only src/core/types and src/core/utils/shared (code shared with the browser)
 *
 * Usage: node build/check-boundaries.mjs        (exit code 1 when a rule is broken)
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const posix = path.posix;

const files = new Set(
  execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean),
);

const RULES = [
  {
    from: "src/core/",
    forbid: ["src/app/", "report/", "build/"],
    forbidBare: ["report-maker"],
    message: "core must not depend on app, report or build",
  },
  { from: "src/app/", forbid: ["build/"], message: "app must not import the build tooling" },
  { from: "report/", forbid: ["src/", "build/"], message: "report/ must use the public API (\"report-maker\"), not src/ directly" },
  {
    from: "build/",
    forbid: ["src/app/", "report/"],
    allowOnlyUnderSrc: ["src/core/types/", "src/core/utils/shared/"],
    message: "build/ may only share code with the browser through src/core/types and src/core/utils/shared",
  },
];

const EXTS = ["", ".ts", ".tsx", ".mts", ".js", ".mjs", ".css", ".json", "/index.ts", "/index.tsx", "/index.js"];
const JS_RE = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)(["'])([^"'\r\n]+)\1/g;
const CSS_RE = /@import\s+(?:url\(\s*)?(["'])([^"'\r\n]+)\1/g;

function resolveRelative(from, spec) {
  const bare = spec.replace(/[?#].*$/, "");
  const base = posix.normalize(posix.join(posix.dirname(from), bare));
  return EXTS.map((e) => base + e).find((c) => files.has(c)) ?? base;
}

const problems = [];
for (const file of [...files].sort()) {
  const ext = posix.extname(file);
  if (![".ts", ".tsx", ".mts", ".mjs", ".css", ".mdx"].includes(ext)) continue;
  const rule = RULES.find((r) => file.startsWith(r.from));
  if (!rule) continue;

  let text = fs.readFileSync(file, "utf8");
  if (ext === ".mdx") text = text.replace(/^(`{3,}|~{3,})[\s\S]*?^\1[ \t]*$/gm, ""); // skip code fences
  const re = ext === ".css" ? CSS_RE : JS_RE;

  for (const [, , spec] of text.matchAll(re)) {
    if (!spec.startsWith(".")) {
      if (rule.forbidBare?.includes(spec)) problems.push(`${file}: imports "${spec}" (${rule.message})`);
      continue;
    }
    const target = resolveRelative(file, spec);
    const hitsForbidden = rule.forbid.some((f) => target.startsWith(f));
    const outsideAllowed =
      rule.allowOnlyUnderSrc && target.startsWith("src/") && !rule.allowOnlyUnderSrc.some((a) => target.startsWith(a));
    if (hitsForbidden || outsideAllowed) problems.push(`${file}: imports "${spec}" -> ${target}  (${rule.message})`);
  }
}

if (problems.length) {
  console.error(`\n${problems.length} dependency rule(s) broken:\n`);
  for (const p of problems) console.error("  " + p);
  console.error("");
  process.exit(1);
}
console.log("Zone boundaries respected.");

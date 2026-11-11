#!/usr/bin/env node
// Brain for Cross-border Deal — packager
// Builds a self-contained, offline release bundle of the web app:
//   dist/brain-for-cross-border-deal-<version>/        (app + launchers + manifest)
//   dist/brain-for-cross-border-deal-<version>.zip
//   dist/brain-for-cross-border-deal-<version>.tar.gz
// Usage: node tools/pack.mjs [--version 0.2.0]
// No dependencies; uses the system `tar` (bundled with Windows 10+, macOS and Linux).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const argv = process.argv.slice(2);
const version = (argv.includes("--version") ? argv[argv.indexOf("--version") + 1] : pkg.version).replace(/^v/, "");
const NAME = `brain-for-cross-border-deal-${version}`;
const DIST = path.join(ROOT, "dist");
const OUT = path.join(DIST, NAME);

// 1. What goes in the bundle
const INCLUDE = ["apps/web", "docs", "README.md", "LICENSE"];
const BLOCK = [/\.env/i, /node_modules/, /\.log$/, /(^|\/)\.git(\/|$)/];

// 2. Privacy gate: the published data file may only contain aggregate counts.
function privacyCheck() {
  const f = path.join(ROOT, "apps/web/data/showcase.json");
  if (!fs.existsSync(f)) return "skipped (no showcase.json)";
  const d = JSON.parse(fs.readFileSync(f, "utf8"));
  const k = d?.privacy?.k_min ?? 0;
  if (k < 5) throw new Error(`privacy: k_min is ${k}, must be >= 5`);
  const text = JSON.stringify(d);
  if (/@[a-z0-9-]+\.[a-z]{2,}/i.test(text)) throw new Error("privacy: an email address was found in showcase.json");
  if (/https?:\/\//i.test(text)) throw new Error("privacy: a URL was found in showcase.json");
  const small = [];
  (function walk(o, p) {
    if (o && typeof o === "object") for (const [key, v] of Object.entries(o)) walk(v, p + "." + key);
    else if (typeof o === "number" && /by_|matrix/.test(p) && o > 0 && o < k) small.push(p);
  })(d, "");
  if (small.length) throw new Error("privacy: cells below k_min: " + small.slice(0, 5).join(", "));
  return `ok (k_min=${k})`;
}

function copy(src, dst) {
  const st = fs.statSync(src);
  const rel = path.relative(ROOT, src).replace(/\\/g, "/");
  if (BLOCK.some((r) => r.test(rel))) return;
  if (st.isDirectory()) { fs.mkdirSync(dst, { recursive: true }); for (const f of fs.readdirSync(src)) copy(path.join(src, f), path.join(dst, f)); }
  else fs.copyFileSync(src, dst);
}
function walkFiles(dir, base = dir, out = []) {
  for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f); fs.statSync(p).isDirectory() ? walkFiles(p, base, out) : out.push(path.relative(base, p).replace(/\\/g, "/")); }
  return out;
}
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

console.log(`Packing ${NAME}`);
console.log("privacy check:", privacyCheck());
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const i of INCLUDE) { const s = path.join(ROOT, i); if (fs.existsSync(s)) copy(s, path.join(OUT, i)); }

// 3. Launchers (open the app offline in the default browser)
fs.writeFileSync(path.join(OUT, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=apps/web/index.html"><title>Brain for Cross-border Deal</title></head><body><a href="apps/web/index.html">Open Brain for Cross-border Deal</a></body></html>\n`);
fs.writeFileSync(path.join(OUT, "start-windows.bat"), `@echo off\r\nstart "" "%~dp0apps\\web\\index.html"\r\n`);
fs.writeFileSync(path.join(OUT, "start-mac.command"), `#!/bin/sh\ncd "$(dirname "$0")" && open apps/web/index.html\n`, { mode: 0o755 });
fs.writeFileSync(path.join(OUT, "start-linux.sh"), `#!/bin/sh\ncd "$(dirname "$0")" && xdg-open apps/web/index.html\n`, { mode: 0o755 });
fs.writeFileSync(path.join(OUT, "INSTALL.txt"),
`Brain for Cross-border Deal ${version}
=====================================
Offline bundle. No installation or internet connection needed.

Windows : double-click start-windows.bat
macOS   : double-click start-mac.command (or open apps/web/index.html)
Linux   : ./start-linux.sh

Contents
- apps/web/index.html          the app (clickable prototype)
- apps/web/data/showcase.json  real DealPilot data, anonymized and aggregated by country x industry
- docs/                        architecture, channels, data sources, roadmap
- manifest.json                version, commit and SHA-256 of every file

Verify integrity: compare each file's SHA-256 with manifest.json.
`);

// 4. Manifest with checksums
let commit = "unknown";
try { commit = execFileSync("git", ["-C", ROOT, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim(); } catch {}
const files = walkFiles(OUT).sort().map((f) => ({ path: f, bytes: fs.statSync(path.join(OUT, f)).size, sha256: sha(path.join(OUT, f)) }));
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({ name: "brain-for-cross-border-deal", version, commit, built_at: new Date().toISOString(), files }, null, 1));

// 5. Archives
fs.rmSync(OUT + ".zip", { force: true }); fs.rmSync(OUT + ".tar.gz", { force: true });
execFileSync("tar", ["-czf", NAME + ".tar.gz", NAME], { cwd: DIST });
try {
  if (process.platform === "win32") execFileSync("tar", ["-a", "-cf", NAME + ".zip", NAME], { cwd: DIST });
  else execFileSync("zip", ["-rq", NAME + ".zip", NAME], { cwd: DIST });
} catch (e) { console.warn("zip skipped:", e.message.split("\n")[0]); }
for (const a of [".zip", ".tar.gz"]) {
  const p = OUT + a;
  if (fs.existsSync(p)) { fs.writeFileSync(p + ".sha256", `${sha(p)}  ${path.basename(p)}\n`); console.log(`  ${path.relative(ROOT, p)}  ${(fs.statSync(p).size / 1024).toFixed(0)} KB`); }
}
console.log(`Done: ${files.length} files, commit ${commit}`);

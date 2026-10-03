#!/usr/bin/env node
/**
 * GradePulse QA: static invariants for the public marketing surface.
 *
 * These catch the root causes behind the checks that would otherwise need a
 * real browser (horizontal overflow, hydration mismatches, console errors)
 * without adding a Playwright/Puppeteer dependency:
 *
 *   A  no `window`/`document` outside effects or event handlers (client only)
 *   B  no `overflow-x` masking anywhere (fix the layout, not the symptom)
 *   C  no `Math.random()` (unstable SSR/client markup)
 *   D  no Supabase imports in app/(public)/** or components/marketing/**
 *   E  no render-time clock in client components (Date.now / new Date)
 *   F  the auth island stays transition-free (instant swap, no fade)
 *
 * Wired to `prebuild`, so `npm run build` cannot pass with a violation.
 * Run directly: npm run qa:invariants
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const violations = [];
const infos = [];
let scanned = 0;

const rel = (p) => relative(ROOT, p).replace(/\\/g, "/");
const lineAt = (src, idx) => src.slice(0, idx).split("\n").length;
const inAny = (i, ranges) => ranges.some(([a, b]) => i >= a && i <= b);
const isClient = (src) => /^[\s;]*["']use client["']/m.test(src);

function report(rule, file, src, idx, msg) {
  violations.push({ rule, file, line: lineAt(src, idx), msg });
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** From an opening delimiter at `open`, return the inclusive [start, end]. */
function pairRange(src, open, openChar, closeChar) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === openChar) depth += 1;
    else if (src[i] === closeChar) {
      depth -= 1;
      if (depth === 0) return [open, i];
    }
  }
  return [open, src.length];
}

function collect(src, re, openChar, closeChar) {
  const ranges = [];
  const rx = new RegExp(re.source, "g");
  let m;
  while ((m = rx.exec(src)) !== null) {
    const open = m.index + m[0].length - 1;
    ranges.push(pairRange(src, open, openChar, closeChar));
    rx.lastIndex = open + 1;
  }
  return ranges;
}

/**
 * Ranges where touching the DOM / reading a clock is legitimate:
 * an effect body, or an event-handler expression container.
 */
function legalScopes(src) {
  return [
    ...collect(src, /(?:useEffect|useLayoutEffect)\s*\(/, "(", ")"),
    ...collect(src, /on[A-Z][A-Za-z]*\s*=\s*\{/, "{", "}"),
    ...collect(src, /addEventListener\s*\(/, "(", ")"),
  ];
}

function scanTokens(src, re, fn) {
  const rx = new RegExp(re.source, "g");
  let m;
  while ((m = rx.exec(src)) !== null) fn(m);
}

/**
 * Blanks out comments while preserving every character position (and every
 * newline), so rules never fire on prose — "no fade, no transition" in a doc
 * comment is not a violation — and `lineAt()` still maps to the real file.
 */
function stripComments(src) {
  let out = "";
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];

    if (quote) {
      out += c;
      if (c === "\\") {
        out += next ?? "";
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i += 1;
      continue;
    }

    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      out += c;
      i += 1;
      continue;
    }

    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") {
        out += " ";
        i += 1;
      }
      continue;
    }

    if (c === "/" && next === "*") {
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        out += src[i] === "\n" ? "\n" : " ";
        i += 1;
      }
      out += "  ";
      i += 2;
      continue;
    }

    out += c;
    i += 1;
  }
  return out;
}

const read = (p) => stripComments(readFileSync(p, "utf8"));

// --- Rule A: DOM outside effects / handlers --------------------------------
function ruleA(file, src) {
  if (!/\b(?:window|document)\b/.test(src)) return;
  const scopes = legalScopes(src);
  const client = isClient(src);
  const lines = src.split("\n");
  scanTokens(src, /\b(?:window|document)\b/, (m) => {
    const line = (lines[lineAt(src, m.index) - 1] ?? "").trim();
    if (/^(?:\/\/|\*|\/\*)/.test(line)) return;
    if (/typeof\s+(?:window|document)/.test(line)) return;
    if (inAny(m.index, scopes)) return;
    report(
      "A",
      file,
      src,
      m.index,
      client
        ? `\`${m[0]}\` used outside useEffect / event handler`
        : `\`${m[0]}\` used in a file without "use client"`
    );
  });
}

// --- Rule B: overflow-x masking -------------------------------------------
function ruleB(file, src) {
  scanTokens(src, /overflow-x\s*:\s*hidden/, (m) =>
    report("B", file, src, m.index, "`overflow-x: hidden` masks real layout overflow — fix the layout")
  );
  scanTokens(src, /overflow-x-hidden/, (m) =>
    report("B", file, src, m.index, "`overflow-x-hidden` masks real layout overflow — fix the layout")
  );
}

// --- Rule C: Math.random ---------------------------------------------------
function ruleC(file, src) {
  const scopes = legalScopes(src);
  scanTokens(src, /Math\.random\s*\(/, (m) => {
    if (inAny(m.index, scopes)) return;
    report("C", file, src, m.index, "`Math.random()` produces unstable SSR/client markup");
  });
}

// --- Rule D: Supabase imports on the public surface ------------------------
function ruleD(file, src) {
  scanTokens(
    src,
    /(?:from\s*["'](?:@supabase\/[^"']*|@\/lib\/supabase[^"']*)["']|require\(\s*["'](?:@supabase\/|@\/lib\/supabase))/,
    (m) =>
      report(
        "D",
        file,
        src,
        m.index,
        "Supabase import on the public surface — the cookie island must read the session instead"
      )
  );
}

// --- Rule E: render-time clock in client components ------------------------
const CLOCK_RE = /\b(?:Date\.now\s*\(|new\s+Date\s*\()/;
function ruleE(file, src) {
  if (!CLOCK_RE.test(src)) return;
  const scopes = legalScopes(src);
  const client = isClient(src);
  let inRender = 0;
  scanTokens(src, CLOCK_RE, (m) => {
    if (inAny(m.index, scopes)) return;
    inRender += 1;
    if (client) {
      report("E", file, src, m.index, `\`${m[0]}\` runs during render — hydration mismatch risk`);
    }
  });
  if (!client && inRender > 0) {
    infos.push(
      `${rel(file)} — ${inRender} render-time clock read(s) in a server component ` +
        "(rendered once, cannot cause a hydration mismatch)"
    );
  }
}

// --- Rule F: auth island must swap instantly (no transition) ---------------
const ISLAND_FILES = [
  "src/components/marketing/auth/auth-nav-slot.tsx",
  "src/components/marketing/auth/auth-banner.tsx",
];
function ruleF(file, src) {
  scanTokens(src, /\banimate-|\btransition|\bduration-\d|\bease-/, (m) =>
    report("F", file, src, m.index, `auth-island swap must be instant — found \`${m[0]}\``)
  );
}

// --- Runner ----------------------------------------------------------------
const MARKETING = [
  join(ROOT, "src", "components", "marketing"),
  join(ROOT, "src", "app", "(public)"),
];
const APP_SURFACE = [join(ROOT, "src", "components"), join(ROOT, "src", "app")];
const CODE = /\.(?:ts|tsx)$/;
const notTest = (p) => !/\.test\.(?:ts|tsx)$/.test(p);

for (const file of MARKETING.flatMap((d) => walk(d)).filter((p) => CODE.test(p))) {
  const src = read(file);
  scanned += 1;
  ruleA(file, src);
  ruleB(file, src);
  ruleD(file, src);
}

for (const file of APP_SURFACE.flatMap((d) => walk(d)).filter((p) => CODE.test(p) && notTest(p))) {
  const src = read(file);
  scanned += 1;
  ruleC(file, src);
  ruleE(file, src);
}

// Rule B also guards the shared stylesheet (it is the marketing CSS too).
for (const p of [join(ROOT, "src", "app", "globals.css")]) {
  if (existsSync(p)) {
    scanned += 1;
    ruleB(p, read(p));
  }
}

// Rule F (the island files only exist once the chrome batch lands).
for (const relPath of ISLAND_FILES) {
  const p = join(ROOT, relPath);
  if (!existsSync(p)) {
    infos.push(`${relPath} — not present yet (rule F armed for when it lands)`);
    continue;
  }
  scanned += 1;
  ruleF(p, read(p));
}

const RULE_TITLES = {
  A: "DOM access outside effects/handlers",
  B: "overflow-x masking",
  C: "Math.random in render",
  D: "Supabase import on public surface",
  E: "render-time clock",
  F: "auth island animated",
};

console.log(`GradePulse public-surface invariants — ${scanned} file(s) scanned`);
for (const [rule, title] of Object.entries(RULE_TITLES)) {
  const hits = violations.filter((v) => v.rule === rule);
  console.log(`${hits.length ? "FAIL" : "PASS"}  ${rule}  ${title} (${hits.length})`);
}
for (const v of violations) {
  console.log(`  ${v.rule} ${v.file}:${v.line} — ${v.msg}`);
}
for (const i of infos) console.log(`INFO  ${i}`);

console.log(
  `\n${violations.length === 0 ? "ALL INVARIANTS HELD" : `${violations.length} VIOLATION(S)`}`
);
process.exit(violations.length === 0 ? 0 : 1);

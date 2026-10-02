#!/usr/bin/env node
/**
 * GradePulse QA: verify the Supabase SSR auth-cookie contract.
 *
 * The public marketing header swaps its CTA for signed-in visitors by reading
 * `document.cookie` (src/components/marketing/auth/session-cookie.ts). That is
 * only possible when the Supabase session cookie is NOT HttpOnly, so this
 * script proves the contract against the live project instead of assuming it:
 *
 *   1. the session cookie name equals `sb-<projectRef>-auth-token`
 *   2. HttpOnly is ABSENT
 *   3. Path=/ and SameSite=Lax
 *   4. the matcher used by the island rejects PKCE `-code-verifier` decoys
 *
 * Run: npm run verify:auth-cookie   (creates one throwaway account)
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error("FAIL  .env.local missing Supabase credentials");
  process.exit(1);
}

let failures = 0;
const check = (name, ok, extra = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
};

// --- The exact matcher the auth island uses --------------------------------
const projectRef = new URL(url).hostname.split(".")[0];
const sessionKey = `sb-${projectRef}-auth-token`;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SESSION_COOKIE = new RegExp(`^${escapeRe(sessionKey)}(?:\\.[0-9]+)?$`);

console.log(`INFO  project ref   ${projectRef}`);
console.log(`INFO  expected name ${sessionKey}`);

// A stale PKCE verifier from an abandoned email-confirmation flow must never
// be mistaken for a session, or logged-out visitors would see "Dashboard".
const decoys = [
  `${sessionKey}-code-verifier`,
  `${sessionKey}-flows-code-verifier`,
  `${sessionKey}-flow-abc12345-code-verifier`,
].filter((n) => SESSION_COOKIE.test(n));
check(
  "matcher rejects PKCE code-verifier decoys",
  decoys.length === 0,
  decoys.length ? `false positives: ${decoys.join(", ")}` : "0 false positives"
);
check(
  "matcher accepts a chunked session cookie",
  SESSION_COOKIE.test(`${sessionKey}.0`)
);

// --- Sign up and capture the raw cookie options ----------------------------
const written = [];
const jar = new Map();
const client = createServerClient(url, anon, {
  cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (cookies) => {
      for (const c of cookies) {
        jar.set(c.name, c.value);
        written.push({ name: c.name, options: c.options ?? {} });
      }
    },
  },
});

const email = `gradepulse.cookie.${Date.now()}@gmail.com`;
const { error } = await client.auth.signUp({
  email,
  password: `Qa!${randomUUID()}`,
});
if (error) {
  console.error(`FAIL  signup: ${error.message}`);
  process.exit(1);
}

const session = written.find((c) => SESSION_COOKIE.test(c.name));
const seen = written.map((c) => c.name).join(", ") || "(none)";

if (!session) {
  check("session cookie written after signUp", false, `names seen: ${seen}`);
  console.log(
    "\nINFO  'Confirm email' appears to be ON — no session cookie is issued."
  );
  console.log("INFO  Turn it OFF in Supabase Auth settings and re-run.");
} else {
  check("session cookie written after signUp", true, session.name);
  check(
    "cookie name matches the derived name exactly",
    session.name === sessionKey,
    session.name === sessionKey ? "" : `expected ${sessionKey}, got ${session.name}`
  );

  const httpOnly = session.options.httpOnly === true;
  check(
    "HttpOnly is ABSENT (island can read it)",
    !httpOnly,
    httpOnly
      ? "HttpOnly=true — the marketing auth island would fail silently"
      : "httpOnly=false"
  );
  check(
    "Path=/",
    (session.options.path ?? "/") === "/",
    `path=${session.options.path ?? "(unset)"}`
  );
  const sameSite = String(session.options.sameSite ?? "").toLowerCase();
  check(
    "SameSite=lax",
    sameSite === "lax",
    `sameSite=${session.options.sameSite ?? "(unset)"}`
  );
  console.log(`INFO  full options  ${JSON.stringify(session.options)}`);
}

console.log(
  `\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`
);

// Let Node drain its keep-alive sockets naturally. Calling process.exit() here
// races undici's handle teardown and trips a libuv assertion on Windows.
try {
  client.removeAllChannels?.();
} catch {
  /* no realtime channels were opened */
}
process.exitCode = failures === 0 ? 0 : 1;
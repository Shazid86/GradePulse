import { describe, expect, it } from "vitest";

import {
  hasSessionCookie,
  missingCookieWarning,
  sessionCookieName,
} from "./session-cookie";

const URL_BASE = "https://abcdefghijklmnop.supabase.co";
const NAME = "sb-abcdefghijklmnop-auth-token";

describe("sessionCookieName", () => {
  it("derives the Supabase storage key from the project URL", () => {
    expect(sessionCookieName(URL_BASE)).toBe(NAME);
  });

  it("tolerates a trailing path or query on the URL", () => {
    expect(sessionCookieName(`${URL_BASE}/auth/v1?x=1`)).toBe(NAME);
  });

  it("returns null when unconfigured or malformed", () => {
    expect(sessionCookieName(undefined)).toBeNull();
    expect(sessionCookieName("")).toBeNull();
    expect(sessionCookieName("not a url")).toBeNull();
  });
});

describe("hasSessionCookie", () => {
  it("finds the session cookie among other cookies", () => {
    expect(hasSessionCookie(`theme=dark; ${NAME}=base64-abc; x=1`, NAME)).toBe(true);
  });

  it("finds a chunked session cookie (.0, .1 …)", () => {
    expect(hasSessionCookie(`a=1; ${NAME}.0=part0; ${NAME}.12=part12`, NAME)).toBe(true);
  });

  it("is not fooled by PKCE code-verifier siblings", () => {
    const decoys = [
      `${NAME}-code-verifier`,
      `${NAME}-flows-code-verifier`,
      `${NAME}-flow-abc12345-code-verifier`,
    ];
    for (const decoy of decoys) {
      expect(hasSessionCookie(`sb-other=1; ${decoy}=xyz`, NAME)).toBe(false);
    }
  });

  it("rejects a non-numeric chunk suffix", () => {
    expect(hasSessionCookie(`${NAME}.part=1`, NAME)).toBe(false);
  });

  it("handles empty input and an empty expected name", () => {
    expect(hasSessionCookie("", NAME)).toBe(false);
    expect(hasSessionCookie(`${NAME}=x`, "")).toBe(false);
  });

  it("matches a cookie with no value yet", () => {
    expect(hasSessionCookie(`${NAME}=`, NAME)).toBe(true);
  });

  it("does not match a different project's session", () => {
    expect(hasSessionCookie("sb-zzzzzzzzzzzzzzzz-auth-token=x", NAME)).toBe(false);
  });
});

describe("missingCookieWarning", () => {
  it("names the expected cookie so the cause is actionable", () => {
    const msg = missingCookieWarning(NAME);
    expect(msg).toContain(NAME);
    expect(msg).toContain("verify:auth-cookie");
  });
});
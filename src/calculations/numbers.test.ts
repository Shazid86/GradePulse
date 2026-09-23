import { describe, expect, it } from "vitest";
import { roundTo, toFiniteNumber } from "./numbers";

describe("roundTo", () => {
  it("eliminates floating-point artifacts", () => {
    expect(roundTo(79.999999999, 2)).toBe(80);
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
    expect(roundTo(0.1 + 0.2)).toBe(0.3);
  });

  it("rounds to 6 decimals by default", () => {
    expect(roundTo(79.0123456789)).toBe(79.012346);
    expect(roundTo(2 / 3, 6)).toBe(0.666667);
  });

  it("returns +0 (never -0) for near-zero values", () => {
    expect(Object.is(roundTo(-0.0000001), 0)).toBe(true);
    expect(Object.is(roundTo(-0), 0)).toBe(true);
  });

  it("guards non-finite input", () => {
    expect(roundTo(Number.NaN)).toBe(0);
    expect(roundTo(Number.POSITIVE_INFINITY)).toBe(0);
    expect(roundTo(Number.NEGATIVE_INFINITY, 3)).toBe(0);
  });
});

describe("toFiniteNumber", () => {
  it("passes finite numbers through", () => {
    expect(toFiniteNumber(42.5)).toBe(42.5);
  });

  it("coerces numeric strings", () => {
    expect(toFiniteNumber("12.75")).toBe(12.75);
  });

  it("converts garbage to 0", () => {
    expect(toFiniteNumber(Number.NaN)).toBe(0);
    expect(toFiniteNumber("abc")).toBe(0);
    expect(toFiniteNumber(null)).toBe(0);
    expect(toFiniteNumber(undefined)).toBe(0);
  });
});

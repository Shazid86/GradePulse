import { describe, expect, it } from "vitest";
import { daysUntil, formatCountdown, todayIso } from "./dates";

describe("todayIso", () => {
  it("formats local dates as YYYY-MM-DD", () => {
    expect(todayIso(new Date(2026, 8, 28))).toBe("2026-09-28"); // month is 0-based
    expect(todayIso(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("daysUntil", () => {
  it("counts same-day as 0 and tomorrow as 1", () => {
    expect(daysUntil("2026-09-28", "2026-09-28")).toBe(0);
    expect(daysUntil("2026-09-29", "2026-09-28")).toBe(1);
  });

  it("crosses month and year boundaries correctly", () => {
    expect(daysUntil("2026-10-01", "2026-09-30")).toBe(1);
    expect(daysUntil("2027-01-01", "2026-12-31")).toBe(1);
    expect(daysUntil("2027-03-01", "2026-03-01")).toBe(365); // non-leap span
  });

  it("is DST-safe (pure date arithmetic)", () => {
    // US DST spring-forward 2026-03-08; date-only math must be exact.
    expect(daysUntil("2026-03-09", "2026-03-07")).toBe(2);
    // Fall-back 2026-11-01
    expect(daysUntil("2026-11-02", "2026-10-31")).toBe(2);
  });

  it("returns negative values for past dates", () => {
    expect(daysUntil("2026-09-27", "2026-09-28")).toBe(-1);
    expect(daysUntil("2026-08-28", "2026-09-28")).toBe(-31);
  });

  it("rejects invalid or impossible dates", () => {
    expect(daysUntil("not-a-date", "2026-09-28")).toBeNull();
    expect(daysUntil("2026-02-31", "2026-02-01")).toBeNull(); // rolls over
    expect(daysUntil("2026-09-28", "garbage")).toBeNull();
    expect(daysUntil("28/09/2026")).toBeNull();
  });
});

describe("formatCountdown", () => {
  it("labels the human-readable countdown", () => {
    expect(formatCountdown(0)).toBe("Today");
    expect(formatCountdown(1)).toBe("Tomorrow");
    expect(formatCountdown(5)).toBe("In 5 days");
    expect(formatCountdown(-1)).toBe("1 day ago");
    expect(formatCountdown(-3)).toBe("3 days ago");
    expect(formatCountdown(null)).toBe("Date unknown");
  });
});

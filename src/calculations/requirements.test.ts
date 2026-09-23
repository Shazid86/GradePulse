import { describe, expect, it } from "vitest";
import {
  requiredMarks,
  requiredRemainingPercentage,
  targetMarks,
} from "./requirements";

describe("targetMarks", () => {
  it("expresses the target in course marks", () => {
    expect(targetMarks(80, 100)).toBe(80);
    expect(targetMarks(85, 200)).toBe(170);
    expect(targetMarks(50, 0)).toBe(0);
  });

  it("clamps targets to [0, 100]%", () => {
    expect(targetMarks(150, 100)).toBe(100);
    expect(targetMarks(-10, 100)).toBe(0);
  });
});

describe("requiredMarks (§14)", () => {
  it("spec example: current 61, target 80% of 100 → 19", () => {
    expect(
      requiredMarks({ securedMarks: 61, targetPercentage: 80, totalMarks: 100 })
    ).toBe(19);
  });

  it("returns 0 when the target is already achieved", () => {
    expect(
      requiredMarks({ securedMarks: 90, targetPercentage: 80, totalMarks: 100 })
    ).toBe(0);
    expect(
      requiredMarks({ securedMarks: 80, targetPercentage: 80, totalMarks: 100 })
    ).toBe(0);
  });

  it("handles decimal secured marks", () => {
    expect(
      requiredMarks({
        securedMarks: 61.5,
        targetPercentage: 80,
        totalMarks: 100,
      })
    ).toBe(18.5);
  });

  it("handles a zero total", () => {
    expect(
      requiredMarks({ securedMarks: 0, targetPercentage: 80, totalMarks: 0 })
    ).toBe(0);
  });
});

describe("requiredRemainingPercentage (§12)", () => {
  it("spec example: 19/40 → 47.5%", () => {
    expect(requiredRemainingPercentage({ required: 19, remaining: 40 })).toBe(
      47.5
    );
  });

  it("returns 0 when nothing is required", () => {
    expect(requiredRemainingPercentage({ required: 0, remaining: 40 })).toBe(0);
    expect(
      requiredRemainingPercentage({ required: -5, remaining: 40 })
    ).toBe(0);
  });

  it("returns 0 instead of Infinity when nothing remains", () => {
    expect(requiredRemainingPercentage({ required: 19, remaining: 0 })).toBe(0);
  });

  it("exceeds 100 when the target requires more than remains (impossible)", () => {
    expect(requiredRemainingPercentage({ required: 60, remaining: 40 })).toBe(
      150
    );
  });

  it("handles decimal inputs without artifacts", () => {
    expect(
      requiredRemainingPercentage({ required: 18.5, remaining: 38.5 })
    ).toBe(48.051948); // 18.5/38.5 = 0.4805194805…
  });
});

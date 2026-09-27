import { percentage } from "@/calculations/score";
import { parseGradingScale } from "@/calculations/grading";

export interface TargetPreset {
  label: string;
  percentage: number;
  kind: "preset";
  /** Letter shown in grade columns later; null for Pass/Custom. */
  gradeLabel: string | null;
}

interface CourseShape {
  passing_marks: number | string;
  total_marks: number | string;
  grading_scale: unknown;
}

/**
 * Data-driven target presets (spec §14):
 * - "Pass" derives from the course's own passing marks (never hard-coded);
 * - letter presets (B, A-, …) come from the course grading_scale jsonb —
 *   they appear automatically once the scale is configured (Phase 6);
 * - Custom percentage is offered by the dialog itself.
 */
export function buildTargetPresets(course: CourseShape): TargetPreset[] {
  const presets: TargetPreset[] = [];
  const total = Number(course.total_marks);
  const passing = Number(course.passing_marks);

  if (total > 0 && passing > 0) {
    presets.push({
      label: "Pass",
      percentage: percentage(passing, total),
      kind: "preset",
      gradeLabel: null,
    });
  }

  for (const entry of parseGradingScale(course.grading_scale)) {
    presets.push({
      label: entry.grade,
      percentage: entry.min_percentage,
      kind: "preset",
      gradeLabel: entry.grade,
    });
  }

  return presets;
}

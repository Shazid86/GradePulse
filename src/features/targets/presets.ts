import { percentage } from "@/calculations/score";

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

  const scale = course.grading_scale;
  if (Array.isArray(scale)) {
    for (const entry of scale) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as { grade?: unknown; min_percentage?: unknown };
      const min = Number(e.min_percentage);
      if (
        typeof e.grade === "string" &&
        e.grade.trim() &&
        Number.isFinite(min) &&
        min > 0 &&
        min <= 100
      ) {
        presets.push({
          label: e.grade.trim().slice(0, 12),
          percentage: min,
          kind: "preset",
          gradeLabel: e.grade.trim().slice(0, 12),
        });
      }
    }
  }

  return presets;
}

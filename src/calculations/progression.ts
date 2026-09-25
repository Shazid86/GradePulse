import { roundTo } from "./numbers";

/**
 * Assessment progression (spec §16): chronological cumulative secured marks.
 * Each completed assessment contributes  obtained / Σ maximum(all defined in
 * its category) × category weight  — exactly the category model in score.ts,
 * so the final cumulative value equals the course's securedMarks whenever
 * every completed assessment carries a date.
 */

export interface ProgressionPoint {
  date: string;
  title: string;
  /** Course marks earned by this assessment. */
  contribution: number;
  /** Running total of secured course marks after this assessment. */
  cumulative: number;
}

interface CourseShape {
  totalMarks: number;
}
interface CategoryShape {
  id: string;
  weight: number;
}
interface AssessShape {
  category_id: string;
  title: string;
  date: string | null;
  obtained_marks: number | null;
  maximum_marks: number;
  status: "pending" | "completed";
}

export function calculateAssessmentProgression(input: {
  course: CourseShape;
  categories: CategoryShape[];
  assessments: AssessShape[];
}): ProgressionPoint[] {
  const weights = new Map(input.categories.map((c) => [c.id, c.weight]));

  // Σ maximum across ALL defined assessments per category (the model's
  // denominator), computed before filtering to completed items.
  const definedMax = new Map<string, number>();
  for (const a of input.assessments) {
    if (a.maximum_marks > 0) {
      definedMax.set(
        a.category_id,
        (definedMax.get(a.category_id) ?? 0) + a.maximum_marks
      );
    }
  }

  const graded = input.assessments
    .filter(
      (a) =>
        a.status === "completed" && a.obtained_marks !== null && !!a.date
    )
    .sort((a, b) => ((a.date as string) < (b.date as string) ? -1 : 1));

  let cumulative = 0;
  const points: ProgressionPoint[] = [];
  for (const a of graded) {
    const weight = weights.get(a.category_id) ?? 0;
    const max = definedMax.get(a.category_id) ?? 0;
    const obtained = a.obtained_marks ?? 0;
    const contribution =
      max > 0 && weight > 0 ? roundTo((obtained / max) * weight) : 0;
    cumulative = roundTo(cumulative + contribution);
    points.push({
      date: a.date as string,
      title: a.title,
      contribution,
      cumulative: Math.min(cumulative, Math.max(0, input.course.totalMarks)),
    });
  }
  return points;
}
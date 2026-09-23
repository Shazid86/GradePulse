/**
 * Row types for the GradePulse database schema.
 * Mirrors supabase/migrations/0001_initial_schema.sql.
 * All rows are owned by a user via `user_id` and protected by RLS.
 */

export type SemesterStatus = "upcoming" | "active" | "completed";

export type AssessmentStatus = "pending" | "completed";

export type TargetKind = "preset" | "custom";

export interface Timestamps {
  created_at: string;
  updated_at: string;
}

export interface SemesterRow extends Timestamps {
  id: string;
  user_id: string;
  name: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  status: SemesterStatus;
}

export interface CourseRow extends Timestamps {
  id: string;
  user_id: string;
  semester_id: string;
  name: string;
  code: string;
  credits: number;
  instructor: string | null;
  total_marks: number;
  passing_marks: number;
  /** Configurable grade → grade-point scale, e.g. [{ grade, min_percentage, grade_point }] */
  grading_scale: unknown[];
}

export interface AssessmentCategoryRow extends Timestamps {
  id: string;
  user_id: string;
  course_id: string;
  name: string;
  /** Course marks this category contributes (e.g. Class Tests = 20). */
  weight: number;
  sort_order: number;
  /** Aggregation rule for multiple assessments inside the category. */
  aggregation: string;
}

export interface AssessmentRow extends Timestamps {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  /** Null while an assessment is pending/ungraded. */
  obtained_marks: number | null;
  maximum_marks: number;
  date: string | null;
  notes: string | null;
  status: AssessmentStatus;
}

export interface TargetRow extends Timestamps {
  id: string;
  user_id: string;
  course_id: string;
  /** e.g. "Pass", "A-", "Custom" */
  label: string;
  /** Target percentage in (0, 100]. */
  percentage: number;
  grade_label: string | null;
  kind: TargetKind;
}

export interface AcademicEventRow extends Timestamps {
  id: string;
  user_id: string;
  course_id: string;
  title: string;
  event_date: string;
  /** App-validated: CT, Quiz, Assignment, Midterm, Final, Presentation, Viva, Project, Custom... */
  type: string;
  notes: string | null;
  is_completed: boolean;
}

import { z } from "zod";
import { dateStringSchema, uuidSchema } from "@/validations/common";

/** Default event types (spec §20) — "Custom" allows a free-text type. */
export const EVENT_TYPES = [
  "CT",
  "Quiz",
  "Assignment",
  "Midterm",
  "Final",
  "Presentation",
  "Viva",
  "Project",
  "Custom",
] as const;

export const eventFormSchema = z.object({
  course_id: uuidSchema("course"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(160, "Title must be at most 160 characters."),
  event_date: dateStringSchema,
  // Allowed list for selects, but free text stays possible (spec §20
  // explicitly includes "Custom" — schema keeps type open, max 40).
  type: z
    .string()
    .trim()
    .min(1, "Type is required.")
    .max(40, "Type must be at most 40 characters."),
  notes: z
    .string()
    .trim()
    .max(2000, "Notes must be at most 2000 characters.")
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  // Completion can be set straight from the form (optional: untouched = keep).
  is_completed: z.boolean().optional(),
});

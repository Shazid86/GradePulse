import { z } from "zod";
import { dateStringSchema, uuidSchema } from "@/validations/common";

export const assessmentStatusSchema = z.enum(["pending", "completed"]);

const optionalDateString = dateStringSchema.optional().nullable();

export const assessmentFormSchema = z
  .object({
    category_id: uuidSchema("category"),
    title: z
      .string()
      .trim()
      .min(1, "Title is required.")
      .max(160, "Title must be at most 160 characters."),
    maximum_marks: z.coerce
      .number({ message: "Maximum marks must be a number." })
      .positive("Maximum marks must be greater than 0.")
      .max(10000, "Maximum marks must be 10000 or less."),
    // Normalized to null before parsing (empty input → not yet graded).
    obtained_marks: z.union([
      z.null(),
      z.coerce
        .number({ message: "Obtained marks must be a number." })
        .min(0, "Obtained marks cannot be negative.")
        .max(10000, "Obtained marks must be 10000 or less."),
    ]),
    date: optionalDateString,
    notes: z
      .string()
      .trim()
      .max(2000, "Notes must be at most 2000 characters.")
      .optional()
      .nullable()
      .transform((v) => (v ? v : null)),
    status: assessmentStatusSchema,
  })
  .refine(
    (d) => d.obtained_marks === null || d.obtained_marks <= d.maximum_marks,
    {
      message: "Obtained marks cannot exceed maximum marks.",
      path: ["obtained_marks"],
    }
  )
  .refine(
    (d) => !(d.status === "completed" && d.obtained_marks === null),
    {
      message: "Add the obtained marks before marking as completed.",
      path: ["obtained_marks"],
    }
  );

/** "" from optional inputs → null before schema validation. */
export function emptyToNull(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
}

import { z } from "zod";
import { dateStringSchema } from "@/validations/common";

export const semesterStatusSchema = z.enum([
  "upcoming",
  "active",
  "completed",
]);

export const semesterFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Semester name is required.")
      .max(120, "Name must be at most 120 characters."),
    academic_year: z
      .string()
      .trim()
      .min(1, "Academic year is required.")
      .max(40, "Academic year must be at most 40 characters."),
    start_date: dateStringSchema,
    end_date: dateStringSchema,
    status: semesterStatusSchema,
  })
  .refine((d) => Date.parse(d.end_date) >= Date.parse(d.start_date), {
    message: "End date must be on or after the start date.",
    path: ["end_date"],
  });

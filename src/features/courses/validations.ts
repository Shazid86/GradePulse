import { z } from "zod";
import { uuidSchema } from "@/validations/common";

export const courseFormSchema = z
  .object({
    semester_id: uuidSchema("semester"),
    name: z
      .string()
      .trim()
      .min(1, "Course name is required.")
      .max(160, "Name must be at most 160 characters."),
    code: z
      .string()
      .trim()
      .min(1, "Course code is required.")
      .max(40, "Code must be at most 40 characters."),
    credits: z.coerce
      .number({ message: "Credits must be a number." })
      .positive("Credits must be greater than 0.")
      .max(30, "Credits must be 30 or less."),
    instructor: z
      .string()
      .trim()
      .max(120, "Instructor must be at most 120 characters.")
      .optional()
      .transform((v) => (v ? v : null)),
    total_marks: z.coerce
      .number({ message: "Total marks must be a number." })
      .positive("Total marks must be greater than 0.")
      .max(10000, "Total marks must be 10000 or less."),
    passing_marks: z.coerce
      .number({ message: "Passing marks must be a number." })
      .min(0, "Passing marks cannot be negative.")
      .max(10000, "Passing marks must be 10000 or less."),
  })
  .refine((d) => d.passing_marks <= d.total_marks, {
    message: "Passing marks cannot exceed total marks.",
    path: ["passing_marks"],
  });

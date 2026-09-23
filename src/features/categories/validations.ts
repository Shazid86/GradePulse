import { z } from "zod";
import { uuidSchema } from "@/validations/common";

export const categoryFormSchema = z.object({
  course_id: uuidSchema("course"),
  name: z
    .string()
    .trim()
    .min(1, "Category name is required.")
    .max(80, "Name must be at most 80 characters."),
  weight: z.coerce
    .number({ message: "Weight must be a number." })
    .min(0, "Weight cannot be negative.")
    .max(10000, "Weight must be 10000 or less."),
});

import { z } from "zod";
import { uuidSchema } from "@/validations/common";

export const targetFormSchema = z.object({
  course_id: uuidSchema("course"),
  kind: z.enum(["preset", "custom"]),
  label: z
    .string()
    .trim()
    .min(1, "Give the target a name.")
    .max(40, "Name must be at most 40 characters."),
  percentage: z.coerce
    .number({ message: "Percentage must be a number." })
    .positive("Target must be greater than 0%.")
    .max(100, "Target cannot exceed 100%."),
});

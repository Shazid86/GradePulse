import { z } from "zod";

/** Shared validation primitives for all feature schemas. */

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidSchema = (label = "id") =>
  z.string().regex(UUID_PATTERN, `Invalid ${label}.`);

/** Strict YYYY-MM-DD date strings (HTML date inputs). */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Use a valid date.");

/** First zod issue message (server-action friendly). */
export function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

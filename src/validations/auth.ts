import { z } from "zod";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .max(254, "Email is too long.")
    .regex(EMAIL_PATTERN, "Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const signUpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .max(254, "Email is too long.")
      .regex(EMAIL_PATTERN, "Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password must be at most 72 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/**
 * Sanitizes a post-auth redirect target to prevent open redirects.
 * Allows only same-origin absolute paths (e.g. "/dashboard?tab=marks").
 */
export function sanitizeNextPath(next: string | null | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) {
    return next;
  }
  return "/";
}

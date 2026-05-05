import { z } from "zod";
import { strongPasswordSchema } from "@/validators/auth";

const profileUsernameSchema = z
  .string()
  .trim()
  .max(30, "Username must be 30 characters or less.")
  .refine(
    (value) => value === "" || /^[A-Za-z0-9_]{3,30}$/.test(value),
    "Username must be 3-30 characters and use only letters, numbers, or underscores.",
  )
  .transform((value) => value.toLowerCase());

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  username: profileUsernameSchema,
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;

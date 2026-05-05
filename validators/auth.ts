import { z } from "zod";

export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[0-9]/, "Password must include a number.")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character.");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(30, "Username must be 30 characters or less.")
  .regex(
    /^[A-Za-z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores.",
  )
  .transform((value) => value.toLowerCase());

export const optionalUsernameSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.union([z.literal(""), usernameSchema]))
  .transform((value) => (value === "" ? undefined : value));

export const signInSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or username."),
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters.")
      .max(40, "First name must be 40 characters or less."),
    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters.")
      .max(40, "Last name must be 40 characters or less."),
    username: optionalUsernameSchema,
    email: z.string().trim().email("Please enter a valid email address."),
    password: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignInFormValues = z.infer<typeof signInSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

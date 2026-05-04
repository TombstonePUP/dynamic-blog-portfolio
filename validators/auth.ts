import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type AuthFormValues = z.infer<typeof authSchema>;

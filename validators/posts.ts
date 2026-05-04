import { normalizeSlug } from "@/features/posts/lib/post-documents";
import { z } from "zod";

export const postSlugSchema = z
  .string()
  .trim()
  .min(1, "Story slug is required.")
  .transform(normalizeSlug)
  .refine((value) => value.length > 0, "Story slug is required.");

export const postContentSchema = z
  .string()
  .min(1, "Story content cannot be empty.");

export function parsePostSlug(value: string) {
  return postSlugSchema.parse(value);
}

export function parsePostContent(value: string) {
  return postContentSchema.parse(value);
}

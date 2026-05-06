import type { Tag } from "@/features/posts/types";

export const MAIN_CATEGORIES: Tag[] = [
  "movie Review",
  "personal blog",
  "what's your worry?",
  "why positive psychology?",
  "advice",
];

export const ALL_TAGS: Tag[] = [
  "featured",
  "movie Review",
  "personal blog",
  "what's your worry?",
  "why positive psychology?",
  "advice",
  "career search",
  "character strengths",
  "coping this new normal",
  "coping through planting trees",
  "coronavirus",
  "covid-19 UK variant in the Philippines",
  "golem effect",
  "graduates of 2023",
  "gratitude",
  "how to handle romantic rejection",
  "How to increase self-confidence",
  "industrial psychology",
  "job hunting",
  "love at first chat",
  "love or infatuation this new normal",
  "my crush landing on you",
  "newly graduate",
  "new normal",
  "parenting",
  "parenting this pandemic",
  "parenting tips",
  "plantitas",
  "plantitos",
  "positiveparenting",
  "positive psychology",
  "Positive psychology goals is to boost our strengths",
  "quiet cracking",
  "quranflings",
  "relationship",
  "self-care",
  "self-care for drug users",
  "self-confidence",
  "self-forgiveness",
  "signs of quiet cracking",
  "teenage relationship",
  "wearing is caring",
  "workplace",
];

export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugToTag(slug: string): Tag | undefined {
  return ALL_TAGS.find((tag) => tagToSlug(tag) === slug);
}

export function readingMinutesFromContent(paragraphs: string[] | string) {
  const text = Array.isArray(paragraphs) ? paragraphs.join(" ") : paragraphs;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

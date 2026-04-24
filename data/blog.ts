import type { Author, Blog, Tag } from "@/types/blog";

// ─── Authors ────────────────────────────────────────────────────────────────

export const AUTHORS: Record<string, Author> = {
  ian: {
    name: "Ian Llenares",
    slug: "ian",
    role: "Founder & Lead Writer",
    image: "/images/blog/Ian-L-1024x1024.jpg",
    social: {
      x: "https://x.com/ianllenares",
      linkedin: "https://linkedin.com/in/ianllenares",
      instagram: "https://instagram.com/ianllenares",
      github: "https://github.com/ianllenares",
      youtube: "https://youtube.com/ianllenares",
      tiktok: "https://tiktok.com/ianllenares",
    },
  },
  johndoe: {
    name: "John Doe",
    slug: "johndoe",
    role: "Guest Contributor",
    image: "/images/blog/unsplash-1472099645785-5658abf4ff4e.jpg",
    social: {
      x: "https://x.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
    },
  },
  janedoe: {
    name: "Jane Doe",
    slug: "janedoe",
    role: "Editorial Assistant",
    image: "/images/blog/unsplash-1438761681033-6461ffad8d80.jpg",
    social: {
      instagram: "https://instagram.com/janedoe",
      tiktok: "https://tiktok.com/janedoe",
    },
  },
} as const;

// ─── Tags ────────────────────────────────────────────────────────────────────

export const MAIN_CATEGORIES: Tag[] = [
  "movie Review",
  "personal blog",
  "what's your worry?",
  "why positive psychology?",
  "advice",
];

export const ALL_TAGS: Tag[] = [
  // Categories
  "featured",
  "movie Review",
  "personal blog",
  "what's your worry?",
  "why positive psychology?",
  "advice",
  // SubTags
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

/** Convert a tag label into a URL-safe slug (spaces → hyphens, lowercase) */
export function tagToSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Reverse a slug back to the original Tag, or undefined if not found */
export function slugToTag(slug: string): Tag | undefined {
  return ALL_TAGS.find((t) => tagToSlug(t) === slug);
}

export function readingMinutesFromContent(paragraphs: string[] | string): number {
  const text = Array.isArray(paragraphs) ? paragraphs.join(" ") : paragraphs;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}


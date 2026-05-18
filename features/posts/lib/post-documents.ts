import matter from "gray-matter";
import type { BlogStatus } from "@/features/posts/types";
import {
  dedupeTaxonomyValues,
  normalizeTaxonomyName,
} from "@/features/posts/lib/taxonomy";

export type EditorPostDocument = {
  title: string;
  date: string;
  author: string;
  image: string;
  excerpt: string;
  topic: string;
  tags: string[];
  status: BlogStatus;
  body: string;
};

export function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return dedupeTaxonomyValues(value);
  }

  if (typeof value === "string") {
    return dedupeTaxonomyValues(value.split(","));
  }

  return [];
}

export function normalizeTopic(value: unknown, tags: string[] = []): string {
  const topic = normalizeTaxonomyName(value);

  if (topic) {
    return topic;
  }

  return tags.find((tag) => tag.toLowerCase() !== "featured") || "";
}

export function normalizeStatus(value: unknown): BlogStatus {
  if (value === "published" || value === "archived") {
    return value;
  }

  return "draft";
}

export function toIsoDate(value: unknown, fallback = new Date()) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }

  const parsed = value instanceof Date ? value : new Date(String(value ?? ""));
  if (Number.isNaN(parsed.getTime())) {
    return fallback.toISOString().slice(0, 10);
  }

  return parsed.toISOString().slice(0, 10);
}

export function parseEditorDocument(rawDocument: string): EditorPostDocument {
  const { data, content } = matter(rawDocument);
  const image =
    typeof data.image === "string" && data.image.trim()
      ? data.image.trim()
      : typeof data.thumbnail === "string" && data.thumbnail.trim()
        ? data.thumbnail.trim()
        : "";

  const tags = normalizeTags(data.tags);

  return {
    title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : "Untitled story",
    date: toIsoDate(data.date),
    author: typeof data.author === "string" && data.author.trim() ? data.author.trim() : "author",
    image,
    excerpt: typeof data.excerpt === "string" ? data.excerpt.trim() : "",
    topic: normalizeTopic(data.topic, tags),
    tags,
    status: normalizeStatus(data.status),
    body: content.trim(),
  };
}

export function buildEditorDocument(document: EditorPostDocument) {
  return matter.stringify(document.body, {
    title: document.title,
    date: document.date,
    author: document.author,
    image: document.image,
    excerpt: document.excerpt,
    topic: document.topic,
    tags: document.tags,
    status: document.status,
  });
}

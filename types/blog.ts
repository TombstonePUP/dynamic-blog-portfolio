export type Tag =
  | "featured"
  | "latest"
  | "movie Review"
  | "personal blog"
  | "what's your worry?"
  | "why positive psychology?"
  | "advice";

export interface Author {
  name: string;
  slug: string;
  role?: string;
  image?: string;
  link?: string;
  social?: {
    x?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
    youtube?: string;
    tiktok?: string;
  }
}

export interface Blog {
  id: number;
  slug: string;
  title: string;
  href: string;
  /** Full-size image URL */
  image: string;
  /** Thumbnail image URL (150x150) */
  thumbnail: string;
  author: Author;
  /** ISO 8601 date string e.g. "2025-08-13" */
  date: string;
  /** Human-readable date e.g. "August 13, 2025" */
  dateLabel: string;
  tags: Tag[];
  excerpt: string;
  /** Article body as plain-text paragraphs (rendered as prose) */
  content: string[];
  commentCount: number;
  comments?: Comment[];
}

export type Comment = {
  id: number;
  author: string;
  date: string;
  dateLabel: string;
  body: string;
};
export type Category =
  | "featured"
  | "movie Review"
  | "personal blog"
  | "what's your worry?"
  | "why positive psychology?";

export type SubTag =
  | "career search"
  | "character strengths"
  | "coping this new normal"
  | "coping through planting trees"
  | "coronavirus"
  | "covid-19 UK variant in the Philippines"
  | "golem effect"
  | "graduates of 2023"
  | "gratitude"
  | "how to handle romantic rejection"
  | "How to increase self-confidence"
  | "industrial psychology"
  | "job hunting"
  | "love at first chat"
  | "love or infatuation this new normal"
  | "my crush landing on you"
  | "newly graduate"
  | "new normal"
  | "parenting"
  | "parenting this pandemic"
  | "parenting tips"
  | "personal blog"
  | "plantitas"
  | "plantitos"
  | "positiveparenting"
  | "positive psychology"
  | "Positive psychology goals is to boost our strengths"
  | "quiet cracking"
  | "quranflings"
  | "relationship"
  | "self-care"
  | "self-care for drug users"
  | "self-confidence"
  | "self-forgiveness"
  | "signs of quiet cracking"
  | "teenage relationship"
  | "wearing is caring"
  | "workplace";

export type Tag = Category | SubTag | "latest" | "advice";

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
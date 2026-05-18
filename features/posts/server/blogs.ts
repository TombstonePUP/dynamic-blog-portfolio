import {
  listPublicProfilesByIds,
  type PublicProfileRecord,
} from "@/db/queries/profiles";
import { listPublishedPosts, type PublishedPostRow } from "@/db/queries/posts";
import { createClient } from "@/db/supabase/server";
import {
  resolvePostAssetUrl,
  rewritePostAssetUrls,
} from "@/features/posts/lib/post-assets";
import type { Author, Blog } from "@/features/posts/types";
import type { TopicRecord } from "@/db/queries/taxonomy";

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function resolveAuthor(
  row: PublishedPostRow,
  profile?: PublicProfileRecord | null,
): Author {
  return {
    id: profile?.id,
    name: row.author_name || profile?.display_name || "Author",
    slug: row.author_slug || profile?.slug || "author",
    role: row.author_role || profile?.role || "Writer",
    image:
      sanitizeDisplayImageUrl(row.author_avatar_url) ||
      sanitizeDisplayImageUrl(profile?.avatar_url) ||
      undefined,
  };
}

function sanitizeDisplayImageUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.startsWith("./") || trimmed.startsWith("/images/")) {
    return null;
  }

  return trimmed;
}

function normalizeTopicRecord(
  topic: TopicRecord | TopicRecord[] | null,
): TopicRecord | null {
  return Array.isArray(topic) ? (topic[0] || null) : topic;
}

function mapSupabasePost(
  row: PublishedPostRow,
  profile?: PublicProfileRecord | null,
): Blog {
  const date = row.published_on || row.created_at.slice(0, 10);
  const assetFolder = row.asset_folder || row.slug;
  const contentMdx = rewritePostAssetUrls(assetFolder, row.content_mdx);
  const imageUrl = sanitizeDisplayImageUrl(
    resolvePostAssetUrl(assetFolder, row.image_url),
  );
  const topic = normalizeTopicRecord(row.topics);

  return {
    id: row.id,
    source: "supabase",
    assetFolder,
    slug: row.slug,
    title: row.title,
    href: `/${row.slug}`,
    image: imageUrl,
    thumbnail: imageUrl,
    author: resolveAuthor(row, profile),
    date,
    dateLabel: formatDateLabel(date),
    tags: row.tags || [],
    topic: topic
      ? {
          id: topic.id,
          name: topic.name,
          slug: topic.slug,
        }
      : null,
    excerpt: row.excerpt || "",
    content: contentMdx.split(/\n\s*\n/).filter(Boolean),
    contentMdx,
    commentCount: 0,
    status: row.status,
  };
}

async function getPublishedSupabaseBlogs(): Promise<Blog[]> {
  const supabase = await createClient();
  const posts = await listPublishedPosts(supabase);

  const authorIds = [
    ...new Set(
      posts
        .map((post) => post.author_id)
        .filter((authorId): authorId is string => Boolean(authorId)),
    ),
  ];
  let profiles: PublicProfileRecord[] = [];

  if (authorIds.length > 0) {
    profiles = await listPublicProfilesByIds(supabase, authorIds);
  }

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  return posts.map((post) =>
    mapSupabasePost(post, profilesById.get(post.author_id)),
  );
}

export async function getBlogs(): Promise<Blog[]> {
  const blogs = await getPublishedSupabaseBlogs();

  return [...blogs].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

export async function getBlogBySlug(slug: string): Promise<Blog | undefined> {
  const blogs = await getBlogs();
  return blogs.find((blog) => blog.slug === slug);
}

export async function getRelatedBlogs(post: Blog, limit = 3): Promise<Blog[]> {
  const blogs = await getBlogs();
  const postTags = new Set(post.tags.filter((tag) => tag !== "featured"));

  return [...blogs]
    .filter((blog) => blog.slug !== post.slug)
    .filter((blog) =>
      blog.tags.some((tag) => tag !== "featured" && postTags.has(tag)),
    )
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, limit);
}

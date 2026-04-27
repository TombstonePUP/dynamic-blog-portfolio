import { AUTHORS } from "@/data/blog";
import type { Author, Blog, BlogStatus } from "@/types/blog";
import { createClient } from "@/utils/supabase/server";
import { getAllPosts } from "./mdx";

type PostRow = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_mdx: string;
  cover_image_url: string | null;
  thumbnail_url: string | null;
  status: BlogStatus;
  tags: string[] | null;
  published_on: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  slug: string | null;
  role: string | null;
  avatar_url: string | null;
};

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function resolveLegacyImagePath(slug: string, value: string) {
  if (value.startsWith("./")) {
    return `/images/posts/${slug}/${value.slice(2)}`;
  }

  return value;
}

function resolveAuthor(profile?: ProfileRow | null): Author {
  if (!profile) {
    return {
      name: "Author",
      slug: "author",
      role: "Writer",
    };
  }

  return {
    id: profile.id,
    name: profile.display_name || "Author",
    slug: profile.slug || "author",
    role: profile.role || "Writer",
    image: profile.avatar_url || undefined,
  };
}

function mapSupabasePost(row: PostRow, profile?: ProfileRow | null): Blog {
  const date = row.published_on || row.created_at.slice(0, 10);

  return {
    id: row.id,
    source: "supabase",
    slug: row.slug,
    title: row.title,
    href: `/blog/${row.slug}`,
    image: row.cover_image_url || "/images/blog/unsplash-1499750310107-5fef28a66643.jpg",
    thumbnail:
      row.thumbnail_url ||
      row.cover_image_url ||
      "/images/blog/unsplash-1499750310107-5fef28a66643.jpg",
    author: resolveAuthor(profile),
    date,
    dateLabel: formatDateLabel(date),
    tags: row.tags || [],
    excerpt: row.excerpt || "",
    content: row.content_mdx.split(/\n\s*\n/).filter(Boolean),
    contentMdx: row.content_mdx,
    commentCount: 0,
    status: row.status,
  };
}

function getLegacyBlogs(): Blog[] {
  return getAllPosts().map((post) => {
    const { frontmatter, slug } = post;
    const authorKey =
      typeof frontmatter.author === "string" && frontmatter.author in AUTHORS
        ? (frontmatter.author as keyof typeof AUTHORS)
        : "ian";
    const date =
      typeof frontmatter.date === "string"
        ? frontmatter.date
        : new Date().toISOString().slice(0, 10);

    return {
      id: `mdx:${slug}`,
      source: "mdx",
      slug,
      title: String(frontmatter.title ?? slug),
      href: `/blog/${slug}`,
      image: resolveLegacyImagePath(slug, String(frontmatter.image ?? "")),
      thumbnail: resolveLegacyImagePath(
        slug,
        String(frontmatter.thumbnail ?? frontmatter.image ?? ""),
      ),
      author: AUTHORS[authorKey] || AUTHORS.ian,
      date,
      dateLabel: formatDateLabel(date),
      tags: Array.isArray(frontmatter.tags)
        ? frontmatter.tags.map((tag) => String(tag))
        : [],
      excerpt: String(frontmatter.excerpt ?? ""),
      content: post.content.split(/\n\s*\n/).filter(Boolean),
      contentMdx: post.content,
      commentCount: 0,
      status: "published",
    };
  });
}

async function getPublishedSupabaseBlogs(): Promise<Blog[]> {
  const supabase = await createClient();
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      "id, author_id, title, slug, excerpt, content_mdx, cover_image_url, thumbnail_url, status, tags, published_on, created_at",
    )
    .eq("status", "published")
    .order("published_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (postsError || !posts) {
    return [];
  }

  const authorIds = [...new Set(posts.map((post) => post.author_id).filter(Boolean))];
  let profiles: ProfileRow[] = [];

  if (authorIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, display_name, slug, role, avatar_url")
      .in("id", authorIds);

    profiles = profileRows || [];
  }

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  return (posts as PostRow[]).map((post) =>
    mapSupabasePost(post, profilesById.get(post.author_id)),
  );
}

export async function getBlogs(): Promise<Blog[]> {
  const supabaseBlogs = await getPublishedSupabaseBlogs();
  const legacyBlogs = getLegacyBlogs();
  const blogsBySlug = new Map<string, Blog>();

  for (const post of supabaseBlogs) {
    blogsBySlug.set(post.slug, post);
  }

  for (const post of legacyBlogs) {
    if (!blogsBySlug.has(post.slug)) {
      blogsBySlug.set(post.slug, post);
    }
  }

  return [...blogsBySlug.values()].sort(
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

import type { Author, Blog, BlogStatus } from "@/types/blog";
import { createClient } from "@/utils/supabase/server";
import { resolvePostAssetUrl, rewritePostAssetUrls } from "./post-assets";

type PostRow = {
  id: string;
  author_id: string;
  author_name: string | null;
  author_slug: string | null;
  author_role: string | null;
  author_avatar_url: string | null;
  asset_folder: string | null;
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

function resolveAuthor(row: PostRow, profile?: ProfileRow | null): Author {
  return {
    id: profile?.id,
    name: row.author_name || profile?.display_name || "Author",
    slug: row.author_slug || profile?.slug || "author",
    role: row.author_role || profile?.role || "Writer",
    image: row.author_avatar_url || profile?.avatar_url || undefined,
  };
}

function mapSupabasePost(row: PostRow, profile?: ProfileRow | null): Blog {
  const date = row.published_on || row.created_at.slice(0, 10);
  const assetFolder = row.asset_folder || row.slug;
  const contentMdx = rewritePostAssetUrls(assetFolder, row.content_mdx);

  return {
    id: row.id,
    source: "supabase",
    assetFolder,
    slug: row.slug,
    title: row.title,
    href: `/blog/${row.slug}`,
    image:
      resolvePostAssetUrl(assetFolder, row.cover_image_url) ||
      "/images/blog/unsplash-1499750310107-5fef28a66643.jpg",
    thumbnail:
      resolvePostAssetUrl(assetFolder, row.thumbnail_url) ||
      resolvePostAssetUrl(assetFolder, row.cover_image_url) ||
      "/images/blog/unsplash-1499750310107-5fef28a66643.jpg",
    author: resolveAuthor(row, profile),
    date,
    dateLabel: formatDateLabel(date),
    tags: row.tags || [],
    excerpt: row.excerpt || "",
    content: contentMdx.split(/\n\s*\n/).filter(Boolean),
    contentMdx,
    commentCount: 0,
    status: row.status,
  };
}

async function getPublishedSupabaseBlogs(): Promise<Blog[]> {
  const supabase = await createClient();
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(
      "id, author_id, author_name, author_slug, author_role, author_avatar_url, asset_folder, title, slug, excerpt, content_mdx, cover_image_url, thumbnail_url, status, tags, published_on, created_at",
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

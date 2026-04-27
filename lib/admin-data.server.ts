import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { buildEditorDocument } from "./post-documents";
import { createClient } from "@/utils/supabase/server";

export type ProfileRecord = {
  id: string;
  email: string | null;
  display_name: string | null;
  slug: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string | null;
};

export type OwnedPostRecord = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_mdx: string;
  cover_image_url: string | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  status: "draft" | "published" | "archived";
  published_on: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  profile: ProfileRecord | null;
};

function buildFallbackProfile(user: User): ProfileRecord {
  const emailName = user.email?.split("@")[0] || "writer";

  return {
    id: user.id,
    email: user.email || null,
    display_name:
      (typeof user.user_metadata.display_name === "string" &&
        user.user_metadata.display_name) ||
      emailName,
    slug:
      (typeof user.user_metadata.slug === "string" && user.user_metadata.slug) ||
      emailName.toLowerCase(),
    bio: null,
    avatar_url: null,
    role: "author",
  };
}

export async function getAuthenticatedContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name, slug, bio, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    profile: (profile as ProfileRecord | null) || buildFallbackProfile(user),
  };
}

export async function requireAuthenticatedContext(): Promise<AuthContext> {
  const context = await getAuthenticatedContext();

  if (!context) {
    redirect("/login");
  }

  return context;
}

export async function getOwnedPosts() {
  const context = await requireAuthenticatedContext();
  const { data } = await context.supabase
    .from("posts")
    .select(
      "id, author_id, title, slug, excerpt, content_mdx, cover_image_url, thumbnail_url, tags, status, published_on, published_at, created_at, updated_at",
    )
    .eq("author_id", context.user.id)
    .order("updated_at", { ascending: false });

  return {
    ...context,
    posts: (data as OwnedPostRecord[] | null) || [],
  };
}

export function buildEditorContentFromPost(
  post: OwnedPostRecord,
  authorSlug = "author",
) {
  return buildEditorDocument({
    title: post.title,
    date: post.published_on || post.created_at.slice(0, 10),
    author: authorSlug,
    image: post.cover_image_url || "",
    thumbnail: post.thumbnail_url || post.cover_image_url || "",
    excerpt: post.excerpt || "",
    tags: post.tags || [],
    status: post.status,
    body: post.content_mdx,
  });
}

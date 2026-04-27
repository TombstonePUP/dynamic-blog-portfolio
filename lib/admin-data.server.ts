import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { buildEditorDocument } from "./post-documents";
import { createClient } from "@/utils/supabase/server";

export type UserRole = "author" | "editor" | "admin";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export const PRIMARY_ADMIN_EMAIL = "sanjuanregie@gmail.com";

export type ProfileRecord = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  slug: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  approval_status: ApprovalStatus | null;
  approved_at: string | null;
  approved_by: string | null;
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
  const firstName =
    (typeof user.user_metadata.first_name === "string" &&
      user.user_metadata.first_name.trim()) ||
    (typeof user.user_metadata.display_name === "string" &&
      user.user_metadata.display_name.trim().split(/\s+/)[0]) ||
    emailName;
  const lastName =
    (typeof user.user_metadata.last_name === "string" &&
      user.user_metadata.last_name.trim()) ||
    null;
  const displayName =
    (typeof user.user_metadata.display_name === "string" &&
      user.user_metadata.display_name.trim()) ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    emailName;

  return {
    id: user.id,
    email: user.email || null,
    first_name: firstName,
    last_name: lastName,
    display_name: displayName,
    slug:
      (typeof user.user_metadata.slug === "string" && user.user_metadata.slug) ||
      emailName.toLowerCase(),
    bio: null,
    avatar_url: null,
    role: "author",
    approval_status: "pending",
    approved_at: null,
    approved_by: null,
  };
}

export function isApprovedProfile(profile: ProfileRecord | null) {
  return profile?.approval_status === "approved";
}

export function isAdminProfile(profile: ProfileRecord | null) {
  return profile?.role === "admin" && isApprovedProfile(profile);
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
    .select(
      "id, email, first_name, last_name, display_name, slug, bio, avatar_url, role, approval_status, approved_at, approved_by",
    )
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

export async function requireApprovedContext(): Promise<AuthContext> {
  const context = await requireAuthenticatedContext();

  if (!isApprovedProfile(context.profile)) {
    redirect("/pending");
  }

  return context;
}

export async function requireAdminContext(): Promise<AuthContext> {
  const context = await requireApprovedContext();

  if (!isAdminProfile(context.profile)) {
    redirect("/dashboard");
  }

  return context;
}

export async function getOwnedPosts() {
  const context = await requireApprovedContext();
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

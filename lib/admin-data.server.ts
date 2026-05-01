import { createClient } from "@/utils/supabase/server";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { resolvePostAssetUrl, rewritePostAssetUrls } from "./post-assets";
import { buildEditorDocument } from "./post-documents";

export type UserRole = "author" | "editor" | "admin";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export const PRIMARY_ADMIN_EMAIL = "sanjuanregie@gmail.com";

export type ProfileRecord = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
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
  author_name: string | null;
  author_slug: string | null;
  author_role: string | null;
  author_avatar_url: string | null;
  asset_folder: string;
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
  source?: "supabase";
};

type AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  profile: ProfileRecord;
};

const OWNED_POST_SELECT =
  "id, author_id, author_name, author_slug, author_role, author_avatar_url, asset_folder, title, slug, excerpt, content_mdx, cover_image_url, thumbnail_url, tags, status, published_on, published_at, created_at, updated_at";

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
      user.user_metadata.last_name.trim()) || "";
  const displayName =
    (typeof user.user_metadata.display_name === "string" &&
      user.user_metadata.display_name.trim()) ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    emailName;

  return {
    id: user.id,
    email: user.email || "",
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

export async function getManageablePosts(context: AuthContext) {
  const query = context.supabase
    .from("posts")
    .select(OWNED_POST_SELECT)
    .order("updated_at", { ascending: false });

  const { data } = isAdminProfile(context.profile)
    ? await query
    : await query.eq("author_id", context.user.id);

  return ((data as OwnedPostRecord[] | null) || []).map((post) => ({
    ...post,
    source: "supabase" as const,
  }));
}

export async function getManageablePostBySlug(
  context: AuthContext,
  slug: string,
): Promise<OwnedPostRecord | null> {
  const { data } = isAdminProfile(context.profile)
    ? await context.supabase
      .from("posts")
      .select(OWNED_POST_SELECT)
      .eq("slug", slug)
      .maybeSingle()
    : await context.supabase
      .from("posts")
      .select(OWNED_POST_SELECT)
      .eq("slug", slug)
      .eq("author_id", context.user.id)
      .maybeSingle();

  if (data) {
    return {
      ...(data as OwnedPostRecord),
      source: "supabase",
    };
  }

  return null;
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
  const posts = await getManageablePosts(context);

  return {
    ...context,
    posts,
  };
}

export function buildEditorContentFromPost(
  post: OwnedPostRecord,
  authorSlug = "author",
) {
  const assetFolder = post.asset_folder || post.slug;

  return buildEditorDocument({
    title: post.title,
    date: post.published_on || post.created_at.slice(0, 10),
    author: post.author_slug || authorSlug,
    image: resolvePostAssetUrl(assetFolder, post.cover_image_url) || "",
    thumbnail:
      resolvePostAssetUrl(assetFolder, post.thumbnail_url) ||
      resolvePostAssetUrl(assetFolder, post.cover_image_url) ||
      "",
    excerpt: post.excerpt || "",
    tags: post.tags || [],
    status: post.status,
    body: rewritePostAssetUrls(assetFolder, post.content_mdx),
  });
}

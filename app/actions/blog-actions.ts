"use server";

import {
  buildEditorContentFromPost,
  getManageablePostBySlug,
  getManageablePosts,
  isAdminProfile,
  requireApprovedContext,
  type OwnedPostRecord,
} from "@/lib/admin-data.server";
import { resolvePostAssetUrl, rewritePostAssetUrls } from "@/lib/post-assets";
import { normalizeSlug, parseEditorDocument, toIsoDate } from "@/lib/post-documents";

function mapDatabaseError(message: string) {
  if (message.toLowerCase().includes("duplicate key")) {
    return "That slug is already in use.";
  }

  return message;
}

const OWNED_POST_SELECT =
  "id, author_id, author_name, author_slug, author_role, author_avatar_url, asset_folder, title, slug, excerpt, content_mdx, cover_image_url, thumbnail_url, tags, status, published_on, published_at, created_at, updated_at";

export async function getBlogListAction() {
  const context = await requireApprovedContext();
  const manageablePosts = await getManageablePosts(context);

  return {
    success: true,
    list: manageablePosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      status: post.status,
      updatedAt: post.updated_at,
    })),
  };
}

export async function getBlogContentAction(slug: string) {
  const context = await requireApprovedContext();

  const normalizedSlug = normalizeSlug(slug);
  const data = await getManageablePostBySlug(context, normalizedSlug);

  if (!data) {
    return { success: false, error: "Story not found." };
  }

  return {
    success: true,
    content: buildEditorContentFromPost(
      data as OwnedPostRecord,
      context.profile?.slug || "writer",
    ),
  };
}

export async function saveBlogContentAction(slug: string, content: string) {
  const context = await requireApprovedContext();
  const isAdmin = isAdminProfile(context.profile);

  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) {
    return { success: false, error: "A valid slug is required before saving." };
  }

  const document = parseEditorDocument(content);
  const publishedOn = toIsoDate(document.date);
  const existing = await getManageablePostBySlug(context, normalizedSlug);
  const assetFolder = existing?.asset_folder || normalizedSlug;

  const payload = {
    author_id:
      existing?.source === "supabase" && isAdmin
        ? existing.author_id
        : context.user.id,
    author_name:
      existing?.author_name ||
      context.profile?.display_name ||
      context.user.email ||
      "Author",
    author_slug:
      existing?.author_slug || context.profile?.slug || document.author || "writer",
    author_role: existing?.author_role || context.profile?.role || null,
    author_avatar_url: existing?.author_avatar_url || context.profile?.avatar_url || null,
    asset_folder: assetFolder,
    title: document.title,
    slug: normalizedSlug,
    excerpt: document.excerpt,
    content_mdx: rewritePostAssetUrls(assetFolder, document.body),
    cover_image_url: resolvePostAssetUrl(assetFolder, document.image) || null,
    thumbnail_url:
      resolvePostAssetUrl(assetFolder, document.thumbnail || document.image) || null,
    tags: document.tags,
    status: document.status,
    published_on: publishedOn,
    published_at:
      document.status === "published"
        ? existing?.published_at || new Date().toISOString()
        : null,
  };

  const query =
    existing && existing.source === "supabase"
      ? isAdmin
        ? context.supabase
            .from("posts")
            .update(payload)
            .eq("id", existing.id)
            .select(OWNED_POST_SELECT)
            .single()
        : context.supabase
            .from("posts")
            .update(payload)
            .eq("id", existing.id)
            .eq("author_id", context.user.id)
            .select(OWNED_POST_SELECT)
            .single()
      : context.supabase
          .from("posts")
          .insert(payload)
          .select(OWNED_POST_SELECT)
          .single();

  const { data: savedPost, error } = await query;

  if (error) {
    return { success: false, error: mapDatabaseError(error.message) };
  }

  return {
    success: true,
    slug: savedPost.slug,
    content: buildEditorContentFromPost(
      savedPost as OwnedPostRecord,
      context.profile?.slug || document.author || "writer",
    ),
  };
}

export async function renameBlogSlugAction(oldSlug: string, newSlug: string) {
  const context = await requireApprovedContext();
  const isAdmin = isAdminProfile(context.profile);

  const normalizedOldSlug = normalizeSlug(oldSlug);
  const normalizedNewSlug = normalizeSlug(newSlug);

  if (!normalizedNewSlug) {
    return { success: false, error: "Please choose a valid slug." };
  }

  if (!isAdmin) {
    const userScopedResult = await context.supabase
      .from("posts")
      .update({ slug: normalizedNewSlug })
      .eq("author_id", context.user.id)
      .eq("slug", normalizedOldSlug);

    if (userScopedResult.error) {
      return { success: false, error: mapDatabaseError(userScopedResult.error.message) };
    }

    return {
      success: true,
      slug: normalizedNewSlug,
    };
  }

  const { error } = await context.supabase
    .from("posts")
    .update({ slug: normalizedNewSlug })
    .eq("slug", normalizedOldSlug);

  if (error) {
    return { success: false, error: mapDatabaseError(error.message) };
  }

  return {
    success: true,
    slug: normalizedNewSlug,
  };
}

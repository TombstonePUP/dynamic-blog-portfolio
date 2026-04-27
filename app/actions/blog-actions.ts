"use server";

import { buildEditorContentFromPost, getAuthenticatedContext, type OwnedPostRecord } from "@/lib/admin-data.server";
import { normalizeSlug, parseEditorDocument, toIsoDate } from "@/lib/post-documents";

function mapDatabaseError(message: string) {
  if (message.toLowerCase().includes("duplicate key")) {
    return "That slug is already in use.";
  }

  return message;
}

export async function getBlogListAction() {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { success: false, error: "You must be signed in to view your stories." };
  }

  const { data, error } = await context.supabase
    .from("posts")
    .select("slug, title, status, updated_at")
    .eq("author_id", context.user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    list: (data || []).map((post) => ({
      slug: post.slug,
      title: post.title,
      status: post.status,
      updatedAt: post.updated_at,
    })),
  };
}

export async function getBlogContentAction(slug: string) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { success: false, error: "You must be signed in to load a story." };
  }

  const normalizedSlug = normalizeSlug(slug);
  const { data, error } = await context.supabase
    .from("posts")
    .select(
      "id, author_id, title, slug, excerpt, content_mdx, cover_image_url, thumbnail_url, tags, status, published_on, published_at, created_at, updated_at",
    )
    .eq("author_id", context.user.id)
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

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
  const context = await getAuthenticatedContext();

  if (!context) {
    return { success: false, error: "You must be signed in to save a story." };
  }

  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) {
    return { success: false, error: "A valid slug is required before saving." };
  }

  const document = parseEditorDocument(content);
  const publishedOn = toIsoDate(document.date);
  const { data: existing } = await context.supabase
    .from("posts")
    .select(
      "id, author_id, title, slug, excerpt, content_mdx, cover_image_url, thumbnail_url, tags, status, published_on, published_at, created_at, updated_at",
    )
    .eq("author_id", context.user.id)
    .eq("slug", normalizedSlug)
    .maybeSingle();

  const payload = {
    author_id: context.user.id,
    title: document.title,
    slug: normalizedSlug,
    excerpt: document.excerpt,
    content_mdx: document.body,
    cover_image_url: document.image || null,
    thumbnail_url: document.thumbnail || document.image || null,
    tags: document.tags,
    status: document.status,
    published_on: publishedOn,
    published_at:
      document.status === "published"
        ? existing?.published_at || new Date().toISOString()
        : null,
  };

  const query = existing
    ? context.supabase
        .from("posts")
        .update(payload)
        .eq("id", existing.id)
        .eq("author_id", context.user.id)
        .select(
          "id, author_id, title, slug, excerpt, content_mdx, cover_image_url, thumbnail_url, tags, status, published_on, published_at, created_at, updated_at",
        )
        .single()
    : context.supabase
        .from("posts")
        .insert(payload)
        .select(
          "id, author_id, title, slug, excerpt, content_mdx, cover_image_url, thumbnail_url, tags, status, published_on, published_at, created_at, updated_at",
        )
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
  const context = await getAuthenticatedContext();

  if (!context) {
    return { success: false, error: "You must be signed in to rename a story." };
  }

  const normalizedOldSlug = normalizeSlug(oldSlug);
  const normalizedNewSlug = normalizeSlug(newSlug);

  if (!normalizedNewSlug) {
    return { success: false, error: "Please choose a valid slug." };
  }

  const { error } = await context.supabase
    .from("posts")
    .update({ slug: normalizedNewSlug })
    .eq("author_id", context.user.id)
    .eq("slug", normalizedOldSlug);

  if (error) {
    return { success: false, error: mapDatabaseError(error.message) };
  }

  return {
    success: true,
    slug: normalizedNewSlug,
  };
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { BlogStatus } from "@/features/posts/types";

export type PublishedPostRow = {
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
  status: BlogStatus;
  published_on: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  source?: "supabase";
};

export type EditorPostSummary = {
  slug: string;
  title: string;
  status: BlogStatus;
  updated_at: string;
};

const PUBLISHED_POST_SELECT =
  "id, author_id, author_name, author_slug, author_role, author_avatar_url, asset_folder, title, slug, excerpt, content_mdx, cover_image_url, thumbnail_url, status, tags, published_on, created_at";

export const OWNED_POST_SELECT =
  "id, author_id, author_name, author_slug, author_role, author_avatar_url, asset_folder, title, slug, excerpt, content_mdx, cover_image_url, thumbnail_url, tags, status, published_on, published_at, created_at, updated_at";

const EDITOR_POST_SELECT = "slug, title, status, updated_at";

export async function listPublishedPosts(
  supabase: SupabaseClient,
): Promise<PublishedPostRow[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(PUBLISHED_POST_SELECT)
    .eq("status", "published")
    .order("published_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as PublishedPostRow[];
}

export async function listManageablePosts(
  supabase: SupabaseClient,
  options: { userId: string; isAdmin: boolean },
): Promise<OwnedPostRecord[]> {
  const query = supabase
    .from("posts")
    .select(OWNED_POST_SELECT)
    .order("updated_at", { ascending: false });

  const { data, error } = options.isAdmin
    ? await query
    : await query.eq("author_id", options.userId);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as OwnedPostRecord[] | null) || []).map((post) => ({
    ...post,
    source: "supabase" as const,
  }));
}

export async function getManageablePostBySlug(
  supabase: SupabaseClient,
  options: { userId: string; isAdmin: boolean; slug: string },
): Promise<OwnedPostRecord | null> {
  const { data, error } = options.isAdmin
    ? await supabase
        .from("posts")
        .select(OWNED_POST_SELECT)
        .eq("slug", options.slug)
        .maybeSingle()
    : await supabase
        .from("posts")
        .select(OWNED_POST_SELECT)
        .eq("slug", options.slug)
        .eq("author_id", options.userId)
        .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    ...(data as OwnedPostRecord),
    source: "supabase",
  };
}

export async function listEditorPostSummaries(
  supabase: SupabaseClient,
): Promise<EditorPostSummary[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(EDITOR_POST_SELECT)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as EditorPostSummary[] | null) || [];
}

export async function getPostContentBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("content_mdx")
    .eq("slug", slug)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return typeof data?.content_mdx === "string" ? data.content_mdx : null;
}

export async function updatePostContent(
  supabase: SupabaseClient,
  options: { slug: string; title: string; content: string },
) {
  const { error } = await supabase
    .from("posts")
    .update({
      content_mdx: options.content,
      title: options.title,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", options.slug);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createDraftPost(
  supabase: SupabaseClient,
  slug: string,
) {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      slug,
      title: slug,
      status: "draft",
      content_mdx: `---\ntitle: ${slug}\n---\n\nStart writing...`,
    })
    .select("slug")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { slug: data.slug as string };
}

export async function renamePostSlug(
  supabase: SupabaseClient,
  options: { currentSlug: string; nextSlug: string },
) {
  const { error } = await supabase
    .from("posts")
    .update({ slug: options.nextSlug })
    .eq("slug", options.currentSlug);

  if (error) {
    throw new Error(error.message);
  }
}

export async function removePostAssets(
  supabase: SupabaseClient,
  assetFolder: string,
) {
  const { data, error } = await supabase.storage
    .from("post-assets")
    .list(assetFolder);

  if (error || !data || data.length === 0) {
    return;
  }

  const assetPaths = data.map((file) => `${assetFolder}/${file.name}`);
  const { error: removeError } = await supabase.storage
    .from("post-assets")
    .remove(assetPaths);

  if (removeError) {
    throw new Error(removeError.message);
  }
}

export async function deletePostBySlug(
  supabase: SupabaseClient,
  slug: string,
) {
  const { error } = await supabase.from("posts").delete().eq("slug", slug);

  if (error) {
    throw new Error(error.message);
  }
}

export async function listPostAssets(
  supabase: SupabaseClient,
  assetFolder: string,
): Promise<Array<{ id: string | null; name: string }>> {
  const { data, error } = await supabase.storage
    .from("post-assets")
    .list(assetFolder);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as Array<{ id?: string; name: string }> | null) || []).map(
    (asset) => ({
      id: asset.id || null,
      name: asset.name,
    }),
  );
}

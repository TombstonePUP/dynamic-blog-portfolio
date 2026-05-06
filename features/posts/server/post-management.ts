import {
  createDraftPost,
  deletePostBySlug,
  getPostContentBySlug,
  listEditorPostSummaries,
  listPostAssets,
  removePostAssets,
  renamePostSlug,
  updatePostContent,
} from "@/db/queries/posts";
import { createClient } from "@/db/supabase/server";
import { parseEditorDocument } from "@/features/posts/lib/post-documents";
import { parsePostContent, parsePostSlug } from "@/validators/posts";

export async function getEditorBlogList() {
  const supabase = await createClient();
  const posts = await listEditorPostSummaries(supabase);

  return posts.map((item) => ({
    slug: item.slug,
    title: item.title,
    status: item.status,
    updatedAt: item.updated_at,
  }));
}

export async function getEditorBlogContent(slug: string) {
  const supabase = await createClient();
  const normalizedSlug = parsePostSlug(slug);
  const content = await getPostContentBySlug(supabase, normalizedSlug);

  return content || "";
}

export async function saveEditorBlogContent(slug: string, content: string) {
  const supabase = await createClient();
  const normalizedSlug = parsePostSlug(slug);
  const nextContent = parsePostContent(content);
  const document = parseEditorDocument(nextContent);

  await updatePostContent(supabase, {
    slug: normalizedSlug,
    title: document.title || normalizedSlug,
    content: nextContent,
    excerpt: document.excerpt,
    imageUrl: document.image || null,
    tags: document.tags,
    status: document.status,
    publishedOn: document.date || null,
    publishedAt:
      document.status === "published" && document.date
        ? new Date(`${document.date}T00:00:00.000Z`).toISOString()
        : null,
  });

  return {
    slug: normalizedSlug,
    content: nextContent,
  };
}

export async function createEditorDraft(slug: string) {
  const supabase = await createClient();
  const normalizedSlug = parsePostSlug(slug);
  return createDraftPost(supabase, normalizedSlug);
}

export async function deleteEditorStory(slug: string) {
  const supabase = await createClient();
  const normalizedSlug = parsePostSlug(slug);

  await removePostAssets(supabase, normalizedSlug);
  await deletePostBySlug(supabase, normalizedSlug);
}

export async function renameEditorStorySlug(oldSlug: string, newSlug: string) {
  const supabase = await createClient();
  const currentSlug = parsePostSlug(oldSlug);
  const nextSlug = parsePostSlug(newSlug);

  await renamePostSlug(supabase, {
    currentSlug,
    nextSlug,
  });

  return { slug: nextSlug };
}

export async function getEditorBlogAssets(slug: string) {
  const supabase = await createClient();
  const normalizedSlug = parsePostSlug(slug);
  return listPostAssets(supabase, normalizedSlug);
}

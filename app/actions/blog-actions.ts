"use server";

import { revalidatePath } from "next/cache";
import {
  createEditorDraft,
  deleteEditorStory,
  getEditorBlogAssets,
  getEditorBlogContent,
  getEditorBlogList,
  getEditorTaxonomyOptions,
  renameEditorStorySlug,
  saveEditorBlogContent,
} from "@/services/posts";

export async function getBlogListAction() {
  try {
    return {
      success: true as const,
      list: await getEditorBlogList(),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load stories.",
    };
  }
}

export async function getBlogContentAction(slug: string) {
  try {
    return {
      success: true as const,
      content: await getEditorBlogContent(slug),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load story content.",
    };
  }
}

export async function saveBlogContentAction(slug: string, content: string) {
  try {
    const result = await saveEditorBlogContent(slug, content);

    revalidatePath("/editor");
    revalidatePath(`/${result.slug}`);

    return { success: true as const, ...result };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to save story.",
    };
  }
}

export async function createDraftAction(slug: string) {
  try {
    const result = await createEditorDraft(slug);
    revalidatePath("/editor");
    return { success: true as const, slug: result.slug };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create draft.",
    };
  }
}

export async function deleteStoryAction(slug: string) {
  try {
    await deleteEditorStory(slug);
    revalidatePath("/editor");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete story.",
    };
  }
}

export async function renameBlogSlugAction(oldSlug: string, newSlug: string) {
  try {
    const result = await renameEditorStorySlug(oldSlug, newSlug);
    revalidatePath("/editor");
    return { success: true as const, slug: result.slug };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to rename story slug.",
    };
  }
}

export async function getBlogAssetsAction(slug: string) {
  try {
    return {
      success: true as const,
      assets: await getEditorBlogAssets(slug),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load story assets.",
    };
  }
}

export async function getEditorTaxonomyAction() {
  try {
    return {
      success: true as const,
      taxonomy: await getEditorTaxonomyOptions(),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load taxonomy.",
    };
  }
}

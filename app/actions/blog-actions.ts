"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getBlogListAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("slug, title, status, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    list: data.map((item) => ({
      slug: item.slug,
      title: item.title,
      status: item.status,
      updatedAt: item.updated_at,
    })),
  };
}

export async function getBlogContentAction(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("content_mdx")
    .eq("slug", slug)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, content: data.content_mdx };
}

export async function saveBlogContentAction(slug: string, content: string) {
  const supabase = await createClient();

  // Basic title extraction from frontmatter or content
  let title = slug;
  const titleMatch = content.match(/title:\s*(.*)/);
  if (titleMatch?.[1]) {
    title = titleMatch[1].trim().replace(/^["']|["']$/g, "");
  }

  const { error } = await supabase
    .from("posts")
    .update({
      content_mdx: content,
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/editor");
  revalidatePath(`/${slug}`);
  
  return { success: true, content, slug };
}

export async function createDraftAction(slug: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("posts")
    .insert({
      slug,
      title: slug,
      status: "draft",
      content_mdx: "---\ntitle: " + slug + "\n---\n\nStart writing...",
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/editor");
  return { success: true, slug: data.slug };
}

export async function deleteStoryAction(slug: string) {
  const supabase = await createClient();
  
  // 1. Delete assets from storage
  const { data: files } = await supabase.storage
    .from("post-assets")
    .list(slug);

  if (files && files.length > 0) {
    await supabase.storage
      .from("post-assets")
      .remove(files.map(f => `${slug}/${f.name}`));
  }

  // 2. Delete the database row
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("slug", slug);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/editor");
  return { success: true };
}

export async function renameBlogSlugAction(oldSlug: string, newSlug: string) {
  const supabase = await createClient();
  
  // This is complex because we'd need to move storage objects too.
  // For now, let's just update the DB row.
  const { error } = await supabase
    .from("posts")
    .update({ slug: newSlug })
    .eq("slug", oldSlug);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/editor");
  return { success: true, slug: newSlug };
}

export async function getBlogAssetsAction(slug: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from("post-assets")
    .list(slug);

  if (error) {
    return { success: false, error: error.message };
  }

  return { 
    success: true, 
    assets: data.map(f => ({ name: f.name, id: f.id })) 
  };
}

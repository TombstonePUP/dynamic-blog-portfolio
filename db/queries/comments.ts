import type { SupabaseClient } from "@supabase/supabase-js";

export type CommentStatus = "approved" | "pending" | "rejected";

export type CommentRecord = {
  id: string;
  post_slug: string;
  author: string;
  body: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
};

export type CommentWithPostRecord = CommentRecord & {
  posts:
    | {
        title: string;
        slug: string;
      }
    | Array<{
        title: string;
        slug: string;
      }>
    | null;
};

const COMMENT_SELECT =
  "id, post_slug, author, body, status, created_at, updated_at";

export async function listCommentsForPost(
  supabase: SupabaseClient,
  options: { postSlug: string; includeModeration: boolean },
): Promise<CommentRecord[]> {
  let query = supabase
    .from("comments")
    .select(COMMENT_SELECT)
    .eq("post_slug", options.postSlug)
    .order("created_at", { ascending: false });

  if (!options.includeModeration) {
    query = query.eq("status", "approved");
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data as CommentRecord[] | null) || [];
}

export async function listRecentComments(
  supabase: SupabaseClient,
  limit = 12,
): Promise<CommentWithPostRecord[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(`${COMMENT_SELECT}, posts:post_slug(title, slug)`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as CommentWithPostRecord[] | null) || [];
}

export async function insertComment(
  supabase: SupabaseClient,
  options: { postSlug: string; author: string; body: string },
): Promise<CommentRecord> {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_slug: options.postSlug,
      author: options.author,
      body: options.body,
    })
    .select(COMMENT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CommentRecord;
}

export async function updateCommentStatus(
  supabase: SupabaseClient,
  options: { commentId: string; status: CommentStatus },
): Promise<CommentRecord> {
  const { data, error } = await supabase
    .from("comments")
    .update({ status: options.status })
    .eq("id", options.commentId)
    .select(COMMENT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CommentRecord;
}

export async function deleteCommentById(
  supabase: SupabaseClient,
  commentId: string,
): Promise<CommentRecord> {
  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .select(COMMENT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CommentRecord;
}

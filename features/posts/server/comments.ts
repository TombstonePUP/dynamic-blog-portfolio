import {
  deleteCommentById,
  insertComment,
  listCommentsForPost,
  listRecentComments,
  updateCommentStatus,
  type CommentRecord,
  type CommentStatus,
  type CommentWithPostRecord,
} from "@/db/queries/comments";
import { createClient } from "@/db/supabase/server";
import {
  getAuthenticatedContext,
  isAdminProfile,
  requireAdminContext,
} from "@/features/auth/server/context";
import { getGuestViewState } from "@/features/posts/server/guest-view-mode";

export type CommentViewModel = {
  id: string;
  postSlug: string;
  postTitle?: string;
  name: string;
  body: string;
  status: CommentStatus;
  date: string;
};

export type CommentThread = {
  comments: CommentViewModel[];
  canModerateComments: boolean;
};

export type GuestAdminModeration = {
  canModerateComments: boolean;
  canManageStories: boolean;
  canManageTopics: boolean;
  recentComments: CommentViewModel[];
  error?: string;
};

function formatCommentDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function normalizePostJoin(comment: CommentWithPostRecord) {
  return Array.isArray(comment.posts)
    ? comment.posts[0] || null
    : comment.posts;
}

function toCommentViewModel(
  comment: CommentRecord | CommentWithPostRecord,
): CommentViewModel {
  const post =
    "posts" in comment ? normalizePostJoin(comment as CommentWithPostRecord) : null;

  return {
    id: comment.id,
    postSlug: comment.post_slug,
    postTitle: post?.title,
    name: comment.author,
    body: comment.body,
    status: comment.status,
    date: formatCommentDate(comment.created_at),
  };
}

function sanitizeCommentInput(value: string, label: string, maxLength: number) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${label} is required.`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${label} is too long.`);
  }

  return trimmed;
}

function normalizeCommentStatus(status: string): CommentStatus {
  if (status === "approved" || status === "pending" || status === "rejected") {
    return status;
  }

  throw new Error("Invalid comment status.");
}

export async function getCommentThread(postSlug: string): Promise<CommentThread> {
  const context = await getAuthenticatedContext();
  const supabase = context?.supabase || (await createClient());
  const guestViewState = await getGuestViewState(context);
  const canModerateComments =
    isAdminProfile(context?.profile || null) && !guestViewState.isViewingAsGuest;
  const comments = await listCommentsForPost(supabase, {
    postSlug,
    includeModeration: canModerateComments,
  });

  return {
    comments: comments.map(toCommentViewModel),
    canModerateComments,
  };
}

export async function getGuestAdminModeration(): Promise<GuestAdminModeration> {
  const context = await getAuthenticatedContext();
  const guestViewState = await getGuestViewState(context);

  if (
    !isAdminProfile(context?.profile || null) ||
    !context ||
    guestViewState.isViewingAsGuest
  ) {
    return {
      canModerateComments: false,
      canManageStories: false,
      canManageTopics: false,
      recentComments: [],
    };
  }

  try {
    const comments = await listRecentComments(context.supabase);

    return {
      canModerateComments: true,
      canManageStories: true,
      canManageTopics: true,
      recentComments: comments.map(toCommentViewModel),
    };
  } catch (error) {
    return {
      canModerateComments: true,
      canManageStories: true,
      canManageTopics: true,
      recentComments: [],
      error:
        error instanceof Error
          ? error.message
          : "Unable to load moderation controls.",
    };
  }
}

export async function createPublicComment(options: {
  postSlug: string;
  author: string;
  body: string;
}) {
  const supabase = await createClient();
  const postSlug = sanitizeCommentInput(options.postSlug, "Post", 240);
  const author = sanitizeCommentInput(options.author, "Name", 120);
  const body = sanitizeCommentInput(options.body, "Comment", 2000);

  const comment = await insertComment(supabase, { postSlug, author, body });

  return toCommentViewModel(comment);
}

export async function moderatePublicComment(options: {
  commentId: string;
  status: string;
}) {
  const { supabase } = await requireAdminContext();
  const commentId = sanitizeCommentInput(options.commentId, "Comment", 80);
  const status = normalizeCommentStatus(options.status);
  const comment = await updateCommentStatus(supabase, { commentId, status });

  return toCommentViewModel(comment);
}

export async function removePublicComment(commentId: string) {
  const { supabase } = await requireAdminContext();
  const normalizedCommentId = sanitizeCommentInput(commentId, "Comment", 80);
  const comment = await deleteCommentById(supabase, normalizedCommentId);

  return toCommentViewModel(comment);
}

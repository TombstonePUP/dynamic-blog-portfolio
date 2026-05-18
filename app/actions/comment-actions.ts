"use server";

import {
  createPublicComment,
  moderatePublicComment,
  removePublicComment,
} from "@/services/posts";
import { revalidatePath } from "next/cache";

export async function createCommentAction(options: {
  postSlug: string;
  author: string;
  body: string;
}) {
  try {
    const comment = await createPublicComment(options);

    revalidatePath(`/${comment.postSlug}`);

    return {
      success: true as const,
      comment,
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Could not post your comment.",
    };
  }
}

export async function moderateCommentAction(options: {
  commentId: string;
  status: "approved" | "pending" | "rejected";
}) {
  try {
    const comment = await moderatePublicComment(options);

    revalidatePath("/");
    revalidatePath(`/${comment.postSlug}`);

    return {
      success: true as const,
      comment,
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "You are not allowed to moderate this comment.",
    };
  }
}

export async function deleteCommentAction(commentId: string) {
  try {
    const comment = await removePublicComment(commentId);

    revalidatePath("/");
    revalidatePath(`/${comment.postSlug}`);

    return {
      success: true as const,
      commentId: comment.id,
      postSlug: comment.postSlug,
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "You are not allowed to delete this comment.",
    };
  }
}

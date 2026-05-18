"use server";

import {
  toggleHomepageTopicFeatured,
  togglePublicStoryFeatured,
  updatePublicStoryStatus,
} from "@/services/posts";
import { revalidatePath } from "next/cache";

export async function updatePublicStoryStatusAction(options: {
  slug: string;
  status: "published" | "draft" | "archived";
}) {
  try {
    const post = await updatePublicStoryStatus(options);

    revalidatePath("/");
    revalidatePath(`/${post.slug}`);
    revalidatePath("/topics");

    return { success: true as const, post };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "You are not allowed to update this story.",
    };
  }
}

export async function togglePublicStoryFeaturedAction(options: {
  slug: string;
  tags: string[];
  featured: boolean;
}) {
  try {
    const post = await togglePublicStoryFeatured(options);

    revalidatePath("/");
    revalidatePath(`/${post.slug}`);
    revalidatePath("/topics");

    return { success: true as const, post };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "You are not allowed to feature this story.",
    };
  }
}

export async function toggleHomepageTopicFeaturedAction(options: {
  slug: string;
  featured: boolean;
}) {
  try {
    const topic = await toggleHomepageTopicFeatured(options);

    revalidatePath("/");
    revalidatePath("/topics");

    return { success: true as const, topic };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "You are not allowed to update featured topics.",
    };
  }
}

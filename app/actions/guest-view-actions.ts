"use server";

import { setGuestViewMode } from "@/services/posts";
import { revalidatePath } from "next/cache";

export async function setGuestViewModeAction(enabled: boolean) {
  try {
    const state = await setGuestViewMode(enabled);

    revalidatePath("/");
    revalidatePath("/topics");

    return {
      success: true as const,
      state,
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update guest view mode.",
    };
  }
}

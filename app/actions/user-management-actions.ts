"use server";

import { revalidatePath } from "next/cache";
import {
  applyUserAccessChange,
  updateSignedInUserProfile,
} from "@/services/users";

export async function updateUserAccessAction(formData: FormData) {
  await applyUserAccessChange({
    userId: String(formData.get("userId") || ""),
    role: String(formData.get("role") || ""),
    approvalStatus: String(formData.get("approvalStatus") || ""),
  });

  revalidatePath("/dashboard");
  revalidatePath("/users");
}

export async function updateUserProfile({
  firstName,
  lastName,
  currentPassword,
  newPassword,
}: {
  firstName?: string;
  lastName?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ success: boolean; error?: string }> {
  const result = await updateSignedInUserProfile({
    firstName,
    lastName,
    currentPassword,
    newPassword,
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return result;
}

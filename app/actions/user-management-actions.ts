"use server";

import { revalidatePath } from "next/cache";
import { passwordSchema, profileSchema } from "@/validators/users";
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
  username,
  currentPassword,
  newPassword,
  confirmPassword,
}: {
  firstName?: string;
  lastName?: string;
  username?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (
    firstName !== undefined ||
    lastName !== undefined ||
    username !== undefined
  ) {
    const parsedProfile = profileSchema.safeParse({
      firstName: firstName?.trim() || "",
      lastName: lastName?.trim() || "",
      username: username?.trim() || "",
    });

    if (!parsedProfile.success) {
      const firstError = Object.values(
        parsedProfile.error.flatten().fieldErrors,
      ).find((messages) => messages?.length)?.[0];

      return {
        success: false,
        error: firstError || "Invalid profile details.",
      };
    }
  }

  if (
    currentPassword !== undefined ||
    newPassword !== undefined ||
    confirmPassword !== undefined
  ) {
    const parsedPassword = passwordSchema.safeParse({
      currentPassword: currentPassword || "",
      newPassword: newPassword || "",
      confirmPassword: confirmPassword || "",
    });

    if (!parsedPassword.success) {
      const firstError = Object.values(
        parsedPassword.error.flatten().fieldErrors,
      ).find((messages) => messages?.length)?.[0];

      return {
        success: false,
        error: firstError || "Invalid password details.",
      };
    }
  }

  const result = await updateSignedInUserProfile({
    firstName,
    lastName,
    username,
    currentPassword,
    newPassword,
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return result;
}

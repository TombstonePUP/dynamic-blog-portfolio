"use server";

import {
  getAuthenticatedContext,
  PRIMARY_ADMIN_EMAIL,
  requireAdminContext,
  type ApprovalStatus,
  type UserRole,
} from "@/lib/admin-data.server";
import { revalidatePath } from "next/cache";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseRole(value: string): UserRole {
  if (value === "editor" || value === "admin") {
    return value;
  }

  return "author";
}

function parseApprovalStatus(value: string): ApprovalStatus {
  if (value === "approved" || value === "rejected") {
    return value;
  }

  return "pending";
}

export async function updateUserAccessAction(formData: FormData) {
  const context = await requireAdminContext();
  const userId = readText(formData, "userId");
  const role = parseRole(readText(formData, "role"));
  const approvalStatus = parseApprovalStatus(readText(formData, "approvalStatus"));

  if (!userId) {
    return;
  }

  const { data: targetProfile } = await context.supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (!targetProfile) {
    return;
  }

  const targetEmail = (targetProfile.email || "").trim().toLowerCase();
  if (
    targetEmail === PRIMARY_ADMIN_EMAIL &&
    (role !== "admin" || approvalStatus !== "approved")
  ) {
    return;
  }

  const { error } = await context.supabase
    .from("profiles")
    .update({
      role,
      approval_status: approvalStatus,
      approved_at:
        approvalStatus === "approved" ? new Date().toISOString() : null,
      approved_by:
        approvalStatus === "approved" ? context.user.id : null,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

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
  const context = await getAuthenticatedContext();

  if (!context) {
    return { success: false, error: "Not authenticated" };
  }

  // Update profile name if provided
  if (firstName !== undefined || lastName !== undefined) {
    const { error: profileError } = await context.supabase
      .from("profiles")
      .update({
        first_name: firstName?.trim(),
        last_name: lastName?.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", context.profile.id);

    if (profileError) {
      return { success: false, error: profileError.message };
    }
  }

  // Handle password change if provided
  if (currentPassword && newPassword) {
    const { error: signInError } = await context.supabase.auth.signInWithPassword({
      email: context.profile.email,
      password: currentPassword,
    });

    if (signInError) {
      return { success: false, error: "Current password is incorrect" };
    }

    const { error: updateError } = await context.supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return { success: true };
}
"use server";

import { revalidatePath } from "next/cache";
import {
  PRIMARY_ADMIN_EMAIL,
  requireAdminContext,
  type ApprovalStatus,
  type UserRole,
} from "@/lib/admin-data.server";

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

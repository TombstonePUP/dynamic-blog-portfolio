import { createClient } from "@/db/supabase/server";
import {
  buildFallbackProfile,
  getProfileById,
  type ApprovalStatus,
  type ProfileRecord,
  type UserRole,
} from "@/db/queries/profiles";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export type { ApprovalStatus, ProfileRecord, UserRole };

export const PRIMARY_ADMIN_EMAIL = "sanjuanregie@gmail.com";

export type AuthContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  profile: ProfileRecord;
};

export function isApprovedProfile(profile: ProfileRecord | null) {
  return profile?.approval_status === "approved";
}

export function isAdminProfile(profile: ProfileRecord | null) {
  return profile?.role === "admin" && isApprovedProfile(profile);
}

export async function getAuthenticatedContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await getProfileById(supabase, user.id).catch(() => null);

  return {
    supabase,
    user,
    profile: profile || buildFallbackProfile(user),
  };
}

export async function requireAuthenticatedContext(): Promise<AuthContext> {
  const context = await getAuthenticatedContext();

  if (!context) {
    redirect("/login");
  }

  return context;
}

export async function requireApprovedContext(): Promise<AuthContext> {
  const context = await requireAuthenticatedContext();

  if (!isApprovedProfile(context.profile)) {
    redirect("/pending");
  }

  return context;
}

export async function requireAdminContext(): Promise<AuthContext> {
  const context = await requireApprovedContext();

  if (!isAdminProfile(context.profile)) {
    redirect("/dashboard");
  }

  return context;
}

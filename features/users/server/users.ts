import {
  countProfilesByApprovalStatus,
  getProfileEmailById,
  isUsernameTaken,
  listManagedProfiles as listManagedProfilesQuery,
  updateProfileAccess,
  updateProfileNames,
  type ApprovalStatus,
  type ManagedProfile,
  type UserRole,
} from "@/db/queries/profiles";
import { createAdminClient } from "@/db/supabase/admin";
import {
  getAuthenticatedContext,
  PRIMARY_ADMIN_EMAIL,
  requireAdminContext,
} from "@/features/auth/server/context";

export type { ApprovalStatus, ManagedProfile, UserRole };

const statusOrder: Record<ApprovalStatus, number> = {
  pending: 0,
  approved: 1,
  rejected: 2,
};

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

export async function listManagedProfiles() {
  const { profile, supabase } = await requireAdminContext();
  const profiles = await listManagedProfilesQuery(supabase);

  const sortedProfiles = [...profiles].sort((left, right) => {
    const leftStatus = left.approval_status || "pending";
    const rightStatus = right.approval_status || "pending";

    if (statusOrder[leftStatus] !== statusOrder[rightStatus]) {
      return statusOrder[leftStatus] - statusOrder[rightStatus];
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });

  return {
    currentProfile: profile,
    profiles: sortedProfiles,
  };
}

export async function countPendingApprovals() {
  const { supabase } = await requireAdminContext();
  return countProfilesByApprovalStatus(supabase, "pending");
}

export async function applyUserAccessChange(options: {
  userId: string;
  role: string;
  approvalStatus: string;
}) {
  const context = await requireAdminContext();
  const userId = options.userId.trim();
  const role = parseRole(options.role.trim());
  const approvalStatus = parseApprovalStatus(options.approvalStatus.trim());

  if (!userId) {
    return;
  }

  const targetEmail =
    (await getProfileEmailById(context.supabase, userId))?.trim().toLowerCase() || "";

  if (
    targetEmail === PRIMARY_ADMIN_EMAIL &&
    (role !== "admin" || approvalStatus !== "approved")
  ) {
    return;
  }

  await updateProfileAccess(context.supabase, {
    userId,
    role,
    approvalStatus,
    approvedBy: context.user.id,
  });
}

export async function updateSignedInUserProfile(options: {
  firstName?: string;
  lastName?: string;
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ success: boolean; error?: string }> {
  const context = await getAuthenticatedContext();

  if (!context) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    if (
      options.firstName !== undefined ||
      options.lastName !== undefined ||
      options.username !== undefined
    ) {
      const username = options.username?.trim().toLowerCase() || "";

      if (
        username &&
        (await isUsernameTaken(
          createAdminClient(),
          username,
          context.profile.id,
        ))
      ) {
        return { success: false, error: "That username is already in use." };
      }

      await updateProfileNames(context.supabase, {
        userId: context.profile.id,
        firstName: options.firstName,
        lastName: options.lastName,
        username: options.username,
      });
    }

    if (options.currentPassword && options.newPassword) {
      const { error: signInError } = await context.supabase.auth.signInWithPassword({
        email: context.profile.email,
        password: options.currentPassword,
      });

      if (signInError) {
        return { success: false, error: "Current password is incorrect" };
      }

      const { error: updateError } = await context.supabase.auth.updateUser({
        password: options.newPassword,
      });

      if (updateError) {
        return { success: false, error: updateError.message };
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to update profile.",
    };
  }
}

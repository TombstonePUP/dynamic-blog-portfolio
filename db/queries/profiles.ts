import type { SupabaseClient, User } from "@supabase/supabase-js";

export type UserRole = "author" | "editor" | "admin";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ProfileRecord = {
  id: string;
  email: string;
  username: string | null;
  first_name: string;
  last_name: string;
  display_name: string | null;
  slug: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  approval_status: ApprovalStatus | null;
  approved_at: string | null;
  approved_by: string | null;
};

export type PublicProfileRecord = {
  id: string;
  display_name: string | null;
  slug: string | null;
  role: string | null;
  avatar_url: string | null;
};

export type ManagedProfile = {
  id: string;
  email: string | null;
  username?: string | null;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  role: UserRole | null;
  approval_status: ApprovalStatus | null;
  created_at: string;
  approved_at: string | null;
};

const PROFILE_SELECT =
  "id, email, username, first_name, last_name, display_name, slug, bio, avatar_url, role, approval_status, approved_at, approved_by";

const PUBLIC_PROFILE_SELECT = "id, display_name, slug, role, avatar_url";

const MANAGED_PROFILE_SELECT =
  "id, email, first_name, last_name, display_name, role, approval_status, created_at, approved_at";

export function buildFallbackProfile(user: User): ProfileRecord {
  const emailName = user.email?.split("@")[0] || "writer";
  const firstName =
    (typeof user.user_metadata.first_name === "string" &&
      user.user_metadata.first_name.trim()) ||
    (typeof user.user_metadata.display_name === "string" &&
      user.user_metadata.display_name.trim().split(/\s+/)[0]) ||
    emailName;
  const lastName =
    (typeof user.user_metadata.last_name === "string" &&
      user.user_metadata.last_name.trim()) || "";
  const displayName =
    (typeof user.user_metadata.display_name === "string" &&
      user.user_metadata.display_name.trim()) ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    emailName;

  const username =
    typeof user.user_metadata.username === "string" &&
    user.user_metadata.username.trim()
      ? user.user_metadata.username.trim().toLowerCase()
      : null;

  return {
    id: user.id,
    email: user.email || "",
    username,
    first_name: firstName,
    last_name: lastName,
    display_name: displayName,
    slug:
      (typeof user.user_metadata.slug === "string" && user.user_metadata.slug) ||
      emailName.toLowerCase(),
    bio: null,
    avatar_url: null,
    role: "author",
    approval_status: "pending",
    approved_at: null,
    approved_by: null,
  };
}

export type AuthIdentityProfile = {
  id: string;
  email: string | null;
  username: string | null;
  approval_status: ApprovalStatus | null;
};

const AUTH_IDENTITY_SELECT = "id, email, username, approval_status";

export async function getProfileById(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ProfileRecord | null) || null;
}

export async function getAuthIdentityByIdentifier(
  supabase: SupabaseClient,
  identifier: string,
): Promise<AuthIdentityProfile | null> {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  if (!normalizedIdentifier) {
    return null;
  }

  const lookupField = normalizedIdentifier.includes("@") ? "email" : "username";
  const query = supabase
    .from("profiles")
    .select(AUTH_IDENTITY_SELECT)
    .eq(lookupField, normalizedIdentifier)
    .maybeSingle();

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data as AuthIdentityProfile | null) || null;
}

export async function isEmailTaken(
  supabase: SupabaseClient,
  email: string,
  excludeUserId?: string,
): Promise<boolean> {
  let query = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("email", email.trim().toLowerCase());

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(count);
}

export async function isUsernameTaken(
  supabase: SupabaseClient,
  username: string,
  excludeUserId?: string,
): Promise<boolean> {
  let query = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("username", username.trim().toLowerCase());

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(count);
}

export async function listPublicProfilesByIds(
  supabase: SupabaseClient,
  profileIds: string[],
): Promise<PublicProfileRecord[]> {
  if (profileIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_SELECT)
    .in("id", profileIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data as PublicProfileRecord[] | null) || [];
}

export async function listManagedProfiles(
  supabase: SupabaseClient,
): Promise<ManagedProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(MANAGED_PROFILE_SELECT);

  if (error) {
    throw new Error(error.message);
  }

  return (data as ManagedProfile[] | null) || [];
}

export async function countProfilesByApprovalStatus(
  supabase: SupabaseClient,
  approvalStatus: ApprovalStatus,
): Promise<number> {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("approval_status", approvalStatus);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}

export async function getProfileEmailById(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return typeof data?.email === "string" ? data.email : null;
}

export async function updateProfileAccess(
  supabase: SupabaseClient,
  options: {
    userId: string;
    role: UserRole;
    approvalStatus: ApprovalStatus;
    approvedBy: string | null;
  },
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      role: options.role,
      approval_status: options.approvalStatus,
      approved_at:
        options.approvalStatus === "approved" ? new Date().toISOString() : null,
      approved_by:
        options.approvalStatus === "approved" ? options.approvedBy : null,
    })
    .eq("id", options.userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProfileNames(
  supabase: SupabaseClient,
  options: {
    userId: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  },
) {
  const updates: {
    first_name?: string | null;
    last_name?: string | null;
    display_name?: string | null;
    username?: string | null;
    updated_at: string;
  } = {
    updated_at: new Date().toISOString(),
  };

  if (options.firstName !== undefined || options.lastName !== undefined) {
    const firstName = options.firstName?.trim() || "";
    const lastName = options.lastName?.trim() || "";

    updates.first_name = firstName || null;
    updates.last_name = lastName || null;
    updates.display_name = [firstName, lastName].filter(Boolean).join(" ") || null;
  }

  if (options.username !== undefined) {
    updates.username = options.username.trim().toLowerCase() || null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", options.userId);

  if (error) {
    throw new Error(error.message);
  }
}

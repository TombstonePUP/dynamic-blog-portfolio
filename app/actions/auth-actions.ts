"use server";

import { isIP } from "node:net";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearLoginAttempt,
  getLoginAttemptBySubjectKey,
  insertAuthSecurityEvent,
  upsertLoginAttempt,
} from "@/db/queries/auth-security";
import {
  getAuthIdentityByIdentifier,
  getProfileById,
  isEmailTaken,
  isUsernameTaken,
} from "@/db/queries/profiles";
import { createAdminClient } from "@/db/supabase/admin";
import { createClient } from "@/db/supabase/server";
import type { AuthActionState } from "@/features/auth/form-state";
import { getAuthenticatedContext } from "@/services/auth";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/validators/auth";

const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;

type AuthRequestMeta = {
  ipAddress: string | null;
  userAgent: string | null;
  origin: string;
};

type ResolvedAuthIdentity = {
  userId: string | null;
  email: string | null;
  username: string | null;
  approvalStatus: string | null;
  subjectKey: string;
  normalizedIdentifier: string;
};

function normalizeIdentifier(value: string) {
  return value.trim().toLowerCase();
}

function getFirstFieldError(
  fieldErrors: Record<string, string[] | undefined>,
): string | undefined {
  for (const messages of Object.values(fieldErrors)) {
    if (messages?.length) {
      return messages[0];
    }
  }

  return undefined;
}

function buildErrorState(
  message: string,
  fieldErrors?: Record<string, string[] | undefined>,
): AuthActionState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

function buildValidationErrorState(
  fieldErrors: Record<string, string[] | undefined>,
): AuthActionState {
  return buildErrorState(
    getFirstFieldError(fieldErrors) || "Please review the form and try again.",
    fieldErrors,
  );
}

function normalizeIpAddress(value: string | null) {
  if (!value) {
    return null;
  }

  const candidate = value.split(",")[0]?.trim() || "";
  return isIP(candidate) ? candidate : null;
}

function resolveOriginFromHeaders(headerList: Awaited<ReturnType<typeof headers>>) {
  const explicitOrigin = headerList.get("origin");

  if (explicitOrigin) {
    return explicitOrigin;
  }

  const forwardedHost = headerList.get("x-forwarded-host");
  const forwardedProto = headerList.get("x-forwarded-proto");
  const host = forwardedHost?.split(",")[0]?.trim() || headerList.get("host") || "";

  if (host) {
    const protocol =
      forwardedProto?.split(",")[0]?.trim() ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");

    return `${protocol}://${host}`;
  }

  const configuredDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim();

  if (configuredDomain) {
    return configuredDomain.startsWith("http")
      ? configuredDomain
      : `https://${configuredDomain}`;
  }

  return "http://localhost:3000";
}

async function getAuthRequestMeta(): Promise<AuthRequestMeta> {
  const headerList = await headers();

  return {
    ipAddress: normalizeIpAddress(
      headerList.get("x-forwarded-for") || headerList.get("x-real-ip"),
    ),
    userAgent: headerList.get("user-agent")?.slice(0, 500) || null,
    origin: resolveOriginFromHeaders(headerList),
  };
}

function formatLockMessage(lockedUntil: string) {
  const remainingMs = new Date(lockedUntil).getTime() - Date.now();
  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));

  return `Too many failed sign-in attempts. Try again in about ${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"}.`;
}

async function safeInsertAuthEvent(
  admin: ReturnType<typeof createAdminClient>,
  options: Parameters<typeof insertAuthSecurityEvent>[1],
) {
  try {
    await insertAuthSecurityEvent(admin, options);
  } catch (error) {
    console.error("Failed to write auth security event.", error);
  }
}

async function resolveAuthIdentity(
  admin: ReturnType<typeof createAdminClient>,
  identifier: string,
): Promise<ResolvedAuthIdentity> {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const profile = await getAuthIdentityByIdentifier(admin, normalizedIdentifier);

  return {
    userId: profile?.id || null,
    email:
      profile?.email ||
      (normalizedIdentifier.includes("@") ? normalizedIdentifier : null),
    username: profile?.username || null,
    approvalStatus: profile?.approval_status || null,
    subjectKey: profile?.id
      ? `user:${profile.id}`
      : `identifier:${normalizedIdentifier}`,
    normalizedIdentifier,
  };
}

async function getActiveLock(
  admin: ReturnType<typeof createAdminClient>,
  subjectKey: string,
) {
  const attempt = await getLoginAttemptBySubjectKey(admin, subjectKey);

  if (!attempt?.locked_until) {
    return null;
  }

  return new Date(attempt.locked_until).getTime() > Date.now() ? attempt : null;
}

async function recordFailedLoginAttempt(
  admin: ReturnType<typeof createAdminClient>,
  identity: ResolvedAuthIdentity,
) {
  const now = new Date();
  const existing = await getLoginAttemptBySubjectKey(admin, identity.subjectKey);
  const activeLock =
    existing?.locked_until &&
    new Date(existing.locked_until).getTime() > now.getTime();
  const withinWindow =
    existing?.last_attempt_at &&
    now.getTime() - new Date(existing.last_attempt_at).getTime() <=
      LOGIN_ATTEMPT_WINDOW_MS;
  const previousAttempts = activeLock
    ? existing.failed_attempts
    : withinWindow
      ? existing.failed_attempts
      : 0;
  const failedAttempts = previousAttempts + 1;
  const lockedUntil =
    failedAttempts >= LOGIN_ATTEMPT_LIMIT
      ? new Date(now.getTime() + LOGIN_LOCK_MS).toISOString()
      : null;

  await upsertLoginAttempt(admin, {
    subjectKey: identity.subjectKey,
    userId: identity.userId,
    identifier: identity.normalizedIdentifier,
    failedAttempts,
    lockedUntil,
    lastAttemptAt: now.toISOString(),
  });

  return {
    failedAttempts,
    lockedUntil,
  };
}

export async function signInAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return buildValidationErrorState(parsed.error.flatten().fieldErrors);
  }

  const admin = createAdminClient();
  const requestMeta = await getAuthRequestMeta();
  const identity = await resolveAuthIdentity(admin, parsed.data.identifier);
  const activeLock = await getActiveLock(admin, identity.subjectKey);

  if (activeLock?.locked_until) {
    await safeInsertAuthEvent(admin, {
      userId: identity.userId,
      email: identity.email,
      username: identity.username,
      eventType: "login_blocked",
      severity: "warn",
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
      metadata: {
        subjectKey: identity.subjectKey,
        lockedUntil: activeLock.locked_until,
      },
    });

    return buildErrorState(formatLockMessage(activeLock.locked_until));
  }

  const supabase = await createClient();
  const signInEmail = identity.email || identity.normalizedIdentifier;
  const { error } = await supabase.auth.signInWithPassword({
    email: signInEmail,
    password: parsed.data.password,
  });

  if (error) {
    const attempt = await recordFailedLoginAttempt(admin, identity);

    await safeInsertAuthEvent(admin, {
      userId: identity.userId,
      email: identity.email,
      username: identity.username,
      eventType: attempt.lockedUntil ? "login_locked" : "login_failed",
      severity: "warn",
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
      metadata: {
        subjectKey: identity.subjectKey,
        failedAttempts: attempt.failedAttempts,
        lockedUntil: attempt.lockedUntil,
      },
    });

    return buildErrorState(
      attempt.lockedUntil
        ? formatLockMessage(attempt.lockedUntil)
        : "Invalid email/username or password.",
    );
  }

  await clearLoginAttempt(admin, identity.subjectKey);

  const profile = identity.userId
    ? await getProfileById(admin, identity.userId).catch(() => null)
    : null;

  await safeInsertAuthEvent(admin, {
    userId: identity.userId,
    email: identity.email,
    username: identity.username,
    eventType: "login_succeeded",
    severity: "info",
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
    metadata: {
      approvalStatus: profile?.approval_status || identity.approvalStatus,
    },
  });

  redirect(profile?.approval_status === "approved" ? "/dashboard" : "/pending");
}

export async function signUpAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    username: String(formData.get("username") || ""),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return buildValidationErrorState(parsed.error.flatten().fieldErrors);
  }

  const admin = createAdminClient();
  const requestMeta = await getAuthRequestMeta();

  if (await isEmailTaken(admin, parsed.data.email)) {
    return buildErrorState("An account with that email already exists.", {
      email: ["An account with that email already exists."],
    });
  }

  if (
    parsed.data.username &&
    (await isUsernameTaken(admin, parsed.data.username))
  ) {
    return buildErrorState("That username is already in use.", {
      username: ["That username is already in use."],
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${requestMeta.origin}/auth/confirm?next=/pending`,
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        display_name: `${parsed.data.firstName} ${parsed.data.lastName}`,
        ...(parsed.data.username
          ? { username: parsed.data.username }
          : {}),
      },
    },
  });

  if (error) {
    return buildErrorState(error.message);
  }

  await safeInsertAuthEvent(admin, {
    userId: data.user?.id || null,
    email: parsed.data.email,
    username: parsed.data.username || null,
    eventType: "signup_created",
    severity: "info",
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
    metadata: {
      emailVerificationRequired: !data.session,
    },
  });

  if (data.session) {
    redirect("/pending");
  }

  return {
    status: "success",
    message:
      "Check your email to confirm your account. After that, an admin will review your access.",
  };
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return buildValidationErrorState(parsed.error.flatten().fieldErrors);
  }

  const admin = createAdminClient();
  const requestMeta = await getAuthRequestMeta();
  const identity = await resolveAuthIdentity(admin, parsed.data.email);

  if (identity.userId && identity.email) {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(identity.email, {
      redirectTo: `${requestMeta.origin}/auth/confirm?next=/reset-password`,
    });

    if (error) {
      return buildErrorState(error.message);
    }
  }

  await safeInsertAuthEvent(admin, {
    userId: identity.userId,
    email: parsed.data.email,
    username: identity.username,
    eventType: identity.userId
      ? "password_reset_requested"
      : "password_reset_requested_unknown_email",
    severity: identity.userId ? "info" : "warn",
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
  });

  return {
    status: "success",
    message:
      "If an account exists for that email, a password reset link has been sent.",
  };
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return buildValidationErrorState(parsed.error.flatten().fieldErrors);
  }

  const context = await getAuthenticatedContext();

  if (!context) {
    return buildErrorState(
      "Your password reset session has expired. Request a new reset link.",
    );
  }

  const { error } = await context.supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return buildErrorState(error.message);
  }

  const admin = createAdminClient();
  const requestMeta = await getAuthRequestMeta();

  await safeInsertAuthEvent(admin, {
    userId: context.user.id,
    email: context.profile.email || context.user.email || null,
    username: context.profile.username,
    eventType: "password_reset_completed",
    severity: "info",
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
  });

  await context.supabase.auth.signOut();
  redirect("/login?reset=success");
}

import type { SupabaseClient } from "@supabase/supabase-js";

export type LoginAttemptRecord = {
  subject_key: string;
  user_id: string | null;
  identifier: string;
  failed_attempts: number;
  locked_until: string | null;
  last_attempt_at: string | null;
};

export type AuthSecurityEventSeverity = "info" | "warn" | "error";

const LOGIN_ATTEMPT_SELECT =
  "subject_key, user_id, identifier, failed_attempts, locked_until, last_attempt_at";

export async function getLoginAttemptBySubjectKey(
  supabase: SupabaseClient,
  subjectKey: string,
): Promise<LoginAttemptRecord | null> {
  const { data, error } = await supabase
    .from("auth_login_attempts")
    .select(LOGIN_ATTEMPT_SELECT)
    .eq("subject_key", subjectKey)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as LoginAttemptRecord | null) || null;
}

export async function upsertLoginAttempt(
  supabase: SupabaseClient,
  options: {
    subjectKey: string;
    userId?: string | null;
    identifier: string;
    failedAttempts: number;
    lockedUntil?: string | null;
    lastAttemptAt: string;
  },
): Promise<LoginAttemptRecord> {
  const { data, error } = await supabase
    .from("auth_login_attempts")
    .upsert(
      {
        subject_key: options.subjectKey,
        user_id: options.userId || null,
        identifier: options.identifier,
        failed_attempts: options.failedAttempts,
        locked_until: options.lockedUntil || null,
        last_attempt_at: options.lastAttemptAt,
      },
      { onConflict: "subject_key" },
    )
    .select(LOGIN_ATTEMPT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as LoginAttemptRecord;
}

export async function clearLoginAttempt(
  supabase: SupabaseClient,
  subjectKey: string,
) {
  const { error } = await supabase
    .from("auth_login_attempts")
    .delete()
    .eq("subject_key", subjectKey);

  if (error) {
    throw new Error(error.message);
  }
}

export async function insertAuthSecurityEvent(
  supabase: SupabaseClient,
  options: {
    userId?: string | null;
    email?: string | null;
    username?: string | null;
    eventType: string;
    severity?: AuthSecurityEventSeverity;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, unknown>;
  },
) {
  const { error } = await supabase.from("auth_security_events").insert({
    user_id: options.userId || null,
    email: options.email || null,
    username: options.username || null,
    event_type: options.eventType,
    severity: options.severity || "info",
    ip_address: options.ipAddress || null,
    user_agent: options.userAgent || null,
    metadata: options.metadata || {},
  });

  if (error) {
    throw new Error(error.message);
  }
}

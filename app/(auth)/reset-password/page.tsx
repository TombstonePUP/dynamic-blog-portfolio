import Link from "next/link";
import ResetPasswordForm from "@/features/auth/components/reset-password-form";
import { getAuthenticatedContext } from "@/services/auth";

export const metadata = {
  title: "Reset Password | The Strengths Writer",
  description: "Choose a new password for your account.",
};

export default async function ResetPasswordPage() {
  const context = await getAuthenticatedContext();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f3ea] px-6 py-14">
      <div className="w-full max-w-xl border border-black/10 bg-white p-10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2b776a]/70">
          The Strengths Writer
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-tight text-foreground">
          Choose a new password
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-foreground/70">
          Use a strong password with an uppercase letter, lowercase letter,
          number, and special character.
        </p>

        <div className="mt-8">
          {context ? (
            <ResetPasswordForm
              email={context.profile.email || context.user.email || null}
            />
          ) : (
            <div className="space-y-4 rounded-sm border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              <p>
                This password reset link is missing or has expired. Request a
                new reset email to continue.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
              >
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

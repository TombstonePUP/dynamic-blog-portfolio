"use client";

import { resetPasswordAction } from "@/app/actions/auth-actions";
import {
  INITIAL_AUTH_ACTION_STATE,
  type AuthActionState,
} from "@/features/auth/form-state";
import { Loader2, LockKeyhole } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

function getPasswordStrength(password: string) {
  if (!password) {
    return 0;
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

function getStrengthColor(score: number) {
  if (score === 0) return "bg-gray-200";
  if (score <= 2) return "bg-red-500";
  if (score <= 3) return "bg-yellow-500";
  if (score <= 4) return "bg-blue-500";
  return "bg-green-500";
}

function getStrengthLabel(score: number) {
  if (score === 0) return "";
  if (score <= 2) return "Weak";
  if (score <= 3) return "Fair";
  if (score <= 4) return "Good";
  return "Strong";
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

function FormMessage({ state }: { state: AuthActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.status === "error" ? "text-sm text-red-600" : "text-sm text-[#2b776a]"}>
      {state.message}
    </p>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {label}
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
    </button>
  );
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const score = getPasswordStrength(password);

  if (!password) {
    return null;
  }

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-foreground/40">Strength</span>
        <span
          style={{
            color:
              score <= 2
                ? "#ef4444"
                : score <= 3
                  ? "#eab308"
                  : score <= 4
                    ? "#3b82f6"
                    : "#22c55e",
          }}
        >
          {getStrengthLabel(score)}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden bg-black/5">
        <div
          className={`h-full transition-all duration-500 ease-out ${getStrengthColor(score)}`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function ResetPasswordForm({ email }: { email?: string | null }) {
  const [state, action] = useActionState(
    resetPasswordAction,
    INITIAL_AUTH_ACTION_STATE,
  );
  const [password, setPassword] = useState("");

  return (
    <form action={action} className="space-y-4">
      {email ? (
        <div className="rounded-sm border border-black/10 bg-[#fbfaf6] px-4 py-3 text-sm text-foreground/60">
          Resetting password for <span className="font-semibold text-foreground">{email}</span>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          New password
        </span>
        <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
          <LockKeyhole className="size-4 text-foreground/35" />
          <input
            type="password"
            name="password"
            placeholder="8+ chars, uppercase, number, symbol"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            autoComplete="new-password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <FieldError message={state.fieldErrors?.password?.[0]} />
        <PasswordStrengthMeter password={password} />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Confirm password
        </span>
        <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
          <LockKeyhole className="size-4 text-foreground/35" />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Re-enter your new password"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            autoComplete="new-password"
          />
        </div>
        <FieldError message={state.fieldErrors?.confirmPassword?.[0]} />
      </label>

      <FormMessage state={state} />
      <SubmitButton label="Update password" />
    </form>
  );
}

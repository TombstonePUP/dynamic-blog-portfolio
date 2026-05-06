"use client";

import {
  forgotPasswordAction,
  signInAction,
  signUpAction,
} from "@/app/actions/auth-actions";
import {
  INITIAL_AUTH_ACTION_STATE,
  type AuthActionState,
} from "@/features/auth/form-state";
import { Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

type AuthMode = "sign-in" | "sign-up" | "forgot-password";

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

function FormMessage({
  state,
  fallbackMessage,
}: {
  state: AuthActionState;
  fallbackMessage?: string | null;
}) {
  const message = state.message || fallbackMessage;

  if (!message) {
    return null;
  }

  const className =
    state.status === "error"
      ? "text-sm text-red-600"
      : "text-sm text-[#2b776a]";

  return <p className={className}>{message}</p>;
}

function SubmitButton({
  label,
}: {
  label: string;
}) {
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

function SignInForm({
  initialNotice,
  onForgotPassword,
}: {
  initialNotice?: string | null;
  onForgotPassword: () => void;
}) {
  const [state, action] = useActionState(
    signInAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Email or username
        </span>
        <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
          <Mail className="size-4 text-foreground/35" />
          <input
            name="identifier"
            placeholder="you@example.com or writer_name"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <FieldError message={state.fieldErrors?.identifier?.[0]} />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Password
        </span>
        <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
          <LockKeyhole className="size-4 text-foreground/35" />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            autoComplete="current-password"
          />
        </div>
        <FieldError message={state.fieldErrors?.password?.[0]} />
      </label>

      <div className="flex items-center justify-between gap-4 text-sm">
        <button
          type="button"
          onClick={onForgotPassword}
          className="ml-auto font-medium text-[#2b776a] transition hover:text-[#1f5b52]"
        >
          Forgot password?
        </button>
      </div>

      <FormMessage state={state} fallbackMessage={initialNotice} />
      <SubmitButton label="Sign in" />
    </form>
  );
}

function SignUpForm() {
  const [state, action] = useActionState(
    signUpAction,
    INITIAL_AUTH_ACTION_STATE,
  );
  const [password, setPassword] = useState("");

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
            First name
          </span>
          <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
            <UserRound className="size-4 text-foreground/35" />
            <input
              name="firstName"
              placeholder="Regie"
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
              autoComplete="given-name"
            />
          </div>
          <FieldError message={state.fieldErrors?.firstName?.[0]} />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
            Last name
          </span>
          <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
            <UserRound className="size-4 text-foreground/35" />
            <input
              name="lastName"
              placeholder="San Juan"
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
              autoComplete="family-name"
            />
          </div>
          <FieldError message={state.fieldErrors?.lastName?.[0]} />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Username
        </span>
        <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
          <UserRound className="size-4 text-foreground/35" />
          <input
            name="username"
            placeholder="Optional unique username"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <FieldError message={state.fieldErrors?.username?.[0]} />
        <p className="mt-1 text-xs text-foreground/50">
          Letters, numbers, and underscores only. You can also leave this blank.
        </p>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Email
        </span>
        <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
          <Mail className="size-4 text-foreground/35" />
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <FieldError message={state.fieldErrors?.email?.[0]} />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Password
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
            placeholder="Re-enter your password"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            autoComplete="new-password"
          />
        </div>
        <FieldError message={state.fieldErrors?.confirmPassword?.[0]} />
      </label>

      <FormMessage state={state} />
      <SubmitButton label="Create account" />
    </form>
  );
}

function ForgotPasswordForm({
  onBack,
}: {
  onBack: () => void;
}) {
  const [state, action] = useActionState(
    forgotPasswordAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2b776a]/70">
          Password recovery
        </p>
        <h2 className="text-2xl font-bold text-foreground">
          Reset your password
        </h2>
        <p className="text-sm leading-6 text-foreground/60">
          Enter the email tied to your account and we&apos;ll send a secure reset
          link.
        </p>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Email
        </span>
        <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
          <Mail className="size-4 text-foreground/35" />
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <FieldError message={state.fieldErrors?.email?.[0]} />
      </label>

      <FormMessage state={state} />
      <SubmitButton label="Send reset link" />

      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm font-medium text-[#2b776a] transition hover:text-[#1f5b52]"
      >
        Back to sign in
      </button>
    </form>
  );
}

export default function AuthForm({
  initialNotice,
}: {
  initialNotice?: string | null;
}) {
  const [mode, setMode] = useState<AuthMode>("sign-in");

  return (
    <div className="w-full max-w-md bg-white/90 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur">
      {mode !== "forgot-password" ? (
        <div className="mb-8 flex gap-2 bg-[#f2efe7] p-1">
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className={`flex-1 px-4 py-2 text-sm font-semibold transition ${mode === "sign-in"
              ? "bg-white text-foreground shadow-sm"
              : "text-foreground/55"
              }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            className={`flex-1 px-4 py-2 text-sm font-semibold transition ${mode === "sign-up"
              ? "bg-white text-foreground shadow-sm"
              : "text-foreground/55"
              }`}
          >
            Create account
          </button>
        </div>
      ) : null}

      {mode === "sign-in" ? (
        <SignInForm
          key="sign-in"
          initialNotice={initialNotice}
          onForgotPassword={() => setMode("forgot-password")}
        />
      ) : null}

      {mode === "sign-up" ? <SignUpForm key="sign-up" /> : null}

      {mode === "forgot-password" ? (
        <ForgotPasswordForm
          key="forgot-password"
          onBack={() => setMode("sign-in")}
        />
      ) : null}
    </div>
  );
}

"use client";

import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthMode = "sign-in" | "sign-up";

const supabase = createClient();

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setNotice(null);

    if (mode === "sign-up") {
      const trimmedFirstName = firstName.trim();
      const trimmedLastName = lastName.trim();
      const normalizedEmail = email.trim().toLowerCase();

      if (!trimmedFirstName || !trimmedLastName) {
        setErrorMessage("Please enter your first and last name.");
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/pending`,
          data: {
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
            display_name: `${trimmedFirstName} ${trimmedLastName}`,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setSubmitting(false);
        return;
      }

      if (data.session) {
        router.replace("/pending");
        router.refresh();
        return;
      }

      setNotice(
        "Check your email to confirm your account. After that, an admin will review your access.",
      );
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md bg-white/90 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur">
      <div className="mb-8 flex gap-2 bg-[#f2efe7] p-1">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={`flex-1 px-4 py-2 text-sm font-semibold transition ${
            mode === "sign-in" ? "bg-white text-foreground shadow-sm" : "text-foreground/55"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={`flex-1 px-4 py-2 text-sm font-semibold transition ${
            mode === "sign-up" ? "bg-white text-foreground shadow-sm" : "text-foreground/55"
          }`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "sign-up" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
                First name
              </span>
              <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
                <UserRound className="size-4 text-foreground/35" />
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  placeholder="Regie"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
                Last name
              </span>
              <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
                <UserRound className="size-4 text-foreground/35" />
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  placeholder="San Juan"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
                />
              </div>
            </label>
          </div>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
            Email
          </span>
          <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
            <Mail className="size-4 text-foreground/35" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
            Password
          </span>
          <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
            <LockKeyhole className="size-4 text-foreground/35" />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            />
          </div>
        </label>

        {errorMessage ? (
          <p className="text-sm text-red-600">{errorMessage}</p>
        ) : null}

        {notice ? (
          <p className="text-sm text-[#2b776a]">{notice}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          {mode === "sign-in" ? "Enter the editor" : "Create account"}
        </button>
      </form>
    </div>
  );
}

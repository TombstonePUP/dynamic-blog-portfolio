"use client";

import { createClient } from "@/utils/supabase/client";
import { Loader2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

type AuthMode = "sign-in" | "sign-up";

const supabase = createClient();

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => {
  // If we wanted to enforce firstName/lastName here, we'd need the mode.
  // But we can also do it in the handleSubmit or with a dynamic schema.
  return true;
}, {});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const password = watch("password");

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-gray-200";
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthLabel = (score: number) => {
    if (score === 0) return "";
    if (score <= 2) return "Weak";
    if (score <= 3) return "Fair";
    if (score <= 4) return "Good";
    return "Strong";
  };

  // Reset form when switching modes
  useEffect(() => {
    reset();
    setErrorMessage(null);
    setNotice(null);
  }, [mode, reset]);

  async function onSubmit(values: AuthFormValues) {
    setSubmitting(true);
    setErrorMessage(null);
    setNotice(null);

    const normalizedEmail = values.email.trim().toLowerCase();

    if (mode === "sign-up") {
      const firstName = values.firstName?.trim();
      const lastName = values.lastName?.trim();

      if (!firstName || !lastName) {
        setErrorMessage("Please enter your first and last name.");
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/pending`,
          data: {
            first_name: firstName,
            last_name: lastName,
            display_name: `${firstName} ${lastName}`,
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
      email: normalizedEmail,
      password: values.password,
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
          className={`flex-1 px-4 py-2 text-sm font-semibold transition ${mode === "sign-in" ? "bg-white text-foreground shadow-sm" : "text-foreground/55"
            }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={`flex-1 px-4 py-2 text-sm font-semibold transition ${mode === "sign-up" ? "bg-white text-foreground shadow-sm" : "text-foreground/55"
            }`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mode === "sign-up" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
                First name
              </span>
              <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
                <UserRound className="size-4 text-foreground/35" />
                <input
                  {...register("firstName")}
                  placeholder="Regie"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
              )}
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
                Last name
              </span>
              <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
                <UserRound className="size-4 text-foreground/35" />
                <input
                  {...register("lastName")}
                  placeholder="San Juan"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
              )}
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
              {...register("email")}
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
            Password
          </span>
          <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
            <LockKeyhole className="size-4 text-foreground/35" />
            <input
              type="password"
              {...register("password")}
              placeholder="At least 6 characters"
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}

          {mode === "sign-up" && password && (
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-foreground/40">Strength</span>
                <span style={{ color: strength <= 2 ? '#ef4444' : strength <= 3 ? '#eab308' : strength <= 4 ? '#3b82f6' : '#22c55e' }}>
                  {getStrengthLabel(strength)}
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden bg-black/5">
                <div
                  className={`h-full transition-all duration-500 ease-out ${getStrengthColor(strength)}`}
                  style={{ width: `${(strength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
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
          {mode === "sign-in" ? "Login" : "Create account"}
          {submitting && <Loader2 className="size-4 animate-spin" />}
        </button>
      </form>
    </div>
  );
}

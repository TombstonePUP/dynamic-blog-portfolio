"use client";

import { updateUserProfile } from "@/app/actions/user-management-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ChangePasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    control,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const newPassword = useWatch({ control, name: "newPassword" });

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

  const strength = getPasswordStrength(newPassword || "");

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

  async function onSubmit(values: PasswordFormValues) {
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await updateUserProfile({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (result.success) {
        setSuccessMessage("Password changed successfully!");
        reset();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.error || "Failed to change password");
      }
    } catch (error) {
      setErrorMessage("An error occurred while changing your password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      {successMessage ? (
        <p className="text-sm text-[#2b776a]">{successMessage}</p>
      ) : null}

      {/* Current Password */}
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Current Password
        </span>
        <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
          <LockKeyhole className="size-4 text-foreground/35" />
          <input
            type="password"
            {...register("currentPassword")}
            placeholder="Enter your current password"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
          />
        </div>
        {errors.currentPassword && (
          <p className="mt-1 text-xs text-red-500">
            {errors.currentPassword.message}
          </p>
        )}
      </label>

      {/* New Password */}
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          New Password
        </span>
        <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
          <LockKeyhole className="size-4 text-foreground/35" />
          <input
            type="password"
            {...register("newPassword")}
            placeholder="At least 6 characters"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
          />
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-xs text-red-500">
            {errors.newPassword.message}
          </p>
        )}

        {newPassword && (
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-foreground/40">Strength</span>
              <span
                style={{
                  color:
                    strength <= 2
                      ? "#ef4444"
                      : strength <= 3
                        ? "#eab308"
                        : strength <= 4
                          ? "#3b82f6"
                          : "#22c55e",
                }}
              >
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

      {/* Confirm Password */}
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Confirm New Password
        </span>
        <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
          <LockKeyhole className="size-4 text-foreground/35" />
          <input
            type="password"
            {...register("confirmPassword")}
            placeholder="Confirm new password"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </label>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || !isValid || !isDirty}
        className="flex w-full items-center justify-center gap-2 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Change Password
        {submitting && <Loader2 className="size-4 animate-spin" />}
      </button>
    </form>
  );
}

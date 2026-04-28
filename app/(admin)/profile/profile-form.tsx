"use client";

import { updateUserProfile } from "@/app/actions/user-management-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Display name is required")
    .min(2, "Name must be at least 2 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userName,
    },
    mode: "onChange",
  });

  const currentNameValue = watch("name");

  useEffect(() => {
    reset({ name: userName });
  }, [userName, reset]);

  async function onSubmit(values: ProfileFormValues) {
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await updateUserProfile({
        name: values.name.trim(),
      });

      if (result.success) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.error || "Failed to update profile");
      }
    } catch (error) {
      setErrorMessage("An error occurred while updating your profile");
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

      {/* Display Name Field */}
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Display Name
        </span>
        <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
          <UserRound className="size-4 text-foreground/35" />
          <input
            {...register("name")}
            value={currentNameValue}
            placeholder="Your display name"
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
        {!errors.name && userName && (
          <p className="mt-1 text-xs text-foreground/50">
            Current name: <span className="font-semibold">{userName}</span>
          </p>
        )}
      </label>

      {/* Email Field (Read-only) */}
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Email Address
        </span>
        <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3 opacity-60 cursor-not-allowed">
          <Mail className="size-4 text-foreground/35" />
          <input
            type="email"
            value={userEmail}
            disabled
            className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
          />
        </div>
        <p className="mt-1 text-xs text-foreground/50">
          Email cannot be changed. Contact support if needed.
        </p>
      </label>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || !isValid || !isDirty}
        className="flex w-full items-center justify-center gap-2 bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Save Changes
        {submitting && <Loader2 className="size-4 animate-spin" />}
      </button>
    </form>
  );
}

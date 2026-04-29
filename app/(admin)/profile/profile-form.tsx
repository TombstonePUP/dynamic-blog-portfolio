"use client";

import { updateUserProfile } from "@/app/actions/user-management-actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm({
  profile,
}: {
  profile: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const firstName = profile?.first_name || "";
  const lastName = profile?.last_name || "";
  const userEmail = profile?.email || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName,
      lastName,
    },
    mode: "onChange",
  });

  useEffect(() => {
    reset({ firstName, lastName });
  }, [firstName, lastName, reset]);

  async function onSubmit(values: ProfileFormValues) {
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await updateUserProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
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

      {/* First Name Field */}
      <div className="flex items-center gap-3">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
            First Name
          </span>
          <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
            <UserRound className="size-4 text-foreground/35" />
            <input
              {...register("firstName")}
              placeholder="Your first name"
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.firstName.message}
            </p>
          )}
        </label>

        {/* Last Name Field */}
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/50">
            Last Name
          </span>
          <div className="flex items-center gap-3 border border-black/10 bg-[#fbfaf6] px-4 py-3">
            <UserRound className="size-4 text-foreground/35" />
            <input
              {...register("lastName")}
              placeholder="Your last name"
              className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/30"
            />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.lastName.message}
            </p>
          )}
        </label>
      </div>
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

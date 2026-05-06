import ChangePasswordForm from "@/features/users/components/change-password-form";
import ProfileForm from "@/features/users/components/profile-form";
import { getAuthenticatedContext } from "@/services/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Profile | The Strengths Writer",
  description: "Edit your profile information",
};

export default async function ProfilePage() {
  const context = await getAuthenticatedContext();

  if (!context) {
    redirect("/login");
  }

  const { profile } = context;

  return (
    <main className="flex min-h-full flex-col">
      <div className="flex-1 overflow-y-auto bg-admin-bg">
        <div className="mx-auto max-w-6xl px-8 py-8 space-y-8">
          <section className="flex flex-col gap-2">
            <h1 className="text-3xl font-black tracking-tight text-admin-heading">
              Profile Settings
            </h1>
            <p className="text-sm text-admin-muted font-semibold">
              <span className="font-normal text-admin-text">Joined since:</span>{" "}
              {new Date(profile?.approved_at || new Date()).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}
            </p>
          </section>
          <section className="flex gap-8">
            <div className=" border border-admin-surface-hover bg-admin-surface p-8 h-fit min-w-[520px]">
              <ProfileForm profile={profile} />
            </div>
            <div className=" border border-admin-surface-hover bg-admin-surface p-8 h-fit min-w-[520px]">
              <ChangePasswordForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

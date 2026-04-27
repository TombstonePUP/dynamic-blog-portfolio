import { redirect } from "next/navigation";
import AuthForm from "./auth-form";
import { getAuthenticatedContext } from "@/lib/admin-data.server";

export const metadata = {
  title: "Login | The Strengths Writer",
  description: "Sign in to manage your stories.",
};

export default async function LoginPage() {
  const context = await getAuthenticatedContext();

  if (context) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative overflow-hidden bg-[#1f3d39] px-8 py-14 text-[#f7f2ea] sm:px-12 lg:px-16 lg:py-18">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_48%)]" />
        <div className="relative flex h-full max-w-xl flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
              The Strengths Writer
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-[1.02] sm:text-5xl">
              Write, refine, and publish from one place.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/75">
              Your editor now runs on Supabase-backed authentication and post storage, so drafts,
              profiles, and publishing live in one system instead of local files.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Profiles", value: "Auth-backed" },
              { label: "Drafts", value: "Private" },
              { label: "Publishing", value: "Live DB" },
            ].map((item) => (
              <div key={item.label} className="border border-white/12 bg-white/6 px-4 py-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-14 sm:px-10">
        <AuthForm />
      </section>
    </main>
  );
}

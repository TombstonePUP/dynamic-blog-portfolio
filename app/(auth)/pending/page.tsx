import { redirect } from "next/navigation";
import { getAuthenticatedContext, isApprovedProfile } from "@/lib/admin-data.server";

export const metadata = {
  title: "Pending Approval | The Strengths Writer",
  description: "Wait for an administrator to approve your account.",
};

export default async function PendingApprovalPage() {
  const context = await getAuthenticatedContext();

  if (!context) {
    redirect("/login");
  }

  if (isApprovedProfile(context.profile)) {
    redirect("/dashboard");
  }

  const firstName =
    context.profile?.first_name ||
    context.profile?.display_name ||
    context.user.email?.split("@")[0] ||
    "Writer";
  const isRejected = context.profile?.approval_status === "rejected";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f3ea] px-6 py-14">
      <div className="w-full max-w-2xl border border-black/10 bg-white p-10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2b776a]/70">
          The Strengths Writer
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-tight text-foreground">
          {isRejected ? "Your account needs a follow-up review." : `Thanks, ${firstName}. Your account is waiting for approval.`}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-foreground/70">
          {isRejected
            ? "An administrator has not approved your access yet. Please contact the lead author if you still need entry to the writing dashboard."
            : "You can sign in with the email and password you created, but the dashboard will stay locked until an administrator approves your account."}
        </p>

        <div className="mt-8 grid gap-4 border border-black/10 bg-[#fbfaf6] p-6 text-sm text-foreground/65 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/40">
              Account email
            </p>
            <p className="mt-2 font-medium text-foreground">{context.user.email}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/40">
              Access state
            </p>
            <p className="mt-2 font-medium capitalize text-foreground">
              {context.profile?.approval_status || "pending"}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
            >
              Sign out
            </button>
          </form>
          <p className="text-sm text-foreground/55">
            Refresh this page after an admin approves your account.
          </p>
        </div>
      </div>
    </main>
  );
}

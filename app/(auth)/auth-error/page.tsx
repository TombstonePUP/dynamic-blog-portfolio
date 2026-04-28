import Link from "next/link";

export const metadata = {
  title: "Auth Error | The Strengths Writer",
  description: "We could not complete your sign-in request.",
};

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="max-w-md bg-white p-8 text-center shadow-[0_24px_70px_-38px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/45">
          Authentication
        </p>
        <h1 className="mt-3 text-2xl font-bold text-foreground">We could not finish that sign-in.</h1>
        <p className="mt-4 text-sm leading-6 text-foreground/70">
          The link may have expired, or the confirmation request was incomplete. Head back to
          login and try again.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}

import { LogoIcon } from "@/components/app-logo";
import {
  getAuthenticatedContext,
  isApprovedProfile,
} from "@/lib/admin-data.server";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "./auth-form";
import DashboardPreview from "./dashboard-preview";

export const metadata = {
  title: "Login | The Strengths Writer",
  description: "Sign in to manage your stories.",
};

export default async function LoginPage() {
  const context = await getAuthenticatedContext();

  if (context) {
    redirect(isApprovedProfile(context.profile) ? "/dashboard" : "/pending");
  }

  return (
    <main className="grid min-h-screen lg:max-h-screen lg:overflow-hidden grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
      {/* ── Left panel ── */}
      <section className="hidden lg:flex relative flex-col overflow-hidden bg-[#1f3d39] px-8 text-[#f7f2ea] sm:px-12 lg:px-16">
        {/* Diagonal overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_48%)]" />

        {/* Watermark logo */}
        <LogoIcon className="pointer-events-none absolute -bottom-32 -right-32 size-[600px] brightness-0 invert opacity-[0.05]" />

        {/* Nav */}
        <nav className="absolute top-16 left-16 right-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon className="size-8 brightness-0 invert opacity-90" />
            {/* <Link href="/" className="text-base font-semibold text-white">
              theStrengthsWriter
            </Link> */}
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-white/80 hover:[&_a]:text-white [&_a]:transition-colors">
            <Link href="/topics" className="hover:text-white">
              Blog
            </Link>
            <Link href="/about" className="hover:text-white">
              About
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </nav>

        {/* 3D perspective container */}
        <div className="pointer-events-none relative z-20 h-full mt-14  shrink-0 overflow-hidden [mask-image:radial-gradient(white_30%,transparent_90%)] [perspective:4000px] [perspective-origin:center]">
          <div className="[-translate-y-10] [-translate-z-10] [transform:rotateX(10deg)_rotateY(20deg)_rotateZ(-10deg)] [transform-style:preserve-3d]">
            <DashboardPreview />
          </div>
        </div>

        {/* Hero copy */}
        <div className="absolute z-20 bottom-16">
          <h1 className="text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl">
            Write, refine, and <br />
            <span className="text-gray-400">publish from one place.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/60">
            Your editor now runs on Supabase-backed authentication and post
            storage, so drafts, profiles, publishing, and access approvals live
            in one system.
          </p>
        </div>
      </section>

      {/* ── Right panel ── */}
      <section className="relative flex flex-col items-center justify-center px-6 py-14 sm:px-10">
        <AuthForm />
        <footer className="absolute bottom-8 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} theStrengthsWriter. All rights
            reserved.
          </p>
        </footer>
      </section>
    </main>
  );
}

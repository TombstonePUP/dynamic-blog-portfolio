import { LogoIcon } from "@/components/app-logo";
import AuthForm from "@/features/auth/components/auth-form";
import PostsCarousel from "@/features/auth/components/posts-carousel";
import { getAuthenticatedContext, isApprovedProfile } from "@/services/auth";
import { getBlogs } from "@/services/posts";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login | The Strengths Writer",
  description: "Sign in to manage your stories.",
};

type LoginPageProps = {
  searchParams: Promise<{
    reset?: string | string[] | undefined;
  }>;
};

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const context = await getAuthenticatedContext();
  const initialNotice =
    readSearchParam(params.reset) === "success"
      ? "Your password has been reset. Sign in with your new password."
      : null;

  if (context) {
    redirect(isApprovedProfile(context.profile) ? "/dashboard" : "/pending");
  }

  const featuredPosts = (await getBlogs()).slice(0, 5);

  return (
    <main className="grid min-h-screen grid-cols-1 lg:max-h-screen lg:grid-cols-[1.1fr_0.9fr] lg:overflow-hidden">
      <section className="relative hidden flex-col overflow-hidden bg-[#1f3d39] px-8 text-[#f7f2ea] sm:px-12 lg:flex lg:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_48%)]" />

        <LogoIcon className="pointer-events-none absolute -bottom-32 -right-32 size-[600px] brightness-0 invert opacity-[0.05]" />

        <nav className="absolute left-16 right-16 top-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon className="size-8 brightness-0 invert opacity-90" />
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-white/80 hover:[&_a]:text-white [&_a]:transition-colors">
            <Link href="/topics" className="hover:text-white">
              Blog
            </Link>
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/login" className="hover:text-white">
              Login
            </Link>
          </div>
        </nav>

        <div className="pointer-events-none relative z-20 mt-14 h-full shrink-0 overflow-hidden [mask-image:radial-gradient(white_30%,transparent_90%)] [perspective:4000px] [perspective-origin:center]">
          <div className="[-translate-y-10] [-translate-z-10] [transform:rotateX(10deg)_rotateY(20deg)_rotateZ(-10deg)] [transform-style:preserve-3d]">
            {featuredPosts.length > 0 ? (
              <PostsCarousel posts={featuredPosts} />
            ) : (
              <div className="flex aspect-[16/10] w-full items-center justify-center border border-white/10 bg-black/20 px-10 text-center text-white/65 shadow-2xl backdrop-blur-sm">
                No published stories yet.
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-16 z-20">
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

      <section className="relative flex flex-col items-center justify-center px-6 py-14 sm:px-10">
        <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
          <LogoIcon className="size-12 text-[#1f3d39]" />
          <h1 className="text-xl font-bold tracking-tight text-[#1f3d39]">
            theStrengthsWriter
          </h1>
        </div>
        <AuthForm initialNotice={initialNotice} />
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

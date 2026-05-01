import DashboardStats from "@/components/admin/dashboard-stats";
import StoryCard from "@/components/admin/story-card";
import { getOwnedPosts, isAdminProfile } from "@/lib/admin-data.server";
import { Eye, FileEdit, Layout, Users } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Overview | Writer Dashboard",
  description: "Create and preview your stories.",
};

export default async function DashboardHome() {
  const { posts, profile, supabase } = await getOwnedPosts();
  const recentStories = posts.slice(0, 6);
  const publishedCount = posts.filter(
    (post) => post.status === "published",
  ).length;
  const draftCount = posts.filter((post) => post.status === "draft").length;
  const archivedCount = posts.filter(
    (post) => post.status === "archived",
  ).length;
  const isAdmin = isAdminProfile(profile);
  let pendingApprovals = 0;

  if (isAdmin) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending");

    pendingApprovals = count || 0;
  }

  const stats = [
    { label: "Total Stories", value: String(posts.length), icon: Layout },
    { label: "Active Drafts", value: String(draftCount), icon: FileEdit },
    { label: "Published", value: String(publishedCount), icon: Eye },
  ];
  const displayName = profile?.display_name || "Writer";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 md:px-8 py-10">
      <div className="flex flex-col gap-10">
        {/* Welcome Section */}
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-admin-heading">
            Welcome back, {displayName}.
          </h1>
          <p className="text-sm leading-6 text-admin-text">
            Here&apos;s what&apos;s happening with your publishing desk today.
          </p>
        </section>

        {/* Stats Grid */}
        <DashboardStats stats={stats} isLoading={false} />

        {isAdmin ? (
          <section className="border border-admin-surface-hover bg-admin-surface p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-admin-accent">
                  User Management
                </p>
                <h3 className="mt-2 text-xl md:text-2xl font-bold tracking-tight text-admin-heading">
                  {pendingApprovals} account{pendingApprovals === 1 ? "" : "s"}{" "}
                  waiting for approval
                </h3>
                <p className="mt-3 text-sm leading-6 text-admin-text">
                  Review new registrations, approve writers, and manage who can
                  enter the publishing dashboard.
                </p>
              </div>
              <Link
                href="/users"
                className="inline-flex items-center justify-center border border-admin-accent bg-admin-accent px-5 py-3 text-sm font-semibold text-admin-contrast transition-colors hover:bg-admin-accent/90"
              >
                Open User Management
              </Link>
            </div>
          </section>
        ) : null}

        {/* Quick Actions */}
        <section className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6 border border-admin-surface-hover bg-admin-surface p-6 md:p-10 h-fit">
            <h3 className="text-xl font-bold tracking-tight text-admin-heading">
              Quick Actions
            </h3>
            <div
              className={`grid grid-cols-1 gap-4 ${isAdmin ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
            >
              <Link
                href="/editor"
                className="inline-flex items-center justify-center gap-2 border border-admin-accent bg-admin-accent px-5 py-2 text-sm font-semibold text-admin-contrast transition-colors hover:bg-admin-accent/90"
              >
                <Plus size={16} />
                New Story
              </Link>
              <Link
                href="/topics"
                className="inline-flex items-center justify-center gap-2 border border-admin-surface-hover bg-admin-surface px-5 py-2 text-sm font-semibold text-admin-heading transition-colors hover:bg-admin-surface-hover"
              >
                <Eye size={16} />
                View Site
              </Link>
              {isAdmin ? (
                <Link
                  href="/users"
                  className="inline-flex items-center justify-center gap-2 border border-admin-surface-hover bg-admin-surface px-5 py-2 text-sm font-semibold text-admin-heading transition-colors hover:bg-admin-surface-hover !whitespace-nowrap"
                >
                  <Users size={16} />
                  Manage Users
                </Link>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-4 border border-admin-surface-hover bg-admin-surface p-6 md:p-10">
            <h3 className="text-xl font-bold tracking-tight text-admin-heading">
              Writing Tip
            </h3>
            <p className="text-sm leading-relaxed text-admin-text font-mono">
              {draftCount > 0
                ? `You have ${draftCount} draft${draftCount === 1 ? "" : "s"} waiting. A short revision session can turn one of them into your next published piece.`
                : "> You do not need a big writing window to make progress. A clean headline, a stronger excerpt, and one honest paragraph can move a draft forward."}
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-admin-accent">
              <Users size={12} />
              {archivedCount} archived{" "}
              {archivedCount === 1 ? "story" : "stories"}
            </div>
          </div>
        </section>

        <section className="border border-admin-surface-hover bg-admin-surface p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-admin-accent">
                Story Library
              </p>
              <h3 className="mt-2 text-xl md:text-2xl font-bold tracking-tight text-admin-heading">
                Your story library now runs from Supabase
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-admin-text">
                Drafts, published posts, author bylines, and migrated story
                assets now live in the database-backed publishing system instead
                of local content folders.
              </p>
            </div>
            <Link
              href="/posts"
              className="inline-flex items-center justify-center border border-admin-accent bg-admin-accent px-4 py-2 text-sm font-semibold text-admin-contrast transition-colors hover:bg-admin-accent/90"
            >
              Open Explorer
            </Link>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recentStories.map((post) => (
              <div key={post.id}>
                <StoryCard
                  title={post.title}
                  excerpt={post.excerpt}
                  slug={post.slug}
                  status={post.status}
                  date={post.updated_at}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Plus({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

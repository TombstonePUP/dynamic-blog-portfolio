import LatestStoryCard from "@/features/posts/components/admin/latest-story-card";
import OverviewStats from "@/features/posts/components/admin/overview-stats";
import PageHeader from "@/features/posts/components/admin/page-header";
import StoryRow from "@/features/posts/components/admin/story-row";
import { isAdminProfile } from "@/services/auth";
import { getOwnedPosts } from "@/services/posts";
import { countPendingApprovals } from "@/services/users";
import { ArrowRight, UserPlus } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Overview | Writer Dashboard",
  description: "Create and preview your stories.",
};

export default async function DashboardHome() {
  const { posts, profile } = await getOwnedPosts();
  const publishedCount = posts.filter(
    (post) => post.status === "published",
  ).length;
  const draftCount = posts.filter((post) => post.status === "draft").length;
  const archivedCount = posts.filter(
    (post) => post.status === "archived",
  ).length;
  const isAdmin = isAdminProfile(profile);
  const pendingApprovals = isAdmin ? await countPendingApprovals() : 0;

  const authorName = profile?.display_name || "Writer";
  const latest = posts[0] || null;
  const drafts = posts.filter((post) => post.status === "draft").slice(0, 5);

  return (
    <main className="flex-1">
      <PageHeader title="Overview">
        <Link
          href="/editor"
          className="rounded-md bg-admin-accent px-4 py-1.5 text-[13px] font-semibold text-admin-contrast transition-colors hover:bg-admin-accent/90"
        >
          New story
        </Link>
      </PageHeader>

      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-6 pb-16 lg:px-12">
        <OverviewStats
          stats={[
            { label: "Total stories", value: posts.length },
            { label: "Published", value: publishedCount, accent: true },
            { label: "Drafts", value: draftCount },
            { label: "Archived", value: archivedCount },
          ]}
        />

        {isAdmin && pendingApprovals > 0 ? (
          <Link
            href="/users"
            className="flex items-center gap-3 rounded-lg border border-admin-accent/25 bg-admin-accent/5 px-6 py-4 text-sm transition-colors hover:bg-admin-accent/10"
          >
            <UserPlus className="size-4 shrink-0 text-admin-accent" />
            <span className="flex-1 font-medium text-admin-heading">
              {pendingApprovals} account{pendingApprovals === 1 ? "" : "s"}{" "}
              waiting for approval
            </span>
            <ArrowRight className="size-4 text-admin-accent" />
          </Link>
        ) : null}

        {latest ? (
          <LatestStoryCard post={latest} authorName={authorName} />
        ) : (
          <section className="rounded-lg border border-dashed border-admin-text/15 p-10 text-center">
            <p className="text-sm text-admin-muted">
              No stories yet.{" "}
              <Link
                href="/editor"
                className="font-semibold text-admin-accent hover:underline"
              >
                Start your first story
              </Link>
            </p>
          </section>
        )}

        {drafts.length > 0 ? (
          <section className="rounded-lg border border-admin-text/8 bg-admin-surface px-6 py-2">
            <div className="flex items-center justify-between border-b border-admin-text/6 py-3">
              <p className="text-[13px] text-admin-muted">Drafts</p>
              <Link
                href="/posts?status=draft"
                className="text-[13px] font-medium text-admin-accent hover:underline"
              >
                See all
              </Link>
            </div>
            {drafts.map((post) => (
              <StoryRow key={post.id} post={post} authorName={authorName} />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}

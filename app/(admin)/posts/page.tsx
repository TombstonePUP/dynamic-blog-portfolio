import PageHeader from "@/features/posts/components/admin/page-header";
import StoryRow from "@/features/posts/components/admin/story-row";
import { getOwnedPosts } from "@/services/posts";
import { Inbox } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Stories | Writer Dashboard",
  description: "Browse, filter, and manage all of your stories.",
};

const STATUS_FILTERS = [
  { value: "all", label: "All stories" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md border px-3 py-1.5 text-[13px] transition-colors ${
        active
          ? "border-admin-accent/30 bg-admin-accent/8 font-semibold text-admin-heading"
          : "border-admin-text/10 font-medium text-admin-text hover:bg-admin-surface-hover/40 hover:text-admin-heading"
      }`}
    >
      {label}
    </Link>
  );
}

type PostsPageProps = {
  searchParams: Promise<{ status?: string; sort?: string }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const { posts, profile } = await getOwnedPosts();
  const { status = "all", sort = "newest" } = await searchParams;
  const authorName = profile?.display_name || "Writer";

  const filtered =
    status === "all"
      ? posts
      : posts.filter((post) => (post.status || "draft") === status);
  const sorted = [...filtered].sort((a, b) => {
    const diff =
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    return sort === "oldest" ? -diff : diff;
  });

  const withStatus = (value: string) =>
    value === "all" ? "/posts" : `/posts?status=${value}`;
  const sortHref = `/posts?${new URLSearchParams({
    ...(status !== "all" ? { status } : {}),
    sort: sort === "oldest" ? "newest" : "oldest",
  }).toString()}`;

  return (
    <main className="flex-1">
      <PageHeader title="Stories">
        {STATUS_FILTERS.map((filter) => (
          <FilterChip
            key={filter.value}
            href={withStatus(filter.value)}
            label={filter.label}
            active={status === filter.value}
          />
        ))}
        <FilterChip
          href={sortHref}
          label={sort === "oldest" ? "Oldest first" : "Newest first"}
          active={false}
        />
        <Link
          href="/editor"
          className="rounded-md bg-admin-accent px-4 py-1.5 text-[13px] font-semibold text-admin-contrast transition-colors hover:bg-admin-accent/90"
        >
          New story
        </Link>
      </PageHeader>

      <div className="mx-auto w-full max-w-[1120px] px-6 pb-16 lg:px-12">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-admin-text/15 py-20 text-admin-muted">
            <Inbox className="mb-3 size-8 opacity-50" />
            <p className="text-sm">
              {status === "all"
                ? "No stories yet."
                : `No ${status} stories.`}{" "}
              <Link
                href="/editor"
                className="font-semibold text-admin-accent hover:underline"
              >
                Start a new story
              </Link>
            </p>
          </div>
        ) : (
          <div>
            {sorted.map((post) => (
              <StoryRow key={post.id} post={post} authorName={authorName} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

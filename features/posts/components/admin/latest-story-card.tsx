import type { OwnedPostRecord } from "@/services/posts";
import Link from "next/link";
import StoryThumb from "./story-thumb";
import { formatRelativeTime } from "./story-row";

/**
 * Ghost-style "Latest story" card: large thumbnail beside title, byline and
 * status, with primary/secondary actions underneath.
 */
export default function LatestStoryCard({
  post,
  authorName,
}: {
  post: OwnedPostRecord;
  authorName: string;
}) {
  const isPublished = post.status === "published";

  return (
    <section className="rounded-lg border border-admin-text/8 bg-admin-surface p-6">
      <p className="text-[13px] text-admin-muted">Latest story</p>
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
        <StoryThumb
          imageUrl={post.image_url}
          assetFolder={post.asset_folder || post.slug}
          title={post.title}
          className="h-[150px] w-full sm:w-[232px]"
        />
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-admin-heading">
            {post.title}
          </h2>
          <p className="mt-1 text-sm text-admin-muted">
            By {authorName} – {formatRelativeTime(post.updated_at)}
          </p>
          <p
            className={`mt-0.5 text-[13px] ${
              isPublished ? "text-admin-success" : "text-admin-danger"
            }`}
          >
            {isPublished ? "Published" : "Draft"}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Link
              href={`/editor?slug=${post.slug}`}
              className="rounded-md bg-admin-accent px-4 py-1.5 text-[13px] font-semibold text-admin-contrast transition-colors hover:bg-admin-accent/90"
            >
              {isPublished ? "Edit story" : "Continue writing"}
            </Link>
            {isPublished ? (
              <Link
                href={`/${post.slug}`}
                className="rounded-md border border-admin-text/10 px-4 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-surface-hover/40 hover:text-admin-heading"
              >
                View story
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

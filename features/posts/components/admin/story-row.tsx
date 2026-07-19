import type { OwnedPostRecord } from "@/services/posts";
import Link from "next/link";
import StoryThumb from "./story-thumb";

export function formatRelativeTime(iso: string | null) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function topicName(post: OwnedPostRecord) {
  const topics = post.topics;
  if (!topics) return null;
  const topic = Array.isArray(topics) ? topics[0] : topics;
  return topic?.name || null;
}

const STATUS_STYLES: Record<string, string> = {
  published: "text-admin-success",
  draft: "text-admin-danger",
  archived: "text-admin-muted",
};

/**
 * Ghost-style story list row: thumbnail, title, byline meta, status word,
 * with the whole row linking to the editor and a quiet secondary action.
 */
export default function StoryRow({
  post,
  authorName,
}: {
  post: OwnedPostRecord;
  authorName: string;
}) {
  const topic = topicName(post);
  const status = post.status || "draft";
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="group flex items-center gap-5 border-b border-admin-text/6 py-4 last:border-b-0">
      <Link href={`/editor?slug=${post.slug}`} className="shrink-0">
        <StoryThumb
          imageUrl={post.image_url}
          assetFolder={post.asset_folder || post.slug}
          title={post.title}
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/editor?slug=${post.slug}`}
          className="block truncate text-sm font-semibold text-admin-heading transition-colors group-hover:text-admin-accent"
        >
          {post.title}
        </Link>
        <p className="mt-0.5 truncate text-sm text-admin-muted">
          By {authorName}
          {topic ? (
            <>
              {" "}in <span className="font-medium text-admin-text">{topic}</span>
            </>
          ) : null}
          {" "}– {formatRelativeTime(post.updated_at)}
        </p>
        <p className={`mt-0.5 text-[13px] ${STATUS_STYLES[status] || "text-admin-muted"}`}>
          {statusLabel}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        {status === "published" ? (
          <Link
            href={`/${post.slug}`}
            className="rounded-md border border-admin-text/10 px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-surface-hover/40 hover:text-admin-heading"
          >
            View
          </Link>
        ) : null}
        <Link
          href={`/editor?slug=${post.slug}`}
          className="rounded-md border border-admin-text/10 px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-surface-hover/40 hover:text-admin-heading"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}

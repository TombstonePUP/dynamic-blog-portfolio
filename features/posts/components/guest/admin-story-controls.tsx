"use client";

import {
  togglePublicStoryFeaturedAction,
  updatePublicStoryStatusAction,
} from "@/app/actions/public-admin-actions";
import type { Blog, BlogStatus } from "@/features/posts/types";
import { Edit3, Eye, EyeOff, Loader2, Pin, PinOff } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

type AdminStoryControlsProps = {
  post: Blog;
  compact?: boolean;
};

function statusClasses(status: BlogStatus | undefined) {
  if (status === "published") {
    return "border-admin-success/20 bg-admin-success/10 text-admin-success";
  }

  if (status === "archived") {
    return "border-admin-muted/20 bg-admin-muted/10 text-admin-muted";
  }

  return "border-admin-danger/20 bg-admin-danger/10 text-admin-danger";
}

export function StoryStatusBadge({ status }: { status?: BlogStatus }) {
  return (
    <span
      className={`inline-flex border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] ${statusClasses(status)}`}
    >
      {status || "draft"}
    </span>
  );
}

export default function AdminStoryControls({
  post,
  compact = false,
}: AdminStoryControlsProps) {
  const [status, setStatus] = useState<BlogStatus>(post.status || "draft");
  const [tags, setTags] = useState(post.tags);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isFeatured = tags.some((tag) => tag.toLowerCase() === "featured");
  const nextStatus = status === "published" ? "draft" : "published";

  function updateStatus() {
    setMessage(null);

    startTransition(async () => {
      const result = await updatePublicStoryStatusAction({
        slug: post.slug,
        status: nextStatus,
      });

      if (result.success) {
        setStatus(result.post.status || nextStatus);
        setMessage(result.post.status === "published" ? "Published" : "Unpublished");
      } else {
        setMessage(result.error);
      }
    });
  }

  function toggleFeatured() {
    setMessage(null);

    startTransition(async () => {
      const result = await togglePublicStoryFeaturedAction({
        slug: post.slug,
        tags,
        featured: !isFeatured,
      });

      if (result.success) {
        setTags(result.post.tags);
        setMessage(result.post.tags.includes("featured") ? "Pinned" : "Unpinned");
      } else {
        setMessage(result.error);
      }
    });
  }

  return (
    <div
      className={`z-20 flex flex-wrap items-center gap-2 ${
        compact
          ? "mt-3"
          : "absolute left-3 right-3 top-3 rounded-sm border border-admin-surface-hover bg-admin-surface/95 p-2 shadow-lg backdrop-blur"
      }`}
    >
      <StoryStatusBadge status={status} />
      <Link
        href={`/editor?slug=${post.slug}`}
        className="inline-flex items-center gap-1.5 border border-admin-surface-hover bg-admin-surface px-2.5 py-1.5 text-xs font-bold text-admin-text transition hover:bg-admin-surface-hover hover:text-admin-heading"
      >
        <Edit3 className="size-3.5" />
        Edit
      </Link>
      <button
        type="button"
        onClick={updateStatus}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 border border-admin-primary/20 bg-admin-primary/8 px-2.5 py-1.5 text-xs font-bold text-admin-primary transition hover:bg-admin-primary/15 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : nextStatus === "published" ? (
          <Eye className="size-3.5" />
        ) : (
          <EyeOff className="size-3.5" />
        )}
        {nextStatus === "published" ? "Publish" : "Unpublish"}
      </button>
      <button
        type="button"
        onClick={toggleFeatured}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 border border-admin-surface-hover bg-admin-surface px-2.5 py-1.5 text-xs font-bold text-admin-text transition hover:bg-admin-surface-hover hover:text-admin-heading disabled:opacity-50"
      >
        {isFeatured ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
        {isFeatured ? "Unpin" : "Pin"}
      </button>
      {message ? (
        <span className="text-[11px] font-semibold text-admin-muted">{message}</span>
      ) : null}
    </div>
  );
}

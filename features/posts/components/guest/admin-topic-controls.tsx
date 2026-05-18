"use client";

import { toggleHomepageTopicFeaturedAction } from "@/app/actions/public-admin-actions";
import type { Blog } from "@/features/posts/types";
import { Loader2, Pin, PinOff } from "lucide-react";
import { useState, useTransition } from "react";

type TopicItem = NonNullable<Blog["topic"]> & {
  postCount: number;
};

type AdminTopicControlsProps = {
  topics: TopicItem[];
};

export default function AdminTopicControls({ topics }: AdminTopicControlsProps) {
  const [items, setItems] = useState(topics);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <div className="mx-auto mt-6 max-w-7xl border border-dashed border-admin-surface-hover bg-admin-surface px-4 py-5 text-center text-sm text-admin-muted">
        No topics are available to feature yet.
      </div>
    );
  }

  function toggleTopic(slug: string, featured: boolean) {
    setPendingSlug(slug);
    setMessage(null);

    startTransition(async () => {
      const result = await toggleHomepageTopicFeaturedAction({
        slug,
        featured: !featured,
      });

      if (result.success) {
        setItems((current) =>
          current.map((topic) =>
            topic.slug === result.topic.slug
              ? {
                  ...topic,
                  isFeatured: Boolean(result.topic.is_featured),
                  homepageOrder: result.topic.homepage_order ?? null,
                }
              : topic,
          ),
        );
        setMessage(result.topic.is_featured ? "Topic pinned" : "Topic unpinned");
      } else {
        setMessage(result.error);
      }

      setPendingSlug(null);
    });
  }

  return (
    <section className="mx-auto mt-6 max-w-7xl border border-admin-surface-hover bg-admin-surface px-5 py-5 shadow-sm sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-admin-surface-hover pb-4">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-admin-heading">
          Featured Topics
        </h2>
        {message ? (
          <span className="text-xs font-semibold text-admin-muted">{message}</span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((topic) => {
          const isBusy = isPending && pendingSlug === topic.slug;

          return (
            <button
              key={topic.slug}
              type="button"
              disabled={isBusy}
              onClick={() => toggleTopic(topic.slug, Boolean(topic.isFeatured))}
              className={`inline-flex items-center gap-2 border px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${
                topic.isFeatured
                  ? "border-admin-primary/20 bg-admin-primary/8 text-admin-primary"
                  : "border-admin-surface-hover bg-admin-bg/60 text-admin-text hover:bg-admin-surface-hover"
              }`}
            >
              {isBusy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : topic.isFeatured ? (
                <PinOff className="size-3.5" />
              ) : (
                <Pin className="size-3.5" />
              )}
              {topic.name}
              <span className="text-admin-muted">{topic.postCount}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

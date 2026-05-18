"use client";

import { tagToSlug } from "@/data/blog";
import { getThemeColor } from "@/features/posts/lib/tag-theme";
import type { Blog } from "@/features/posts/types";
import type { TopicIndexItem } from "@/services/posts";
import { ArrowRight, Layers3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type TopicsPageProps = {
  topics: TopicIndexItem[];
  blogs: Blog[];
};

function capitalizeTopic(tag: string): string {
  return tag
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function TopicCard({ post }: { post: Blog }) {
  const color = getThemeColor([post.topic?.name || "", ...post.tags]);

  return (
    <Link
      href={post.href}
      className="group flex flex-col overflow-hidden bg-white shadow-sm ring-1 ring-black/[0.04] transition hover:shadow-md hover:ring-foreground/15"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="relative h-44 overflow-hidden">
        {post.thumbnail ? (
          <Image
            fill
            src={post.thumbnail}
            alt={post.title}
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-5xl font-black text-white/70"
            style={{
              background: `linear-gradient(135deg, ${color}, #1f3d39)`,
            }}
          >
            {(post.title.trim().slice(0, 1) || "S").toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-6">
        <div>
          <h3 className="text-lg font-bold leading-snug text-foreground transition group-hover:text-black/80">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/75">
            {post.excerpt.trim()
              ? post.excerpt
              : "This story is live in Supabase and waiting on its excerpt."}
          </p>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 transition group-hover:text-foreground">
          Read more
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function TopicsPage({ topics, blogs }: TopicsPageProps) {
  const visibleTopics = topics.filter((topic) => topic.postCount > 0);
  const [selectedSlug, setSelectedSlug] = useState(visibleTopics[0]?.slug || "");
  const selectedTopic =
    visibleTopics.find((topic) => topic.slug === selectedSlug) || visibleTopics[0];
  const selectedTopicSlug = selectedTopic?.slug || "";
  const topicPosts = selectedTopicSlug
    ? blogs.filter((blog) => blog.topic?.slug === selectedTopicSlug)
    : [];
  const topicSubTags = Array.from(
    new Set(
      topicPosts
        .flatMap((blog) => blog.tags)
        .filter((tag) => tag.toLowerCase() !== "featured"),
    ),
  );

  if (blogs.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-24 font-sans">
        <div className="max-w-md text-center">
          <Layers3 className="mx-auto size-10 text-foreground/35" />
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
            No stories published yet
          </h1>
          <p className="mt-3 text-sm leading-6 text-foreground/65">
            Topics will appear here after published stories are assigned a topic
            in Supabase.
          </p>
        </div>
      </main>
    );
  }

  if (visibleTopics.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-24 font-sans">
        <div className="max-w-md text-center">
          <Layers3 className="mx-auto size-10 text-foreground/35" />
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
            No topics assigned
          </h1>
          <p className="mt-3 text-sm leading-6 text-foreground/65">
            Published stories exist, but none have a dedicated topic yet.
          </p>
        </div>
      </main>
    );
  }

  const themeColor = getThemeColor([selectedTopic.name]);

  return (
    <main className="relative min-h-screen pb-24 font-sans">
      <section className="relative mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center bg-[#72dbcc]/30 px-3 py-1 text-sm font-semibold text-[#2b776a]">
            Explore by Topic
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Find what speaks to you.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/80">
            Choose a topic to see every assigned story from Supabase.
          </p>
        </div>
      </section>

      <div className="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-3 px-5 sm:mt-16 sm:px-8">
        {visibleTopics.map((topic) => {
          const color = getThemeColor([topic.name]);
          const isSelected = topic.slug === selectedTopic.slug;

          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => setSelectedSlug(topic.slug)}
              className={`group flex items-center border-l-[4px] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm ring-1 ring-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isSelected ? "text-foreground ring-foreground/20" : "text-foreground/70"
              }`}
              style={{ borderLeftColor: color }}
            >
              <span
                className="mr-1.5 opacity-60 transition-opacity group-hover:opacity-100"
                style={{ color }}
              >
                #
              </span>
              {capitalizeTopic(topic.name)}
              <span className="ml-2 text-foreground/35">{topic.postCount}</span>
            </button>
          );
        })}
      </div>

      <section className="mx-auto mt-16 max-w-7xl px-5 sm:px-8 lg:mt-20">
        <div
          className="mb-8 border-l-[6px] pl-5"
          style={{ borderColor: themeColor }}
        >
          <span
            className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider text-black"
            style={{ backgroundColor: themeColor }}
          >
            {capitalizeTopic(selectedTopic.name)}
          </span>
          <span className="px-1 text-xs text-foreground/30">•</span>
          <span className="text-foreground/60">
            {topicPosts.length} {topicPosts.length === 1 ? "Story" : "Stories"}
          </span>
          {topicSubTags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {topicSubTags.map((subTag) => (
                <Link
                  key={subTag}
                  href={`/tags/${tagToSlug(subTag)}`}
                  className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-foreground/70 shadow-sm ring-1 ring-inset ring-black/[0.06] transition hover:bg-black/5 hover:text-black"
                >
                  {capitalizeTopic(subTag)}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {topicPosts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topicPosts.map((post) => (
              <TopicCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-foreground/15 bg-white px-6 py-12 text-center text-sm text-foreground/55">
            No stories are assigned to this topic yet.
          </div>
        )}
      </section>
    </main>
  );
}

import { MAIN_CATEGORIES, tagToSlug } from "@/data/blog";
import { getBlogs } from "@/lib/blogs.server";

import { getThemeColor } from "@/lib/theme";
import type { Blog, Tag } from "@/types/blog";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Topics | The Strengths Writer",
  description: "Explore blogs categorized by topics.",
};

function capitalizeTopic(tag: string): string {
  return tag
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function TopicCard({ post, topic }: { post: Blog; topic: Tag }) {
  const color = getThemeColor([topic]);
  return (
    <Link
      href={`${post.href}?topic=${encodeURIComponent(topic)}`}
      className="group flex flex-col overflow-hidden bg-white shadow-sm ring-1 ring-black/[0.04] transition hover:shadow-md hover:ring-foreground/15"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          fill
          src={post.image}
          alt={post.title}
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-6">
        <div>
          <h3 className="text-lg font-bold leading-snug text-foreground transition group-hover:text-black/80">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/75">
            {post.excerpt}
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

export default async function TopicsPage() {
  const blogs = await getBlogs();
  const topics = MAIN_CATEGORIES;


  return (
    <main className="relative min-h-screen pb-24 font-sans bg-gradient-to-b to-[#72dbcc]/10 from-transparent">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96" aria-hidden />

      <section className="relative mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center bg-[#72dbcc]/30 px-3 py-1 text-sm font-semibold text-[#2b776a]">
            Explore by Category
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Find what speaks to you.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-foreground/80">
            Browse through a curated collection of topics ranging from positive psychology and mental health to movie reviews and personal stories.
          </p>
        </div>
      </section>

      {/* Filter Pills */}
      <div className="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-3 px-5 sm:mt-16 sm:px-8">
        {topics.map((topic) => {
          const themeColor = getThemeColor([topic]);
          // Only show topics that actually have blogs
          const hasBlogs = blogs.some((b) => b.tags.includes(topic));
          if (!hasBlogs) return null;

          return (
            <a
              key={topic}
              href={`#${topic}`}
              className="group flex items-center border-l-[4px] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm ring-1 ring-black/[0.04] transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderLeftColor: themeColor }}
            >
              <span className="mr-1.5 opacity-60 transition-opacity group-hover:opacity-100" style={{ color: themeColor }}>
                #
              </span>
              {capitalizeTopic(topic)}
            </a>
          );
        })}
      </div>

      <div className="mx-auto mt-20 max-w-7xl px-5 sm:px-8 lg:mt-28 space-y-24">
        {topics.map((topic) => {
          const topicBlogs = blogs.filter((b) => b.tags.includes(topic));
          if (topicBlogs.length === 0) return null;

          const themeColor = getThemeColor([topic]);

          const topicSubTags = Array.from(new Set(
            topicBlogs
              .flatMap((blog) => blog.tags)
              .filter(
                (tag) =>
                  !(MAIN_CATEGORIES as readonly string[]).includes(tag) &&
                  tag !== "featured",
              )
          ));

          return (
            <section key={topic} className="relative scroll-mt-24" id={topic}>
              <div
                className="mb-8 border-l-[6px] pl-5"
                style={{ borderColor: themeColor }}
              >
                <span
                  className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider text-black"
                  style={{ backgroundColor: themeColor }}
                >
                  {capitalizeTopic(topic)}
                </span>
                <span className="text-foreground/30 text-xs px-1">•</span>
                <span className="text-foreground/60">
                  {topicBlogs.length} {topicBlogs.length === 1 ? "Story" : "Stories"}
                </span>
                <div className="mt-3 flex items-center flex-wrap gap-2">
                  {topicSubTags.length > 0 && (
                    <>
                      <div className="flex flex-wrap gap-2">
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
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {topicBlogs.map((post) => (
                  <TopicCard key={post.id} post={post} topic={topic} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

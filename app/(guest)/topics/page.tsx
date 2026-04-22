import { ALL_TAGS, blogs } from "@/data/blog";
import { getThemeColor } from "@/lib/theme";
import type { Blog } from "@/types/blog";
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

function TopicCard({ post }: { post: Blog }) {
  return (
    <Link
      href={post.href}
      className="group flex flex-col gap-6 overflow-hidden bg-white p-6 shadow-sm ring-1 ring-black/[0.04] transition hover:shadow-md hover:ring-foreground/15"
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
      <div className="flex flex-1 flex-col justify-between gap-3">
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

export default function TopicsPage() {
  const topics = ALL_TAGS.filter((tag) => tag !== "featured");

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

      <div className="mx-auto mt-20 max-w-7xl px-5 sm:px-8 lg:mt-28 space-y-24">
        {topics.map((topic) => {
          const topicBlogs = blogs.filter((b) => b.tags.includes(topic));
          if (topicBlogs.length === 0) return null;

          const themeColor = getThemeColor([topic]);

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
                <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                  {capitalizeTopic(topic)}
                </h2>
                <p className="mt-2 text-foreground/60">
                  {topicBlogs.length} {topicBlogs.length === 1 ? "Story" : "Stories"}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {topicBlogs.map((post) => (
                  <TopicCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

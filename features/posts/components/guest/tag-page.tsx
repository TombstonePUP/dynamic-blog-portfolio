import BackButton from "@/components/guest/back-button";
import { getThemeColor } from "@/features/posts/lib/tag-theme";
import type { Blog, Tag } from "@/features/posts/types";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type TagPageProps = {
  tag: string;
  blogs: Blog[];
};

function capitalizeTopic(tag: string): string {
  return tag
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function TagCard({ post, tag }: { post: Blog; tag: Tag }) {
  const color = getThemeColor([tag]);

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

export default function TagPage({ tag, blogs }: TagPageProps) {
  const themeColor = getThemeColor([tag]);

  return (
    <main className="relative min-h-screen bg-[#fbfbfb] pb-24 font-sans">
      <section
        className="relative pb-16 pt-24 text-center"
        style={{ backgroundColor: `${themeColor}15` }}
      >
        <div className="absolute left-6 top-6 flex justify-start gap-4 px-5 sm:px-8 md:px-10">
          <BackButton />
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 border border-foreground/15 bg-white px-4 py-2 text-sm font-semibold text-foreground/70 shadow-sm transition hover:bg-black/5"
          >
            All stories
          </Link>
        </div>
        <div className="mx-auto max-w-3xl px-5">
          <span
            className="inline-flex items-center px-3 py-1 text-sm font-bold uppercase tracking-wider text-black"
            style={{ backgroundColor: themeColor }}
          >
            Tag
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            #{capitalizeTopic(tag)}
          </h1>
          <p className="mt-4 text-lg text-foreground/70">
            {blogs.length} {blogs.length === 1 ? "Story" : "Stories"}
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((post) => (
            <TagCard key={post.id} post={post} tag={tag as Tag} />
          ))}
        </div>

        {blogs.length === 0 ? (
          <div className="py-20 text-center text-foreground/50">
            <p>No stories found for this tag.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

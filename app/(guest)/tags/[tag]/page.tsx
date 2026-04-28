import BackButton from "@/components/guest/back-button";
import { slugToTag, tagToSlug } from "@/data/blog";
import { getBlogs } from "@/lib/blogs.server";

import { getThemeColor } from "@/lib/theme";
import type { Blog, Tag } from "@/types/blog";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ tag: string }>;
};

function capitalizeTopic(tag: string): string {
  return tag
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag: slug } = await params;
  const tag = slugToTag(slug);

  if (!tag) return { title: "Tag not found" };

  return {
    title: `${capitalizeTopic(tag)} | The Strengths Writer`,
    description: `Browse articles tagged with ${capitalizeTopic(tag)}.`,
  };
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

export default async function TagPage({ params }: PageProps) {
  const { tag: slug } = await params;
  const tag = slugToTag(slug);

  if (!tag) notFound();

  const blogs = await getBlogs();

  const themeColor = getThemeColor([tag]);
  const tagBlogs = blogs.filter((b) => b.tags.includes(tag));


  return (
    <main className="relative min-h-screen pb-24 font-sans bg-[#fbfbfb]">
      <section
        className="relative pt-24 pb-16 text-center"
        style={{ backgroundColor: `${themeColor}15` }}
      >
        <div className="absolute flex justify-start top-6 left-6 gap-4 px-5 sm:px-8 md:px-10">
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
            {tagBlogs.length} {tagBlogs.length === 1 ? "Story" : "Stories"}
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tagBlogs.map((post) => (
            <TagCard key={post.id} post={post} tag={tag} />
          ))}
        </div>

        {tagBlogs.length === 0 && (
          <div className="text-center py-20 text-foreground/50">
            <p>No stories found for this tag.</p>
          </div>
        )}
      </section>
    </main>
  );
}

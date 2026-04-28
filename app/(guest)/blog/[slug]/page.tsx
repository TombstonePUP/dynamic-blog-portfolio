import BackButton from "@/components/guest/back-button";
import CommentsSection from "@/components/guest/comments-section";
import ScrollArrow from "@/components/guest/scroll-arrow";
import { CustomMDX } from "@/components/mdx/mdx-remote";
import { MAIN_CATEGORIES, readingMinutesFromContent, tagToSlug } from "@/data/blog";
import { getBlogBySlug, getBlogs, getRelatedBlogs } from "@/lib/blogs.server";
import { getThemeColor } from "@/lib/theme";
import type { Blog } from "@/types/blog";
import { ArrowRight, Calendar, Clock, MessageCircle, UserCircle } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

function seriesLabel(tags: string[]): string {
  const tag = tags.find((value) => value !== "featured");
  return tag ? capitalizeTopic(tag) : "Story";
}

function capitalizeTopic(tag: string): string {
  return tag
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: `${post.title} | The Strengths Writer`,
    description: post.excerpt.slice(0, 155),
  };
}

function RelatedCard({ post }: { post: Blog }) {
  const label = seriesLabel(post.tags);
  const color = getThemeColor(post.tags);

  return (
    <Link
      href={post.href}
      className="group flex flex-col overflow-hidden bg-white transition hover:shadow-md"
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
        <span
          className="absolute left-2 top-2 px-2 py-1 text-xs font-semibold text-black"
          style={{ backgroundColor: color }}
        >
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-6">
        <h3 className="text-lg font-black leading-snug text-foreground transition group-hover:text-black/80">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}

export default async function BlogArticlePage({ params }: PageProps) {
  const blogs = await getBlogs();
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const minutes = readingMinutesFromContent(post.contentMdx || post.content);
  const related = await getRelatedBlogs(post);

  const relatedSlugs = new Set([post.slug, ...related.map((blog) => blog.slug)]);
  const padBlogs = blogs
    .filter((blog) => !relatedSlugs.has(blog.slug))
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
  const more = [...related, ...padBlogs].slice(0, 3);

  return (
    <article className="relative min-h-screen pb-20 font-sans">
      <header className="relative min-h-[min(85svh,52rem)] w-full overflow-hidden sm:min-h-[min(88svh,58rem)] md:min-h-[min(92svh,64rem)]">
        <Image src={post.image} alt="" fill priority className="object-cover" sizes="100vw" />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/45"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent mix-blend-soft-light md:h-40"
          style={{
            backgroundImage: `linear-gradient(to top, ${getThemeColor(post.tags)}40, transparent)`,
          }}
        />

        <div className="absolute inset-0 z-10 flex flex-col">
          <div className="flex justify-start gap-4 px-5 pt-6 sm:px-8 sm:pt-8 md:px-10 md:pt-10">
            <BackButton />
            <Link
              href="/topics"
              className="inline-flex items-center gap-2 border-2 border-white/90 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/40"
            >
              All stories
            </Link>
          </div>

          <div className="mb-10 mt-auto px-5 pb-10 pt-16 sm:px-8 sm:pb-12 md:px-10 md:pb-14">
            <div className="mx-auto max-w-4xl">
              <span
                className="mb-4 inline-flex items-center px-3 py-1 text-sm font-semibold text-black"
                style={{ backgroundColor: getThemeColor(post.tags) }}
              >
                {seriesLabel(post.tags)}
              </span>
              <h1 className="max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-white text-balance sm:text-4xl md:text-[4rem] md:leading-[1.1]">
                {post.title}
              </h1>

              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <Link
                  href="/about"
                  className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white/90 ring-1 ring-white/20">
                    <UserCircle className="size-5" strokeWidth={1.75} />
                  </div>
                  <span className="font-semibold text-white">{post.author.name}</span>
                </Link>

                <div className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden />

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/20">
                    <Calendar className="size-4 text-white/70" strokeWidth={1.5} />
                    <time dateTime={post.date} className="font-medium text-white/90">
                      {post.dateLabel}
                    </time>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/20">
                    <Clock className="size-4 text-white/70" strokeWidth={1.5} />
                    <span className="font-medium text-white/90">{minutes} min read</span>
                  </div>

                  <a
                    href="#comments"
                    className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/20 transition hover:bg-white/20"
                  >
                    <MessageCircle className="size-4" strokeWidth={1.5} />
                    <span className="font-medium">Comments</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
          <ScrollArrow />
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 z-[11] h-1.5"
          style={{ backgroundColor: getThemeColor(post.tags) }}
          aria-hidden
        />
      </header>

      <div
        id="article-content"
        className="mx-auto mt-12 max-w-5xl scroll-mt-34 px-5 md:mt-14 md:px-8"
        style={{ "--theme-color": getThemeColor(post.tags) } as React.CSSProperties}
      >
        <div className="space-y-6 text-base leading-[1.8] text-foreground/90 md:text-[1.0625rem] md:leading-[1.85] [&>p:first-of-type]:text-[1.0625rem] [&>p:first-of-type]:leading-relaxed md:[&>p:first-of-type]:text-lg md:[&>p:first-of-type]:leading-relaxed [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:-mt-2 [&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:font-black [&>p:first-of-type]:first-letter:text-[var(--theme-color)] [&>p:first-of-type]:first-letter:leading-[0.75]">
          {post.contentMdx ? (
            <CustomMDX source={post.contentMdx} assetFolder={post.assetFolder} />
          ) : post.content.length > 0 ? (
            post.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : null}
        </div>

        <div
          className="mt-14 bg-[#f3f2f0]/60 px-6 py-8 text-center md:px-10"
          style={{ borderTop: `6px solid ${getThemeColor(post.tags)}` }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
            The Strengths Writer
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            Positive psychology and stories for personal and professional growth.
          </p>
        </div>

        <CommentsSection
          postSlug={post.slug}
          themeColor={getThemeColor(post.tags)}
          enabled={post.source === "supabase"}
        />

        <div className="mt-16 flex flex-wrap items-center gap-2 border-t border-foreground/10 pt-8">
          <span className="mr-2 text-sm font-semibold text-foreground/70">Tags:</span>
          {post.tags
            .filter(
              (tag) =>
                tag !== "featured" &&
                !(MAIN_CATEGORIES as readonly string[]).includes(tag),
            )
            .map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tagToSlug(tag)}`}
                className="inline-flex items-center rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-foreground/70 transition hover:bg-black/10 hover:text-black"
              >
                {capitalizeTopic(tag)}
              </Link>
            ))}
        </div>
      </div>

      {more.length > 0 ? (
        <section className="mx-auto mt-20 max-w-7xl px-5 pb-10 sm:px-8">
          <div className="border-t border-foreground/10 pt-10">
            <h2 className="text-2xl font-bold text-foreground/80">More stories</h2>
            <Link
              href="/topics"
              className="group mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground/60 transition hover:text-foreground"
            >
              View all stories
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((item) => (
              <RelatedCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

import type { Blog } from "@/features/posts/types";
import AdminCommentModerationPanel from "@/features/posts/components/guest/admin-comment-moderation-panel";
import AdminStoryControls, {
  StoryStatusBadge,
} from "@/features/posts/components/guest/admin-story-controls";
import AdminTopicControls from "@/features/posts/components/guest/admin-topic-controls";
import type { GuestAdminModeration } from "@/services/posts";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type HomePageProps = {
  blogs: Blog[];
  adminModeration: GuestAdminModeration;
};

function topicLabel(post: Blog): string {
  if (post.topic?.name) {
    return post.topic.name;
  }

  const tag = post.tags.find((value) => value !== "featured");
  return tag ? tag : (post.tags[0] ?? "Story");
}

function displayExcerpt(post: Blog) {
  return post.excerpt.trim()
    ? post.excerpt
    : "This published story is live in Supabase and ready for its excerpt.";
}

function PlaceholderImage({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background:
          "linear-gradient(135deg, rgba(240,216,161,0.95), rgba(114,219,204,0.78) 52%, rgba(31,61,57,1))",
      }}
    >
      <span className="text-5xl font-black uppercase tracking-[0.18em] text-white/70">
        {label.slice(0, 1) || "S"}
      </span>
    </div>
  );
}

function HeroCard({
  post,
  canManageStories,
}: {
  post: Blog;
  canManageStories: boolean;
}) {
  return (
    <article className="relative flex h-fit w-full max-w-md self-center lg:max-w-md lg:self-stretch">
      <Link
        href={post.href}
        className="group flex w-full flex-col overflow-hidden bg-background shadow-[0_24px_48px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/10 transition hover:ring-[#F0D8A1]/60"
      >
        <div className="border-t-[6px] border-[#F0D8A1] px-8 pb-10 pt-8 sm:px-10">
          <div className="relative aspect-[4/3] w-full overflow-hidden sm:h-52 sm:aspect-auto">
            {post.image ? (
              <Image
                fill
                src={post.image}
                alt={post.title}
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 28rem"
                priority
              />
            ) : (
              <PlaceholderImage
                label={post.title}
                className="absolute inset-0 flex items-center justify-center"
              />
            )}
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {canManageStories ? <StoryStatusBadge status={post.status} /> : null}
            </div>
            <h2 className="text-xl font-bold leading-snug text-foreground sm:text-2xl">
              {post.title}
            </h2>
            <p className="line-clamp-4 text-base leading-relaxed text-foreground/80">
              {displayExcerpt(post)}
            </p>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </Link>
      {canManageStories ? <AdminStoryControls post={post} /> : null}
    </article>
  );
}

function FeaturedCard({
  post,
  canManageStories,
}: {
  post: Blog;
  canManageStories: boolean;
}) {
  const topic = topicLabel(post);

  return (
    <article className="relative">
      <Link
        href={post.href}
        className="group flex flex-col gap-6 overflow-hidden bg-white p-8 shadow-sm ring-1 ring-black/[0.04] transition hover:ring-[#72dbcc]/50"
      >
        <div className="relative h-44 overflow-hidden">
          {post.thumbnail ? (
            <Image
              fill
              src={post.thumbnail}
              alt={post.title}
              className="object-cover transition duration-300 group-hover:scale-101"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <PlaceholderImage
              label={post.title}
              className="absolute inset-0 flex items-center justify-center"
            />
          )}
          <span className="absolute left-2 top-2 bg-[#72dbcc]/80 px-2 py-1 text-xs font-semibold capitalize text-black">
            {topic}
          </span>
        </div>
        <div className="flex min-h-[6.5rem] flex-col justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {canManageStories ? <StoryStatusBadge status={post.status} /> : null}
          </div>
          <h3 className="text-lg font-black leading-snug text-foreground transition group-hover:text-black/80">
            {post.title}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">
            {displayExcerpt(post)}
          </p>
        </div>
      </Link>
      {canManageStories ? <AdminStoryControls post={post} /> : null}
    </article>
  );
}

function RiverCard({
  post,
  variant,
  canManageStories,
}: {
  post: Blog;
  variant: "a" | "b";
  canManageStories: boolean;
}) {
  const topic = topicLabel(post);
  const border =
    variant === "a"
      ? "border-l-[5px] border-[#F0D8A1]"
      : "border-l-[5px] border-[#72dbcc]";

  return (
    <article className="relative">
      <Link
        href={post.href}
        className={`group flex flex-col overflow-hidden bg-white shadow-sm ring-1 ring-black/[0.04] transition hover:ring-foreground/15 sm:flex-row sm:items-stretch ${border}`}
      >
        <div className="relative h-48 w-full shrink-0 sm:h-auto sm:min-h-[220px] sm:w-[42%]">
          {post.thumbnail ? (
            <Image
              fill
              src={post.thumbnail}
              alt={post.title}
              className="object-cover transition duration-300 group-hover:scale-101"
              sizes="(max-width: 640px) 100vw, 280px"
            />
          ) : (
            <PlaceholderImage
              label={post.title}
              className="absolute inset-0 flex items-center justify-center"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center gap-3 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-fit bg-[#f3f2f0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/70">
              {topic}
            </span>
            {canManageStories ? <StoryStatusBadge status={post.status} /> : null}
          </div>
          <h3 className="text-lg font-black leading-snug text-foreground sm:text-xl">
            {post.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-foreground/75 sm:line-clamp-3">
            {displayExcerpt(post)}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 transition group-hover:text-foreground">
            Continue reading
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
      {canManageStories ? <AdminStoryControls post={post} /> : null}
    </article>
  );
}

function FeedInterstitial({
  kicker,
  quote,
  sub,
}: {
  kicker: string;
  quote: string;
  sub: string;
}) {
  return (
    <div className="relative mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
      <div
        className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#72dbcc]/60 to-transparent"
        aria-hidden
      />
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#72dbcc]">
        {kicker}
      </p>
      <p className="mt-5 text-2xl font-medium italic leading-snug text-foreground md:text-3xl md:leading-tight">
        {quote}
      </p>
      <p className="mt-4 text-sm text-foreground/60">{sub}</p>
    </div>
  );
}

function FeaturedTopicsStrip({
  topics,
}: {
  topics: Array<NonNullable<Blog["topic"]> & { postCount: number }>;
}) {
  const featuredTopics = topics.filter((topic) => topic.isFeatured);

  if (featuredTopics.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 border-y border-foreground/10 py-5">
        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground/45">
          Featured topics
        </span>
        {featuredTopics.map((topic) => (
          <Link
            key={topic.slug}
            href="/topics"
            className="inline-flex items-center gap-2 bg-white px-3 py-2 text-xs font-bold text-foreground shadow-sm ring-1 ring-black/[0.04] transition hover:bg-black/5"
          >
            {topic.name}
            <span className="text-foreground/35">{topic.postCount}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePage({ blogs, adminModeration }: HomePageProps) {
  const canManageStories = adminModeration.canManageStories;
  const canManageTopics = adminModeration.canManageTopics;
  const sortedBlogs = [...blogs].sort(
    (left, right) => {
      const featuredDelta =
        Number(right.tags.includes("featured")) -
        Number(left.tags.includes("featured"));

      if (featuredDelta !== 0) {
        return featuredDelta;
      }

      return new Date(right.date).getTime() - new Date(left.date).getTime();
    },
  );
  const latestPost = sortedBlogs[0] ?? null;
  const streamPosts = sortedBlogs.slice(1);
  const head = streamPosts.slice(0, 3);
  const pool = streamPosts.slice(3);
  const topicsBySlug = new Map<
    string,
    NonNullable<Blog["topic"]> & { postCount: number }
  >();

  for (const post of blogs) {
    if (!post.topic) {
      continue;
    }

    const existing = topicsBySlug.get(post.topic.slug);
    topicsBySlug.set(post.topic.slug, {
      ...post.topic,
      postCount: (existing?.postCount || 0) + 1,
    });
  }

  const topics = [...topicsBySlug.values()].sort(
    (left, right) =>
      Number(right.isFeatured) - Number(left.isFeatured) ||
      left.name.localeCompare(right.name),
  );

  return (
    <main className="relative min-h-screen font-sans">
      <section className="relative z-10 mt-4 w-full overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-primary/80"
          aria-hidden
        />

        <div
          className="pointer-events-none absolute inset-x-0 top-0 min-h-screen"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[82.5svh] w-full max-w-7xl flex-col gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-14 lg:flex-row lg:justify-between lg:gap-16 lg:pb-16">
          <div className="max-w-xl shrink-0 lg:max-w-lg">
            <span className="mb-4 inline-flex items-center bg-[#F0D8A1] px-3 py-1 text-sm text-black">
              Latest Featured
            </span>
            <h1 className="mb-4 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.15rem] lg:leading-[1.05]">
              <span className="text-[#8c6d1f]/65">Blogs</span> to help you thrive
              in your <span className="text-[#8c6d1f]/65">personal</span> and{" "}
              <span className="text-[#8c6d1f]/65">professional</span> life.
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-foreground/80">
              Discover insights and tips to grow both personally and
              professionally.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {latestPost ? (
                <Link
                  href={latestPost.href}
                  className="inline-flex items-center gap-2 border-1 border-foreground/10 bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5"
                >
                  Read latest story
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 border-1 border-foreground/10 bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5"
                >
                  Open writer dashboard
                </Link>
              )}
              <Link
                href="/topics"
                className="group inline-flex items-center gap-2 border-1 border-transparent bg-[#F0D8A1] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#e8cc8a]"
              >
                Explore
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {latestPost ? (
            <HeroCard post={latestPost} canManageStories={canManageStories} />
          ) : (
            <div className="flex w-full max-w-md items-center justify-center border border-dashed border-foreground/15 bg-background px-8 py-16 text-center shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)]">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  No published stories yet
                </p>
                <p className="mt-3 text-sm leading-relaxed text-foreground/60">
                  Publish your first story in Supabase and it will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {adminModeration.canModerateComments ? (
        <section className="px-4 sm:px-8">
          <AdminCommentModerationPanel
            comments={adminModeration.recentComments}
            error={adminModeration.error}
          />
        </section>
      ) : null}

      {canManageTopics ? (
        <section className="px-4 sm:px-8">
          <AdminTopicControls topics={topics} />
        </section>
      ) : null}

      <FeaturedTopicsStrip topics={topics} />

      <div className="relative font-sans">
        <section
          id="featured"
          className="relative z-10 mx-auto mt-[-17vh] w-full max-w-[1440px] scroll-mt-24 px-4 sm:px-8 lg:mt-[-19vh]"
        >
          <div className="mx-auto max-w-7xl bg-[#f3f2f0] shadow-[0_-12px_40px_-20px_rgba(0,0,0,0.12)]">
            <div className="border-t-[10px] border-[#72dbcc] px-4 py-10 text-center sm:px-6 sm:py-12">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Featured
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-foreground/65">
                Start here, then keep scrolling for more picks loaded as you go.
              </p>
            </div>
            <div className="grid gap-6 px-4 pb-12 pt-0 sm:px-8 sm:pb-14 md:grid-cols-3 md:gap-6">
              {head.length > 0 ? (
                head.map((post) => (
                  <FeaturedCard
                    key={post.id}
                    post={post}
                    canManageStories={canManageStories}
                  />
                ))
              ) : (
                <div className="col-span-full px-6 pb-4 text-center text-sm text-foreground/55">
                  More featured stories will appear here after additional posts are
                  published.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="pt-8 lg:pt-20">
          <FeedInterstitial
            kicker="Keep reading"
            quote="Small shifts in how we work and rest add up, often before we notice."
            sub="Scroll down: more stories appear as you explore."
          />
        </section>

        {pool.length > 0 ? (
          <section className="pt-2">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    More to explore
                  </h2>
                  <p className="mt-1 text-sm text-foreground/65">
                    Loaded in pairs as you scroll. Linger on what pulls you in.
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#72dbcc]">
                  Latest feed
                </span>
              </div>

              <div className="flex flex-col gap-8">
                {pool.map((post, index) => (
                  <RiverCard
                    key={`${post.slug}-${index}`}
                    post={post}
                    variant={index % 2 === 0 ? "a" : "b"}
                    canManageStories={canManageStories}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {streamPosts.length === 0 ? (
          <section className="bg-[#f3f2f0] px-4 py-14 text-center sm:px-8">
            <Link
              href="/topics"
              className="group inline-flex items-center gap-2 border-2 border-foreground/20 bg-white px-8 py-3.5 text-sm font-semibold text-foreground transition hover:border-[#72dbcc]"
            >
              See every story in the journal
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </section>
        ) : null}
      </div>
    </main>
  );
}

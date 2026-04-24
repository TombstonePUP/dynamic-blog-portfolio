"use client";

import type { Blog } from "@/types/blog";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const BATCH = 1;

function topicLabel(post: Blog): string {
  const t = post.tags.find((x) => x !== "featured");
  return t ? t : (post.tags[0] ?? "Story");
}

function FeaturedCard({ post }: { post: Blog }) {
  const topic = topicLabel(post);
  return (
    <Link
      href={post.href}
      className="group flex flex-col gap-6 overflow-hidden bg-white p-8 shadow-sm ring-1 ring-black/[0.04] transition hover:ring-[#72dbcc]/50"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          fill
          src={post.image}
          alt={post.title}
          className="object-cover transition duration-300 group-hover:scale-101"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span className="absolute left-2 top-2 bg-[#72dbcc]/80 px-2 py-1 text-xs font-semibold capitalize text-black">
          {topic}
        </span>
      </div>
      <div className="flex min-h-[6.5rem] flex-col justify-between gap-2">
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

function RiverCard({ post, variant }: { post: Blog; variant: "a" | "b" }) {
  const topic = topicLabel(post);
  const border =
    variant === "a"
      ? "border-l-[5px] border-[#F0D8A1]"
      : "border-l-[5px] border-[#72dbcc]";
  return (
    <Link
      href={post.href}
      className={`group flex flex-col overflow-hidden bg-white shadow-sm ring-1 ring-black/[0.04] transition hover:ring-foreground/15 sm:flex-row sm:items-stretch ${border}`}
    >
      <div className="relative h-48 w-full shrink-0 sm:h-auto sm:min-h-[220px] sm:w-[42%]">
        <Image
          fill
          src={post.image}
          alt={post.title}
          className="object-cover transition duration-300 group-hover:scale-101"
          sizes="(max-width: 640px) 100vw, 280px"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 p-6 sm:p-8">
        <span className="w-fit bg-[#f3f2f0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground/70">
          {topic}
        </span>
        <h3 className="text-lg font-black leading-snug text-foreground sm:text-xl">
          {post.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-foreground/75 sm:line-clamp-3">
          {post.excerpt}
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 transition group-hover:text-foreground">
          Continue reading
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
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

export default function LandingScrollFeed({
  streamPosts,
}: {
  streamPosts: Blog[];
}) {
  const head = streamPosts.slice(0, 3);
  const tail = streamPosts.slice(3);
  const pool = tail.length ? [...tail] : [];
  const [visibleTail, setVisibleTail] = useState(0);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  const loadMore = useCallback(() => {
    if (busyRef.current || visibleTail >= pool.length) return;
    busyRef.current = true;
    setLoading(true);
    window.setTimeout(() => {
      setVisibleTail((v) => Math.min(v + BATCH, pool.length));
      setLoading(false);
      busyRef.current = false;
    }, 280);
  }, [pool.length, visibleTail]);

  useEffect(() => {
    if (pool.length === 0 || visibleTail >= pool.length) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "320px 0px", threshold: 0.01 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, pool.length, visibleTail]);

  const shown = pool.slice(0, visibleTail);

  return (
    <div className="relative font-sans">
      <section
        id="featured"
        className="relative z-10 mx-auto w-full max-w-[1440px] -mt-20 scroll-mt-24 px-4 sm:px-8 lg:-mt-75"
      >
        <div className="mx-auto max-w-7xl bg-[#f3f2f0] shadow-[0_-12px_40px_-20px_rgba(0,0,0,0.12)]">
          <div className="border-t-[10px] border-[#72dbcc] px-4 py-10 text-center sm:px-6 sm:py-12">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Featured
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-foreground/65">
              Start here—then keep scrolling for more picks loaded as you go.
            </p>
          </div>
          <div className="grid gap-6 px-4 pb-12 pt-0 sm:px-8 sm:pb-14 md:grid-cols-3 md:gap-6">
            {head.map((post) => (
              <FeaturedCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      <section className="pt-8 lg:pt-20">
        <FeedInterstitial
          kicker="Keep reading"
          quote="“Small shifts in how we work and rest add up—often before we notice.”"
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
                  Loaded in pairs as you scroll—linger on what pulls you in.
                </p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#72dbcc]">
                Infinite-style feed
              </span>
            </div>

            <div className="flex flex-col gap-8">
              {shown.map((post, i) => (
                <RiverCard
                  key={`${post.slug}-${i}`}
                  post={post}
                  variant={i % 2 === 0 ? "a" : "b"}
                />
              ))}
            </div>

            {visibleTail < pool.length ? (
              <div
                ref={sentinelRef}
                className="flex min-h-[4rem] flex-col items-center justify-center gap-2 py-10"
              >
                {loading ? (
                  <p className="text-sm font-medium text-foreground/50">
                    Loading more picks…
                  </p>
                ) : (
                  <p className="text-xs text-foreground/40">Scroll for more</p>
                )}
                <div className="h-1 w-24 overflow-hidden rounded-full bg-foreground/10">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-[#72dbcc]/70" />
                </div>
              </div>
            ) : (
              <div className="mt-12 border-t border-foreground/10 pt-12 text-center">
                <p className="text-sm text-foreground/60">
                  You&apos;ve seen the full loop for now.
                </p>
                <Link
                  href="/topics"
                  className="group mt-5 inline-flex items-center gap-2 bg-foreground px-8 py-3.5 text-sm font-semibold text-background transition hover:bg-foreground/90"
                >
                  Open the full journal
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {pool.length === 0 && head.length > 0 ? (
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
  );
}

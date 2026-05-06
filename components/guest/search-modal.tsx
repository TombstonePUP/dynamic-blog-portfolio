"use client";

import { getThemeColor } from "@/features/posts/lib/tag-theme";
import type { Blog } from "@/features/posts/types";
import { ArrowRight, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) {
    return text;
  }

  const parts = text.split(
    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
  );

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={index}
        className="bg-[#F0D8A1] text-foreground not-italic"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function SearchResult({
  post,
  query,
  onClose,
}: {
  post: Blog;
  query: string;
  onClose: () => void;
}) {
  const themeColor = getThemeColor(post.tags);
  const title = post.title.trim() || "Untitled story";
  const excerpt =
    post.excerpt.trim() || "This story is live in Supabase without an excerpt.";
  const label =
    post.tags.filter((tag) => tag !== "featured").join(", ") || "Story";

  return (
    <Link
      href={post.href}
      onClick={onClose}
      className="group flex gap-4 border-l-4 bg-white px-5 py-4 transition hover:shadow-sm"
      style={{ borderLeftColor: themeColor }}
    >
      <div className="relative size-16 shrink-0 overflow-hidden">
        {post.thumbnail ? (
          <Image
            src={post.thumbnail}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="64px"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-lg font-black text-white"
            style={{
              background: `linear-gradient(135deg, ${themeColor}, #1f3d39)`,
            }}
          >
            {title.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: themeColor }}
          >
            {label}
          </p>
          <h3 className="mt-0.5 text-sm font-bold leading-snug text-foreground group-hover:text-black/80">
            {highlight(title, query)}
          </h3>
        </div>
        <p className="line-clamp-1 text-xs leading-relaxed text-foreground/60">
          {highlight(excerpt, query)}
        </p>
      </div>
      <ArrowRight className="size-4 shrink-0 self-center text-foreground/30 transition-transform group-hover:translate-x-1 group-hover:text-foreground/70" />
    </Link>
  );
}

export default function SearchModal({
  open,
  onClose,
  blogs = [],
}: {
  open: boolean;
  onClose: () => void;
  blogs?: Blog[];
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  const results =
    query.trim().length > 0
      ? blogs
          .filter((blog) => {
            const normalizedQuery = query.toLowerCase();
            return (
              blog.title.toLowerCase().includes(normalizedQuery) ||
              blog.excerpt.toLowerCase().includes(normalizedQuery) ||
              blog.tags.some((tag) =>
                tag.toLowerCase().includes(normalizedQuery),
              ) ||
              blog.author.name.toLowerCase().includes(normalizedQuery)
            );
          })
          .slice(0, 6)
      : [];

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const hasStories = blogs.length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />

      <div className="relative z-10 mx-auto mt-[10vh] w-full max-w-2xl px-4">
        <div className="flex flex-col bg-[#FAF9F6] shadow-2xl ring-1 ring-black/[0.06]">
          <div className="flex items-center gap-3 border-b border-foreground/10 px-5 py-4">
            <Search
              className="size-5 shrink-0 text-foreground/50"
              strokeWidth={2}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search stories, topics, tags…"
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-foreground/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleClose}
              className="flex size-8 cursor-pointer items-center justify-center text-foreground/50 transition hover:text-foreground"
              aria-label="Close search"
            >
              <X className="size-5" />
            </button>
          </div>

          {!hasStories ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Search className="size-10 text-foreground/20" strokeWidth={1.5} />
              <p className="text-sm font-medium text-foreground/60">
                No published stories are available yet.
              </p>
              <p className="text-xs text-foreground/40">
                Publish a story in Supabase and it will become searchable here.
              </p>
            </div>
          ) : query.trim().length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length > 0 ? (
                <div className="flex flex-col divide-y divide-foreground/[0.06]">
                  <p className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground/50">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </p>
                  {results.map((post) => (
                    <SearchResult
                      key={post.id}
                      post={post}
                      query={query}
                      onClose={onClose}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Search
                    className="size-10 text-foreground/20"
                    strokeWidth={1.5}
                  />
                  <p className="text-sm font-medium text-foreground/60">
                    No results for <strong>&ldquo;{query}&rdquo;</strong>
                  </p>
                  <p className="text-xs text-foreground/40">
                    Try searching by title, topic, tag, or author name.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-foreground/50">
                Start typing to search all published stories.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { getThemeColor } from "@/lib/theme";
import type { Blog } from "@/types/blog";
import { ArrowRight, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-[#F0D8A1] text-foreground not-italic">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function SearchResult({ post, query, onClose }: { post: Blog; query: string; onClose: () => void }) {
  const themeColor = getThemeColor(post.tags);
  return (
    <Link
      href={post.href}
      onClick={onClose}
      className="group flex gap-4 border-l-4 bg-white px-5 py-4 transition hover:shadow-sm"
      style={{ borderLeftColor: themeColor }}
    >
      <div className="relative size-16 shrink-0 overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="64px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: themeColor }}>
            {post.tags.filter((t) => t !== "featured").join(", ")}
          </p>
          <h3 className="mt-0.5 text-sm font-bold leading-snug text-foreground group-hover:text-black/80">
            {highlight(post.title, query)}
          </h3>
        </div>
        <p className="line-clamp-1 text-xs leading-relaxed text-foreground/60">
          {highlight(post.excerpt, query)}
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

  const results = query.trim().length > 0
    ? blogs.filter((b) => {
        const q = query.toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.author.name.toLowerCase().includes(q)
        );
      }).slice(0, 6)
    : [];

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative z-10 mx-auto mt-[10vh] w-full max-w-2xl px-4">
        <div className="flex flex-col bg-[#FAF9F6] shadow-2xl ring-1 ring-black/[0.06]">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-foreground/10 px-5 py-4">
            <Search className="size-5 shrink-0 text-foreground/50" strokeWidth={2} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles, topics, tags…"
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-foreground/40 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center text-foreground/50 transition hover:text-foreground cursor-pointer"
              aria-label="Close search"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Results */}
          {query.trim().length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length > 0 ? (
                <div className="flex flex-col divide-y divide-foreground/[0.06]">
                  <p className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground/50">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </p>
                  {results.map((post) => (
                    <SearchResult key={post.id} post={post} query={query} onClose={onClose} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Search className="size-10 text-foreground/20" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-foreground/60">
                    No results for <strong>&ldquo;{query}&rdquo;</strong>
                  </p>
                  <p className="text-xs text-foreground/40">
                    Try searching by topic, title, or author name.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Empty state hint */}
          {query.trim().length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-foreground/50">Start typing to search all stories.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

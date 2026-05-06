"use client";

import { AUTHORS, readingMinutesFromContent } from "@/data/blog";
import { getThemeColor } from "@/features/posts/lib/tag-theme";
import { ClientMDXRemote } from "@/features/posts/components/mdx/client-mdx-remote";
import { Calendar, Clock, UserCircle, WandSparkles, X } from "lucide-react";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { CSSProperties } from "react";
import type { PostMetadata } from "./editor-metadata";

function capitalizeTopic(tag: string): string {
  return tag
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function seriesLabel(tags: string[]): string {
  const tag = tags.find((value) => value !== "featured");
  return tag ? capitalizeTopic(tag) : "Story";
}

function formatPreviewDate(value: string): string {
  if (!value) {
    return "Choose a publish date";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

interface EditorPreviewProps {
  previewSource: MDXRemoteSerializeResult | null;
  activeSlug: string | null;
  previewAsset: { slug: string; filename: string; dataUrl: string } | null;
  metadata: PostMetadata;
  previewContent: string;
  isPending: boolean;
  onClearPreviewAsset: () => void;
  onInsertAsset: (filename: string) => void;
}

export default function EditorPreview({
  previewSource,
  activeSlug,
  previewAsset,
  metadata,
  previewContent,
  isPending,
  onClearPreviewAsset,
  onInsertAsset,
}: EditorPreviewProps) {
  const themeColor = getThemeColor(metadata.tags);
  const label = seriesLabel(metadata.tags);
  const authorProfile =
    metadata.author && metadata.author in AUTHORS
      ? AUTHORS[metadata.author as keyof typeof AUTHORS]
      : null;
  const authorName =
    authorProfile?.name ??
    metadata.author?.replace(/-/g, " ") ??
    "Writer";
  const readingMinutes = readingMinutesFromContent(previewContent);
  const heroImage = metadata.image || metadata.thumbnail;

  if (previewAsset) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-admin-surface/80">
        <div className="flex items-center justify-between border-b border-admin-text/5 bg-admin-surface/50 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-admin-primary/60">
              Asset preview
            </p>
            <p className="text-sm font-bold text-admin-heading tracking-tight">
              Media Inspector
            </p>
          </div>
          <button
            onClick={onClearPreviewAsset}
            className="rounded-full border border-admin-text/10 bg-admin-surface p-2 transition hover:bg-admin-surface-hover shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-admin-bg/40 p-4 md:p-6">
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 rounded-3xl bg-admin-surface p-4 shadow-2xl md:p-6">
            <div className="w-full overflow-hidden rounded-2xl bg-admin-surface shadow-xl ring-1 ring-black/5">
            <img 
              src={previewAsset.dataUrl} 
              alt={previewAsset.filename}
              className="w-full h-auto object-contain max-h-[60vh]"
            />
          </div>
          
            <div className="w-full rounded-[20px] border border-admin-primary/15 bg-admin-primary/8 px-4 py-3">
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-admin-primary">
                Relative Path
              </p>
              <code className="text-sm font-bold text-admin-text">
                ./assets/{previewAsset.filename}
              </code>
            </div>
          
            <button
              onClick={() => {
                onInsertAsset(previewAsset.filename);
                onClearPreviewAsset();
              }}
              className="w-full rounded-full bg-admin-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-admin-contrast transition-colors hover:bg-admin-primary/90"
            >
              Insert Image
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-admin-surface/80">
      <div className="flex items-center justify-between border-b border-admin-text/5 bg-admin-surface/50 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-admin-primary/60">
            Live preview
          </p>
          <p className="text-sm font-bold text-admin-heading tracking-tight">
            Reader experience
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-admin-bg/80 px-3 py-1.5 text-[10px] uppercase font-black tracking-widest text-admin-primary/60 ring-1 ring-admin-text/5 md:flex">
          <WandSparkles className="size-3.5" />
          Guest View
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-admin-bg/40 p-3 md:p-5">
        <div className="mx-auto max-w-[1040px]">
          <article className="overflow-hidden rounded-3xl bg-background shadow-2xl">
            <header className="relative min-h-[20rem] overflow-hidden bg-admin-heading sm:min-h-[24rem]">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}, ${themeColor}55 58%, #1f3d39)`,
                  }}
                />
              )}

              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/45"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t to-transparent mix-blend-soft-light md:h-36"
                style={{
                  backgroundImage: `linear-gradient(to top, ${themeColor}50, transparent)`,
                }}
              />

              <div className="relative z-10 flex min-h-[20rem] flex-col px-6 pb-8 pt-14 text-white sm:min-h-[24rem] sm:px-8 md:px-10 md:pb-10">
                <div className="mt-auto max-w-4xl">
                  <span
                    className="mb-4 inline-flex items-center px-3 py-1 text-sm font-semibold text-black"
                    style={{ backgroundColor: themeColor }}
                  >
                    {label}
                  </span>
                  <h1 className="max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-balance text-white sm:text-4xl md:text-[4rem] md:leading-[1.1]">
                    {metadata.title || "Untitled story"}
                  </h1>
                  {metadata.excerpt ? (
                    <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/80 md:text-lg">
                      {metadata.excerpt}
                    </p>
                  ) : null}

                  <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <div className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white/90 ring-1 ring-white/20">
                        <UserCircle className="size-5" strokeWidth={1.75} />
                      </div>
                      <span className="font-semibold text-white">
                        {authorName}
                      </span>
                    </div>

                    <div className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden />

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/20">
                        <Calendar className="size-4 text-white/70" strokeWidth={1.5} />
                        <span className="font-medium text-white/90">
                          {formatPreviewDate(metadata.date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/20">
                        <Clock className="size-4 text-white/70" strokeWidth={1.5} />
                        <span className="font-medium text-white/90">
                          {readingMinutes} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 z-[11] h-1.5"
                style={{ backgroundColor: themeColor }}
                aria-hidden
              />
            </header>

            <div
              className="mx-auto mt-8 max-w-5xl px-5 pb-12 md:mt-10 md:px-8"
              style={{ "--theme-color": themeColor } as CSSProperties}
            >
              <div className="space-y-6 text-base leading-[1.8] text-foreground/90 md:text-[1.0625rem] md:leading-[1.85] [&>p:first-of-type]:text-[1.0625rem] [&>p:first-of-type]:leading-relaxed md:[&>p:first-of-type]:text-lg md:[&>p:first-of-type]:leading-relaxed [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:-mt-2 [&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:font-black [&>p:first-of-type]:first-letter:text-[var(--theme-color)] [&>p:first-of-type]:first-letter:leading-[0.75]">
                {isPending ? (
                  <div className="flex items-center justify-center py-24 text-sm font-medium text-foreground/45">
                    Compiling preview...
                  </div>
                ) : previewSource ? (
                  <ClientMDXRemote
                    source={previewSource}
                    assetFolder={activeSlug || undefined}
                  />
                ) : (
                  <div className="flex min-h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-admin-text/15 bg-admin-bg/35 px-6 text-center">
                    <p className="text-sm font-semibold text-admin-heading">
                      {activeSlug
                        ? "Keep writing and the preview will render here."
                        : "Open a story or create a draft to see the guest preview."}
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-admin-text/55">
                      The preview is styled like the public article page, so spacing,
                      image treatment, and typography stay closer to what readers
                      actually get.
                    </p>
                  </div>
                )}
              </div>

              <div
                className="mt-14 bg-foreground/5 px-6 py-8 text-center md:px-10"
                style={{ borderTop: `6px solid ${themeColor}` }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
                  The Strengths Writer
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                  Positive psychology and stories for personal and professional
                  growth.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

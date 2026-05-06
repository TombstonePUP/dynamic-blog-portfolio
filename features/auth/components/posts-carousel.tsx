"use client";

import type { Blog } from "@/features/posts/types";
import { User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type PostsCarouselProps = {
  posts: Blog[];
  className?: string;
};

function placeholderInitial(title: string) {
  const value = title.trim();
  return value ? value.charAt(0).toUpperCase() : "S";
}

export default function PostsCarousel({
  posts,
  className,
}: PostsCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % posts.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [posts.length]);

  useEffect(() => {
    if (index >= posts.length) {
      setIndex(0);
    }
  }, [index, posts.length]);

  if (posts.length === 0) {
    return (
      <div
        className={`${className || ""} relative z-10 flex aspect-[16/10] w-full items-center justify-center overflow-hidden border border-white/10 bg-black/20 px-8 text-center text-white/70 shadow-2xl backdrop-blur-sm`}
      >
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
            Story preview
          </p>
          <p className="mt-4 text-lg font-semibold">
            No published stories are available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${className || ""} relative z-10 aspect-[16/10] w-full overflow-hidden border border-white/10 bg-black/20 shadow-2xl backdrop-blur-sm group`}
    >
      {posts.map((post, itemIndex) => {
        const title = post.title.trim() || "Untitled story";
        const excerpt =
          post.excerpt.trim() ||
          "This published story does not have an excerpt yet.";
        const authorName = post.author.name.trim() || "Writer";

        return (
          <div
            key={post.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              itemIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {post.thumbnail ? (
              <Image
                src={post.thumbnail}
                alt={title}
                fill
                className="object-cover"
                priority={itemIndex === 0}
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#72dbcc,#1f3d39_68%,#111111)]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/40 to-transparent" />

            {!post.thumbnail ? (
              <div className="absolute left-6 top-6 flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-3xl font-black text-white/70">
                {placeholderInitial(title)}
              </div>
            ) : null}

            <div className="absolute inset-0 flex translate-y-0 flex-col justify-end p-6 transition-transform duration-700">
              <div className="mb-3 flex items-center gap-2">
                {post.author.image ? (
                  <Image
                    src={post.author.image}
                    alt={authorName}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <User className="size-4 text-white/60" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  {authorName}
                </span>
                <span className="text-[10px] text-white/30">•</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  {post.dateLabel}
                </span>
              </div>
              <h3 className="mb-2 line-clamp-2 text-xl font-bold leading-tight text-white">
                {title}
              </h3>
              <p className="line-clamp-2 text-sm leading-relaxed text-white/70">
                {excerpt}
              </p>
            </div>
          </div>
        );
      })}

      <div className="absolute right-4 top-4 z-20 flex gap-1.5">
        {posts.map((post, itemIndex) => (
          <button
            key={post.id}
            type="button"
            onClick={() => setIndex(itemIndex)}
            className={`h-1 transition-all duration-300 ${
              itemIndex === index
                ? "w-6 bg-white"
                : "w-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Show story ${itemIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

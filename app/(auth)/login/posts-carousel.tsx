"use client";

import type { Blog } from "@/types/blog";
import { User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function PostsCarousel({ posts, className }: { posts: Blog[], className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % posts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [posts.length]);

  if (posts.length === 0) return null;

  const current = posts[index];

  return (
    <div className={`${className} relative z-10 aspect-[16/10] w-full overflow-hidden border border-white/10 bg-black/20 shadow-2xl backdrop-blur-sm group`}>
      {posts.map((post, i) => (
        <div
          key={post.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100" : "opacity-0"
            }`}
        >
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 transition-transform duration-700 translate-y-0">
            <div className="flex items-center gap-2 mb-3">
              {post.author.image ? (
                <Image src={post.author.image} alt={post.author.name} width={20} height={20} className="rounded-full" />
              ) : (
                <User className="size-4 text-white/60" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{post.author.name}</span>
              <span className="text-[10px] text-white/30">•</span>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{post.dateLabel}</span>
            </div>
            <h3 className="text-xl font-bold leading-tight text-white mb-2 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-white/70 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          </div>
        </div>
      ))}

      <div className="absolute top-4 right-4 flex gap-1.5 z-20">
        {posts.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1 transition-all duration-300 ${i === index ? "w-6 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
          />
        ))}
      </div>
    </div>
  );
}

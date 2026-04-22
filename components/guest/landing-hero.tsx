import type { Blog } from "@/types/blog";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

const dotStyle: CSSProperties = {
  backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.5) 1.7px, transparent 1.5px)`,
  backgroundSize: "28px 28px",
};

export default function LandingHero({ latestPost }: { latestPost: Blog }) {
  return (
    <section className="relative mt-4 w-full overflow-hidden bg-gradient-to-b from-transparent to-primary/30 z-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 min-h-screen " aria-hidden />

      <div className="relative mx-auto flex min-h-[min(100svh,42rem)] max-w-7xl flex-col gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-14 lg:flex-row lg:justify-between lg:gap-16 lg:pb-16">
        <div className="max-w-xl shrink-0 lg:max-w-lg">
          <span className="mb-4 inline-flex items-center bg-[#F0D8A1] px-3 py-1 text-sm text-black">
            Latest Featured
          </span>
          <h1 className="mb-4 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.15rem] lg:leading-[1.05]">
            <span className="text-[#c0af97]">Blogs</span> to help you thrive in
            your <span className="text-[#c0af97]">personal</span> and{" "}
            <span className="text-[#c0af97]">professional</span> life.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-foreground/80">
            Discover insights and tips to grow both personally and
            professionally.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-background border-1 border-foreground/10 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5"
            >
              About Strengths Writer
            </Link>
            <Link
              href="/topics"
              className="group inline-flex items-center gap-2 border-1 border-transparent bg-[#F0D8A1] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#e8cc8a]"
            >
              Explore
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <Link
          href={latestPost.href}
          className="group relative h-fit flex w-full max-w-md flex-col self-center overflow-hidden bg-background shadow-[0_24px_48px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/10 transition hover:ring-[#F0D8A1]/60 lg:max-w-md lg:self-stretch"
        >
          <div className="border-t-[6px] border-[#F0D8A1] px-8 pb-10 pt-8 sm:px-10">
            <div className="relative aspect-[4/3] w-full overflow-hidden sm:h-52 sm:aspect-auto">
              <Image
                fill
                src={latestPost.image}
                alt={latestPost.title}
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 28rem"
                priority
              />
            </div>
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-bold leading-snug text-foreground sm:text-2xl">
                {latestPost.title}
              </h2>
              <p className="line-clamp-4 text-base leading-relaxed text-foreground/80">
                {latestPost.excerpt}
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </Link>
      </div>
    </section>
  );
}

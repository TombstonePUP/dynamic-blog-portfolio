import { blogs } from "@/data/blog";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

function HeroDotPattern() {
  const dotStyle: CSSProperties = {
    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.55) 1.7px, transparent 1.5px)`,
    backgroundSize: "28px 28px",
  };
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bottom-10 left-[min(20rem,40%)] w-[clamp(12rem,45vw,28rem)] opacity-90"
        style={dotStyle}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 left-0 top-[30%] w-[min(12rem,35vw)] opacity-80"
        style={dotStyle}
        aria-hidden
      />
    </>
  );
}

export default function BlogIndexPage() {
  const sorted = [...blogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <main className="relative min-h-screen space-y-0 pb-16 font-sans">
      <section className="relative mt-4 w-full overflow-x-hidden bg-primary px-5 pb-28 pt-12 md:px-10 md:pb-36 md:pt-14">
        <HeroDotPattern />
        <div className="relative mx-auto max-w-7xl">
          <span className="mb-4 mt-2 flex w-fit items-center bg-[#F0D8A1] px-3 py-1 text-sm text-black">
            All posts
          </span>
          <h1 className="mb-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            <span className="text-[#F0D8A1]">Stories</span> to sit with—in your{" "}
            <span className="text-[#F0D8A1]">personal</span> and{" "}
            <span className="text-[#F0D8A1]">professional</span> life.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-white/90">
            Same voice as the home page: longer reads when you want to go
            deeper.
          </p>
        </div>
      </section>

      <section className="relative z-10 -mt-24 mx-auto max-w-7xl bg-[#f3f2f0] px-0 shadow-sm">
        <h2 className="border-t-10 border-[#72dbcc] py-8 text-center text-4xl font-bold text-foreground">
          Journal
        </h2>
        <div className="grid gap-6 p-6 pt-0 sm:grid-cols-2 sm:p-10 lg:grid-cols-3">
          {sorted.map((post) => {
            const topic =
              post.tags.find((t) => t !== "featured") ?? post.tags[0];
            return (
              <Link
                key={post.id}
                href={post.href}
                className="group flex flex-col gap-6 overflow-hidden bg-white p-8 transition"
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    fill
                    src={post.image}
                    alt={post.title}
                    className="object-cover transition duration-300 group-hover:scale-101"
                  />
                  <span className="absolute left-2 top-2 bg-[#72dbcc]/80 px-2 py-1 text-xs font-semibold capitalize text-black">
                    {topic}
                  </span>
                </div>
                <div className="flex min-h-[7.5rem] flex-col justify-between gap-3">
                  <h3 className="text-lg font-black leading-snug text-foreground transition group-hover:text-black/80">
                    {post.title}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-foreground/80">
                    {post.excerpt}
                  </p>
                  <time
                    dateTime={post.date}
                    className="text-xs font-medium uppercase tracking-wide text-foreground/50"
                  >
                    {post.dateLabel}
                  </time>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

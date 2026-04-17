import { blogs } from "@/data/blog";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const sortedBlogs = [...blogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const latestPost =
    sortedBlogs.find((post) => post.tags.includes("featured")) ??
    sortedBlogs[0];
  const secondaryPosts = sortedBlogs
    .filter((post) => post.id !== latestPost.id)
    .slice(0, 3);

  return (
    <main className="relative min-h-screen font-sans space-y-6">
      <section className=" w-full mt-4 bg-primary h-160 flex gap-16 justify-center pt-12">
        <div>
          <span className="flex items-center bg-[#F0D8A1] py-1 px-3 mb-4 mt-4 text-black text-sm w-fit">
            Latest Featured
          </span>
          <h1 className="text-5xl max-w-lg font-bold tracking-tight text-white leading-tight mb-4">
            <span className="text-[#F0D8A1]">Blogs</span> to help you thrive in
            your <span className="text-[#F0D8A1]">personal</span> and{" "}
            <span className="text-[#F0D8A1]">professional</span> life.
          </h1>
          <p className="text-lg leading-relaxed text-white/90 max-w-md">
            Discover insights and tips to grow both personally and
            professionally.
          </p>
          <Link
            href="/blogs"
            className="group inline-flex items-center gap-2 mt-8 px-6 py-3 bg-transparent text-white text-sm font-semibold hover:bg-white/10 transition-colors duration-200 mr-4 border-2 border-white"
          >
            About Author
          </Link>
          <Link
            href="/blogs"
            className="group inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[#F0D8A1] text-black text-sm font-semibold hover:bg-[#e8cc8a] transition-colors duration-200 border-2 border-transparent"
          >
            Explore
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
        <Link
          key={latestPost.id}
          href={latestPost.href}
          className="group relative flex flex-col overflow-hidden transition h-full max-w-md p-8 px-10 pb-0 bg-background border-t-6 border-[#F0D8A1]"
        >
          <div className="relative overflow-hidden h-45">
            <Image
              fill
              src={latestPost.image}
              alt={latestPost.title}
              className="object-cover group-hover:scale-101 transition duration-300"
            />
          </div>

          <span className="mt-6 space-y-6">
            <h4 className="text-2xl font-bold text-black leading-snug">
              {latestPost.title}
            </h4>
            <p className="text-base text-foreground/80 leading-relaxed line-clamp-4">
              {latestPost.excerpt}
            </p>
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/1 to-transparent pointer-events-none" />
        </Link>
      </section>

      <section className="relative -top-40 z-10 max-w-7xl mx-auto bg-[#f3f2f0]">
        <div className="text-4xl font-bold text-foreground py-8  text-center border-t-10 border-[#89f0e1]">
          Featured
        </div>
        <div className="flex p-10 pt-0 gap-6 flex-col md:flex-row">
          {secondaryPosts.map((post) => (
            <Link
              key={post.id}
              href={post.href}
              className={`group flex flex-col gap-6 overflow-hidden transition p-8 bg-white`}
            >
              <div className="relative overflow-hidden h-44">
                <Image
                  fill
                  src={post.image}
                  alt={post.title}
                  className="object-cover group-hover:scale-101 transition duration-300"
                />
                <h1 className="absolute capitalize top-2 left-2 bg-[#89f0e1]/80 text-xs text-black font-semibold px-2 py-1">
                  {post.tags.filter((tag) => tag !== "featured")[0]}
                </h1>
              </div>

              <div className="flex flex-col justify-between h-30">
                <h4 className="font-black text-lg tracking-wide text-foreground leading-snug mb-2 group-hover:text-black/80 transition">
                  {post.title}
                </h4>

                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

import LandingHero from "@/components/guest/landing-hero";
import LandingScrollFeed from "@/components/guest/landing-scroll-feed";
import { blogs } from "@/data/blog";

export default function LandingPage() {
  const sortedBlogs = [...blogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const latestPost =
    sortedBlogs.find((post) => post.tags.includes("featured")) ??
    sortedBlogs[0];
  const streamPosts = sortedBlogs.filter((post) => post.id !== latestPost.id);

  return (
    <main className="relative min-h-screen font-sans">
      <LandingHero latestPost={latestPost} />
      <LandingScrollFeed streamPosts={streamPosts} />
    </main>
  );
}

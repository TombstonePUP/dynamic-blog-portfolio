import { getOwnedPosts } from "@/lib/admin-data.server";
import ExplorerGrid from "./explorer-grid";

export const metadata = {
  title: "Explorer | Writer Dashboard",
  description: "Manage your story folders and assets.",
};

export default async function PostsPage() {
  const { posts } = await getOwnedPosts();
  const folders = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    status: post.status,
    date: post.published_on || post.created_at.slice(0, 10),
    updatedAt: post.updated_at,
  }));

  return (
    <main className="flex-1 flex overflow-hidden w-full">
      <ExplorerGrid initialFolders={folders} />
    </main>
  );
}

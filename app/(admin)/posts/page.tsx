import { getOwnedPosts } from "@/lib/admin-data.server";
import ExplorerGrid from "./explorer-grid";

export const metadata = {
  title: "Explorer | Admin Console",
  description: "Manage your blog post folders and assets.",
};

export default async function PostsPage() {
  const { posts } = await getOwnedPosts();
  const folders = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    status: post.status,
    date: post.published_on || post.created_at.slice(0, 10),
    updatedAt: post.updated_at,
  }));

  return (
    <main className="px-8 pb-8 pt-10 flex-1 flex flex-col">
      <ExplorerGrid initialFolders={folders} />
    </main>
  );
}

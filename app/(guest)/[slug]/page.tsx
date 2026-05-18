import ArticlePage from "@/features/posts/components/guest/article-page";
import {
  getBlogBySlug,
  getBlogs,
  getCommentThread,
  getRelatedBlogs,
} from "@/services/posts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: `${post.title} | The Strengths Writer`,
    description: post.excerpt.slice(0, 155),
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const blogs = await getBlogs();
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = await getRelatedBlogs(post);
  const relatedSlugs = new Set([post.slug, ...related.map((blog) => blog.slug)]);
  const fallbackPosts = blogs
    .filter((blog) => !relatedSlugs.has(blog.slug))
    .sort(
      (left, right) =>
        new Date(right.date).getTime() - new Date(left.date).getTime(),
    );
  const more = [...related, ...fallbackPosts].slice(0, 3);
  const commentThread = await getCommentThread(post.slug).catch((error) => ({
    comments: [],
    canModerateComments: false,
    error:
      error instanceof Error
        ? error.message
        : "Comments are unavailable right now.",
  }));

  return (
    <ArticlePage
      post={post}
      more={more}
      comments={commentThread.comments}
      canModerateComments={commentThread.canModerateComments}
      commentsError={"error" in commentThread ? commentThread.error : undefined}
    />
  );
}

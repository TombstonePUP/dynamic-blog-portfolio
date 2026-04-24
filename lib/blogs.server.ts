import { getAllPosts } from "./mdx";
import { AUTHORS } from "@/data/blog";
import type { Blog } from "@/types/blog";

/**
 * Fetch all blogs from the MDX files. 
 * This is server-side only.
 */
export function getBlogs(): Blog[] {
  return getAllPosts().map((post, index) => {
    const { frontmatter, slug } = post;
    
    const resolveImagePath = (pathStr: string) => {
      if (pathStr.startsWith("./")) {
        return `/images/posts/${slug}/${pathStr.slice(2)}`;
      }
      return pathStr;
    };

    return {
      id: index + 1,
      slug: post.slug,
      title: frontmatter.title,
      href: `/blog/${post.slug}`,
      image: resolveImagePath(frontmatter.image),
      thumbnail: resolveImagePath(frontmatter.thumbnail || frontmatter.image),
      author: AUTHORS[frontmatter.author as keyof typeof AUTHORS] || AUTHORS.ian,
      date: frontmatter.date,
      dateLabel: new Date(frontmatter.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      tags: frontmatter.tags || [],
      excerpt: frontmatter.excerpt || "",
      content: [], // Loaded via MDX components
      commentCount: 0,
    };
  });
}

export function getBlogBySlug(slug: string): Blog | undefined {
  return getBlogs().find((b) => b.slug === slug);
}

/** Other posts that share at least one non-featured tag, most recent first */
export function getRelatedBlogs(post: Blog, limit = 3): Blog[] {
  const blogs = getBlogs();
  const postTags = new Set(post.tags.filter((t) => t !== "featured"));
  return [...blogs]
    .filter((b) => b.slug !== post.slug)
    .filter((b) => b.tags.some((t) => t !== "featured" && postTags.has(t)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}


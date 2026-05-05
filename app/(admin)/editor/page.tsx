import MdxEditor from "@/features/posts/components/admin/mdx-editor";
import { buildEditorContentFromPost, getOwnedPosts } from "@/services/posts";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Writer | The Strengths Writer",
  description: "Create and preview your stories.",
};

type EditorPageProps = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const { posts, profile } = await getOwnedPosts();
  const { slug } = await searchParams;
  const selectedPost = slug ? posts.find((post) => post.slug === slug) : null;

  const initialContent = `---
title: "A New Journey"
status: "draft"
date: "${new Date().toISOString().split('T')[0]}"
author: "${profile?.slug || "writer"}"
image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1400"
thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800"
excerpt: "The beginning of a new chapter in positive psychology."
tags: ["featured", "personal blog"]
---

# Your story starts here

The strengths writer is a personal blog to promote positive change, mental health and the psychology of everyday life. 

## Focus on what matters

> "Focus on your strengths, not your weaknesses."

Use the editor on the left to write your content, and see the preview update live on the right. 

### Why write in MDX?

1. **Flexibility**: Mix markdown with components.
2. **Speed**: Lightweight and fast.
3. **Portability**: Your files are just plain text.
`;

  const initialBlogFolders = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    status: post.status,
    updatedAt: post.updated_at,
  }));
  const initialBlogContents: Record<string, string> = selectedPost
    ? {
        [selectedPost.slug]: buildEditorContentFromPost(
          selectedPost,
          profile?.slug || "writer",
        ),
      }
    : {};

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-4 md:px-6 md:pb-6 md:pt-5">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading editor...</div>}>
        <MdxEditor 
          initialContent={initialContent} 
          initialBlogFolders={initialBlogFolders}
          initialBlogContents={initialBlogContents}
        />
      </Suspense>
    </main>
  );
}

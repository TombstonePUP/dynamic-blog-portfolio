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
title: "Untitled story"
status: "draft"
date: "${new Date().toISOString().split('T')[0]}"
author: "${profile?.slug || "writer"}"
image: ""
excerpt: ""
tags: []
---

# Start writing
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
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
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

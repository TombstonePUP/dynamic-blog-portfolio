import MdxEditor from "@/components/admin/mdx-editor";
import { Metadata } from "next";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Writer | The Strengths Writer",
  description: "Create and preview your stories.",
};

export default function EditorPage() {
  const initialContent = `---
title: "A New Journey"
date: "${new Date().toISOString().split('T')[0]}"
author: "ian"
image: "./cover.jpg"
thumbnail: "./thumbnail.jpg"
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

  const POSTS_PATH = path.join(process.cwd(), "content/posts");
  let initialBlogFolders: any[] = [];
  const initialBlogContents: Record<string, string> = {};

  try {
    if (fs.existsSync(POSTS_PATH)) {
      const entries = fs.readdirSync(POSTS_PATH);
      initialBlogFolders = entries.map(slug => {
        const folderPath = path.join(POSTS_PATH, slug);
        const stat = fs.statSync(folderPath);
        if (!stat.isDirectory()) return null;
        
        const files = fs.readdirSync(folderPath);
        
        // Load the index.mdx content for this post
        const mdxPath = path.join(folderPath, "index.mdx");
        if (fs.existsSync(mdxPath)) {
          initialBlogContents[slug] = fs.readFileSync(mdxPath, "utf8");
        }
        
        return { slug, files };
      }).filter(Boolean);
    }
  } catch (error) {
    console.error("Error loading posts for editor:", error);
  }

  return (
    <main className="px-8 pb-8 pt-6">
      <MdxEditor 
        initialContent={initialContent} 
        initialBlogFolders={initialBlogFolders}
        initialBlogContents={initialBlogContents}
      />
    </main>
  );
}

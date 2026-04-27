import { NextResponse } from "next/server";
import { getBlogs } from "@/lib/blogs.server";

export async function GET() {
  const blogs = await getBlogs();

  return NextResponse.json(
    blogs.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      tags: post.tags,
      date: post.date,
      href: post.href,
      source: post.source,
    })),
  );
}

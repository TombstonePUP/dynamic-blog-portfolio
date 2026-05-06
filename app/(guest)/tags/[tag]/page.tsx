import { slugToTag } from "@/data/blog";
import TagPage from "@/features/posts/components/guest/tag-page";
import { getBlogs } from "@/services/posts";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ tag: string }>;
};

function capitalizeTopic(tag: string) {
  return tag
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag: slug } = await params;
  const tag = slugToTag(slug);

  if (!tag) {
    return { title: "Tag not found" };
  }

  return {
    title: `${capitalizeTopic(tag)} | The Strengths Writer`,
    description: `Browse stories tagged with ${capitalizeTopic(tag)}.`,
  };
}

export default async function TagRoute({ params }: PageProps) {
  const { tag: slug } = await params;
  const tag = slugToTag(slug);

  if (!tag) {
    notFound();
  }

  const blogs = await getBlogs();
  const tagBlogs = blogs.filter((blog) => blog.tags.includes(tag));

  return <TagPage tag={tag} blogs={tagBlogs} />;
}

import TopicsPage from "@/features/posts/components/guest/topics-page";
import { getTopicsIndex } from "@/services/posts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Topics | The Strengths Writer",
  description: "Explore blogs categorized by topics.",
};

export default async function TopicsRoute() {
  const { topics, posts } = await getTopicsIndex();

  return <TopicsPage topics={topics} blogs={posts} />;
}

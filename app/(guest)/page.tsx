import HomePage from "@/features/posts/components/guest/home-page";
import { getBlogs } from "@/services/posts";

export default async function LandingPage() {
  const blogs = await getBlogs();

  return <HomePage blogs={blogs} />;
}

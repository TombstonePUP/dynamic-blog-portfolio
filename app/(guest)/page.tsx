import HomePage from "@/features/posts/components/guest/home-page";
import { getBlogs, getGuestAdminModeration } from "@/services/posts";

export default async function LandingPage() {
  const [blogs, adminModeration] = await Promise.all([
    getBlogs(),
    getGuestAdminModeration(),
  ]);

  return <HomePage blogs={blogs} adminModeration={adminModeration} />;
}

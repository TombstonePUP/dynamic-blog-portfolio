import { Button } from "@/components/admin/ui/button";
import { getOwnedPosts } from "@/lib/admin-data.server";
import { Eye, FileEdit, Layout, Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardHome() {
  const { posts, profile } = await getOwnedPosts();
  const publishedCount = posts.filter((post) => post.status === "published").length;
  const draftCount = posts.filter((post) => post.status === "draft").length;
  const archivedCount = posts.filter((post) => post.status === "archived").length;

  const stats = [
    { label: "Total Stories", value: String(posts.length), icon: Layout, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Active Drafts", value: String(draftCount), icon: FileEdit, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Published", value: String(publishedCount), icon: Eye, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];
  const displayName = profile?.display_name || "Writer";

  return (
    <main className="px-8 py-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <section className="flex flex-col gap-2">
          <h2 className="text-3xl font-black tracking-tight text-admin-text">Welcome back, {displayName}.</h2>
          <p className="text-admin-text/50 font-medium">Here&apos;s what&apos;s happening with your publishing desk today.</p>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6 shadow-sm ring-1 flex items-center gap-5">
              <div className={`size-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest ">{stat.label}</p>
                <p className="text-2xl font-black text-admin-text">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <div className="p-10 shadow-sm ring-1 flex flex-col gap-6">
            <h3 className="text-xl font-bold tracking-tight">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
              >
                <Link href="/editor" className="flex items-center justify-center gap-2">
                  <Plus size={16} />
                  New Story
                </Link>
              </Button>
              <Button>
                <Link href="/topics" className="flex items-center justify-center gap-2">
                  <Eye size={16} />
                  View Site
                </Link>
              </Button>
            </div>
          </div>

          <div className="bg-[#72dbcc]/5 border border-[#72dbcc]/20 p-10 flex flex-col gap-4">
            <h3 className="text-xl font-bold tracking-tight text-[#2b776a]">Writing Tip</h3>
            <p className="text-[#2b776a]/80 leading-relaxed text-sm italic">
              {draftCount > 0
                ? `You have ${draftCount} draft${draftCount === 1 ? "" : "s"} waiting. A short revision session can turn one of them into your next published piece.`
                : "You do not need a big writing window to make progress. A clean headline, a stronger excerpt, and one honest paragraph can move a draft forward."}
            </p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2b776a]/60">
              <Users size={12} />
              {archivedCount} archived {archivedCount === 1 ? "story" : "stories"}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Plus({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

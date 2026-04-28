import { Button } from "@/components/admin/ui/button";
import { getOwnedPosts, isAdminProfile } from "@/lib/admin-data.server";
import { Eye, FileEdit, Layout, Users } from "lucide-react";
import Link from "next/link";

export default async function DashboardHome() {
  const { posts, profile, supabase } = await getOwnedPosts();
  const recentStories = posts.slice(0, 6);
  const publishedCount = posts.filter((post) => post.status === "published").length;
  const draftCount = posts.filter((post) => post.status === "draft").length;
  const archivedCount = posts.filter((post) => post.status === "archived").length;
  const isAdmin = isAdminProfile(profile);
  let pendingApprovals = 0;

  if (isAdmin) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending");

    pendingApprovals = count || 0;
  }

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

        {isAdmin ? (
          <section className="border border-[#1f3d39]/12 bg-[#1f3d39]/[0.03] p-8">
            <div className="flex items-center justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1f3d39]/55">
                  User Management
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-admin-text">
                  {pendingApprovals} account{pendingApprovals === 1 ? "" : "s"} waiting for approval
                </h3>
                <p className="mt-3 text-sm leading-6 text-admin-text/60">
                  Review new registrations, approve writers, and manage who can enter the publishing dashboard.
                </p>
              </div>
              <Link
                href="/users"
                className="inline-flex items-center justify-center bg-[#111111] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-black/85"
              >
                Open User Management
              </Link>
            </div>
          </section>
        ) : null}

        {/* Quick Actions */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <div className="p-10 shadow-sm ring-1 flex flex-col gap-6">
            <h3 className="text-xl font-bold tracking-tight">Quick Actions</h3>
            <div className={`grid grid-cols-1 gap-4 ${isAdmin ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              <Button variant="outline">
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
              {isAdmin ? (
                <Button variant="outline">
                  <Link href="/users" className="flex items-center justify-center gap-2">
                    <Users size={16} />
                    Manage Users
                  </Link>
                </Button>
              ) : null}
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

        <section className="border border-black/8 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-admin-text/45">
                Story Library
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-admin-text">
                Your story library now runs from Supabase
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-admin-text/60">
                Drafts, published posts, author bylines, and migrated story assets now live in
                the database-backed publishing system instead of local content folders.
              </p>
            </div>
            <Link
              href="/posts"
              className="inline-flex items-center justify-center border border-black/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-admin-text transition hover:bg-black/5"
            >
              Open Explorer
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentStories.map((post) => (
              <Link
                key={post.id}
                href={`/editor?slug=${encodeURIComponent(post.slug)}`}
                className="group border border-black/8 bg-[#fbfaf6] p-5 transition hover:-translate-y-0.5 hover:border-black/15 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-full bg-black/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-admin-text/55">
                    {post.status}
                  </span>
                  <span className="text-[11px] text-admin-text/40">
                    {new Date(post.updated_at).toLocaleDateString("en-US")}
                  </span>
                </div>
                <h4 className="mt-4 text-lg font-bold leading-snug text-admin-text transition group-hover:text-black">
                  {post.title}
                </h4>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-admin-text/60">
                  {post.excerpt || "Open this story in the editor to continue refining it."}
                </p>
                <p className="mt-4 text-[11px] font-black uppercase tracking-[0.14em] text-admin-text/40">
                  {post.slug}
                </p>
              </Link>
            ))}
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

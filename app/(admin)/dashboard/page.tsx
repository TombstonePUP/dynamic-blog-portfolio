import Link from "next/link";
import { FileEdit, Layout, Settings, Users } from "lucide-react";

export default function DashboardHome() {
  const stats = [
    { label: "Total Stories", value: "8", icon: Layout, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Active Drafts", value: "3", icon: FileEdit, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Total Views", value: "1.2k", icon: Users, color: "text-emerald-600", bg: "bg-emerald-100" },
  ];

  return (
    <main className="px-8 py-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-8">
        {/* Welcome Section */}
        <section className="flex flex-col gap-2">
          <h2 className="text-3xl font-black tracking-tight text-foreground">Welcome back, Ian.</h2>
          <p className="text-foreground/50 font-medium">Here&apos;s what&apos;s happening with your journal today.</p>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 shadow-sm ring-1 ring-black/5 flex items-center gap-5">
              <div className={`size-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{stat.label}</p>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <div className="bg-white p-10 shadow-sm ring-1 ring-black/5 flex flex-col gap-6">
            <h3 className="text-xl font-bold tracking-tight">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                href="/editor" 
                className="flex items-center justify-center gap-3 bg-foreground text-background py-4 px-6 text-sm font-bold uppercase tracking-widest transition hover:bg-foreground/80"
              >
                <Plus size={16} />
                New Story
              </Link>
              <Link 
                href="/topics" 
                className="flex items-center justify-center gap-3 border border-black/10 py-4 px-6 text-sm font-bold uppercase tracking-widest transition hover:bg-black/5"
              >
                View Site
              </Link>
            </div>
          </div>

          <div className="bg-[#72dbcc]/5 border border-[#72dbcc]/20 p-10 flex flex-col gap-4">
            <h3 className="text-xl font-bold tracking-tight text-[#2b776a]">Writing Tip</h3>
            <p className="text-[#2b776a]/80 leading-relaxed text-sm italic">
              &quot;Positive psychology is not just about being happy. It&apos;s about building resilience and finding meaning in the everyday moments.&quot;
            </p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2b776a]/60">
              <Settings size={12} />
              Customize Dashboard
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

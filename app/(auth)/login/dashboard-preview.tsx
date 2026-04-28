"use client";

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-sm ${className}`}
      style={{ background: "rgba(255,255,255,0.08)" }}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  published: "text-[#5DCAA5] bg-[#5DCAA5]/10 border-[#5DCAA5]/25",
  draft: "text-white/40 bg-white/5 border-white/10",
  archived: "text-white/25 bg-white/[0.03] border-white/[0.08]",
};

function StoryCardMock({
  title,
  excerpt,
  status,
  date,
  delay = 0,
}: {
  title: string;
  excerpt: string;
  status: "published" | "draft" | "archived";
  date: string;
  delay?: number;
}) {
  return (
    <div
      className="flex flex-col justify-between gap-3 border p-5"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.03)",
        animation: `fadeup 0.45s ease both`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-bold leading-snug text-white/80">{title}</p>
        <p className="line-clamp-2 text-[11px] leading-5 text-white/35">
          {excerpt}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/25">{date}</span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_STYLES[status]}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: string;
  delay?: number;
}) {
  return (
    <div
      className="flex flex-col gap-1.5 border p-5"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.04)",
        animation: `fadeup 0.45s ease both`,
        animationDelay: `${delay}ms`,
      }}
    >
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
        {label}
      </span>
      <span
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        className="text-3xl font-normal text-white/90"
      >
        {value}
      </span>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap');
        @keyframes shimmer { 100% { transform: translateX(200%); } }
        @keyframes fadeup { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="w-full">
        <div className="flex flex-col gap-8 p-8">
          {/* Welcome Section */}
          <section
            className="flex flex-col gap-1"
            style={{ animation: "fadeup 0.4s ease both" }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
              Dashboard / Overview
            </p>
            <div className="mt-1 flex items-baseline gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-white/85">
                Welcome back,
              </h1>
              <Shimmer className="h-7 w-28 translate-y-0.5" />
            </div>
            <Shimmer className="mt-2 h-3 w-64" />
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Stories" value="16" delay={80} />
            <StatCard label="Active Drafts" value="4" delay={130} />
            <StatCard label="Published" value="12" delay={180} />
          </div>

          {/* Quick Actions + Writing Tip */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="flex flex-col gap-5 border p-6"
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                animation: "fadeup 0.45s ease both",
                animationDelay: "240ms",
              }}
            >
              <h3 className="text-sm font-bold tracking-tight text-white/75">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-2.5">
                <div
                  className="flex items-center justify-center gap-2 border px-4 py-2 text-[11px] font-semibold text-white/80"
                  style={{
                    borderColor: "rgba(29,158,117,0.5)",
                    background: "rgba(29,158,117,0.12)",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  New Story
                </div>
                <div
                  className="flex items-center justify-center border px-4 py-2 text-[11px] font-semibold text-white/35"
                  style={{
                    borderColor: "rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  View Site
                </div>
              </div>
            </div>

            <div
              className="flex flex-col gap-3 border p-6"
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.03)",
                animation: "fadeup 0.45s ease both",
                animationDelay: "290ms",
              }}
            >
              <h3 className="text-sm font-bold tracking-tight text-white/75">
                Writing Tip
              </h3>
              <p className="font-mono text-[11px] leading-relaxed text-white/35">
                {`> You have 4 drafts waiting. A short revision session can turn one of them into your next published piece.`}
              </p>
              <p className="mt-auto text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5DCAA5]/70">
                3 archived stories
              </p>
            </div>
          </div>

          {/* Story Library */}
          <section
            className="flex flex-col gap-5 border p-6"
            style={{
              borderColor: "rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
              animation: "fadeup 0.45s ease both",
              animationDelay: "350ms",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5DCAA5]/70">
                  Story Library
                </p>
                <h3 className="mt-1 text-base font-bold tracking-tight text-white/75">
                  Recent posts
                </h3>
              </div>
              <div
                className="border px-3 py-1.5 text-[11px] font-semibold text-white/35"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                Open Explorer
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StoryCardMock
                title="Finding strength in uncertainty"
                excerpt="What does it mean to lead from your strengths when the path ahead isn't clear?"
                status="published"
                date="Apr 12"
                delay={420}
              />
              <StoryCardMock
                title="The quiet power of consistency"
                excerpt="Small daily habits compound into the foundation of your best work."
                status="draft"
                date="Edited 2h ago"
                delay={460}
              />
              <StoryCardMock
                title="Why your narrative matters"
                excerpt="The stories you tell about yourself shape everything that comes after."
                status="published"
                date="Mar 3"
                delay={500}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

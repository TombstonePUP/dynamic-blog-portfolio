import { Eye, FileEdit, Layout, LucideIcon } from "lucide-react";

type Stat = {
  label: string;
  value?: string;
  icon: LucideIcon;
};

export default function DashboardStats({
  stats,
  isLoading = false,
  className = "",
  variant = "default",
}: {
  stats?: Stat[];
  isLoading?: boolean;
  className?: string;
  variant?: "default" | "glass";
}) {
  const defaultStats: Stat[] = [
    { label: "Total Stories", icon: Layout },
    { label: "Active Drafts", icon: FileEdit },
    { label: "Published", icon: Eye },
  ];

  const displayStats = stats || defaultStats;

  return (
    <div className={`grid grid-cols-1 gap-6 md:grid-cols-3 ${className}`}>
      {displayStats.map((stat) => (
        <div
          key={stat.label}
          className={`flex items-center gap-5 border p-6 shadow-sm ${
            variant === "glass"
              ? "border-white/10 bg-white/5 backdrop-blur-md"
              : "border-admin-surface-hover bg-admin-surface"
          }`}
        >
          <div
            className={`flex size-12 items-center justify-center border ${
              variant === "glass"
                ? "border-white/10 bg-white/5 text-white/80"
                : "border-admin-surface-hover bg-admin-bg text-admin-accent"
            }`}
          >
            <stat.icon size={24} />
          </div>
          <div className="flex-1">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                variant === "glass" ? "text-white/40" : "text-admin-muted"
              }`}
            >
              {stat.label}
            </p>
            {isLoading ? (
              <div
                className={`mt-2 h-8 w-16 animate-pulse rounded ${
                  variant === "glass" ? "bg-white/10" : "bg-admin-bg"
                }`}
              />
            ) : (
              <p
                className={`text-3xl font-bold ${
                  variant === "glass" ? "text-white" : "text-admin-accent"
                }`}
              >
                {stat.value || "0"}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

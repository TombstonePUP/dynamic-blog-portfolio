/**
 * Ghost-style stat strip: one bordered card, big numbers with small gray
 * labels, separated by hairline dividers.
 */
export default function OverviewStats({
  stats,
}: {
  stats: { label: string; value: number; accent?: boolean }[];
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-admin-text/6 rounded-lg border border-admin-text/8 bg-admin-surface sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="px-6 py-5">
          <p className="text-[13px] text-admin-muted">{stat.label}</p>
          <p
            className={`mt-1 text-2xl font-bold tracking-tight ${
              stat.accent ? "text-admin-success" : "text-admin-heading"
            }`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

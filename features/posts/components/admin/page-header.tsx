/**
 * Ghost-style content page header: 16px/600 title on the left, 32px-tall
 * actions (filter chips, primary button) on the right. Wraps below ~1000px.
 */
export default function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 lg:px-12">
      <h1 className="text-base font-semibold tracking-tight text-admin-heading">
        {title}
      </h1>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </header>
  );
}

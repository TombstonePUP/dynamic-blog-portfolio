import { ExternalLink, Folder } from "lucide-react";
import Link from "next/link";

export type StoryCardProps = {
  title: string;
  excerpt?: string | null;
  slug: string;
  status: string;
  date?: string;
};

export default function StoryCard({
  title,
  excerpt,
  slug,
  status,
  date,
}: StoryCardProps) {
  return (
    <Link
      href={`/editor?slug=${encodeURIComponent(slug)}`}
      className="group relative flex h-full flex-col justify-between border border-admin-surface-hover bg-admin-surface p-6 transition-colors hover:border-admin-accent/40"
    >
      <header>
        <div className="mb-8 flex items-start justify-between">
          <div className="text-admin-accent">
            <Folder size={40} strokeWidth={1} />
          </div>
          <div className="mt-1 text-admin-muted transition-colors group-hover:text-admin-heading">
            <ExternalLink size={20} strokeWidth={1.5} />
          </div>
        </div>

        <h3 className="mb-3 text-xl font-bold leading-tight text-admin-heading transition-colors group-hover:text-admin-accent">
          {title}
        </h3>

        <div className="line-clamp-3 text-sm leading-relaxed text-admin-text">
          <p>
            {excerpt ||
              "Open this story in the editor to continue refining it."}
          </p>
        </div>
      </header>

      <footer className="mt-8">
        <ul className="flex flex-wrap items-center gap-4 text-xs font-mono text-admin-muted">
          <li className="font-semibold uppercase tracking-wider text-admin-text">
            {status}
          </li>
          {date && (
            <li className="flex items-center gap-4">
              <span>&middot;</span>
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </li>
          )}
        </ul>
      </footer>
    </Link>
  );
}

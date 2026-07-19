"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  ChartNoAxesColumn,
  ChevronsUpDown,
  LogOut,
  PanelsTopLeft,
  PenLine,
  Plus,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  trailing?: React.ReactNode;
};

function NavItem({ href, icon, label, active, trailing }: NavItemProps) {
  return (
    <div className="group/item relative flex items-center">
      <Link
        href={href}
        className={`flex h-8 flex-1 items-center gap-2 rounded-md px-3 text-[13px] font-medium transition-colors ${
          active
            ? "bg-admin-surface-hover/70 text-admin-heading"
            : "text-admin-text hover:bg-admin-surface-hover/40 hover:text-admin-heading"
        }`}
      >
        <span className="shrink-0 [&>svg]:size-4">{icon}</span>
        <span className="truncate lg:inline hidden">{label}</span>
      </Link>
      {trailing}
    </div>
  );
}

function SubNavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`hidden h-8 items-center rounded-md py-1 pl-9 pr-3 text-[13px] transition-colors lg:flex ${
        active
          ? "font-medium text-admin-heading"
          : "text-admin-muted hover:text-admin-heading"
      }`}
    >
      {label}
    </Link>
  );
}

export default function AdminSidebar({
  siteName,
  userName,
  userEmail,
  isAdmin,
}: {
  siteName: string;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname?.startsWith("/editor")) {
    return null;
  }

  const isPosts = pathname?.startsWith("/posts");
  const filter = isPosts ? searchParams.get("status") : null;

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-admin-text/8 bg-admin-bg px-3 py-5 lg:w-[300px] lg:px-5">
      {/* Brand */}
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-3 px-1.5"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-admin-accent text-sm font-bold text-admin-contrast">
          {siteName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden truncate text-[15px] font-semibold text-admin-heading lg:inline">
          {siteName}
        </span>
      </Link>

      {/* Primary group */}
      <nav className="flex flex-col gap-0.5">
        <NavItem
          href="/dashboard"
          icon={<ChartNoAxesColumn />}
          label="Overview"
          active={pathname === "/dashboard"}
        />
        <NavItem
          href="/topics"
          icon={<PanelsTopLeft />}
          label="View site"
        />
      </nav>

      {/* Content group */}
      <nav className="mt-6 flex flex-col gap-0.5">
        <NavItem
          href="/posts"
          icon={<PenLine />}
          label="Stories"
          active={isPosts && !filter}
          trailing={
            <Link
              href="/editor"
              aria-label="Start a new story"
              className="absolute right-1.5 hidden rounded-md p-1 text-admin-muted opacity-0 transition-opacity hover:bg-admin-surface-hover hover:text-admin-heading group-hover/item:opacity-100 lg:block"
            >
              <Plus className="size-4" />
            </Link>
          }
        />
        {isPosts ? (
          <>
            <SubNavItem
              href="/posts?status=draft"
              label="Drafts"
              active={filter === "draft"}
            />
            <SubNavItem
              href="/posts?status=published"
              label="Published"
              active={filter === "published"}
            />
            <SubNavItem
              href="/posts?status=archived"
              label="Archived"
              active={filter === "archived"}
            />
          </>
        ) : null}
        {isAdmin ? (
          <NavItem
            href="/users"
            icon={<Users />}
            label="Users"
            active={pathname?.startsWith("/users")}
          />
        ) : null}
        <NavItem
          href="/profile"
          icon={<User />}
          label="Profile"
          active={pathname?.startsWith("/profile")}
        />
      </nav>

      <div className="flex-1" />

      {/* Footer */}
      <div className="flex flex-col gap-3">
        <div className="hidden px-1.5 lg:block">
          <ThemeToggle />
        </div>
        <details className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-3 rounded-md px-1.5 py-2 transition-colors hover:bg-admin-surface-hover/40">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-admin-text/10 bg-admin-surface text-xs font-semibold text-admin-heading">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden min-w-0 flex-1 lg:block">
              <span className="block truncate text-[13px] font-semibold text-admin-heading">
                {userName}
              </span>
              <span className="block truncate text-xs text-admin-muted">
                {userEmail}
              </span>
            </span>
            <ChevronsUpDown className="hidden size-3.5 shrink-0 text-admin-muted lg:block" />
          </summary>
          <div className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border border-admin-text/8 bg-admin-surface p-1.5 shadow-lg">
            <Link
              href="/profile"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-surface-hover/50 hover:text-admin-heading"
            >
              <User className="size-4" />
              Edit profile
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-surface-hover/50 hover:text-admin-heading"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </form>
          </div>
        </details>
      </div>
    </aside>
  );
}

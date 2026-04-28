"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminHeader({
  userName,
  userEmail,
  isAdmin,
}: {
  userName: string;
  userEmail: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith("/editor");
  const isDashboard = pathname === "/dashboard";
  const isPosts = pathname?.startsWith("/posts");
  const isUsers = pathname?.startsWith("/users");

  if (isEditor) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-admin-surface-hover bg-admin-bg">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-8">
        <nav className="flex items-center gap-6 text-sm font-medium text-admin-muted">
          <Link
            href="/dashboard"
            className={`transition-colors ${isDashboard ? "text-admin-accent" : "hover:text-admin-heading"}`}
          >
            Overview
          </Link>
          <Link
            href="/posts"
            className={`transition-colors ${isPosts ? "text-admin-accent" : "hover:text-admin-heading"}`}
          >
            Explorer
          </Link>
          {isAdmin ? (
            <Link
              href="/users"
              className={`transition-colors ${isUsers ? "text-admin-accent" : "hover:text-admin-heading"}`}
            >
              Users
            </Link>
          ) : null}
        </nav>

        <details className="relative">
          <summary className="list-none cursor-pointer">
            <span className="flex size-9 items-center justify-center border border-admin-surface-hover bg-admin-surface text-xs font-semibold text-admin-heading">
              {userName.charAt(0).toUpperCase()}
            </span>
          </summary>
          <div className="absolute right-0 mt-3 w-64 border border-admin-surface-hover bg-admin-surface p-4">
            <div className="space-y-1 mb-4">
              <p className="text-sm font-semibold text-admin-heading">
                {userName}
              </p>
              <p className="text-xs text-admin-muted">{userEmail}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/profile"
                className="flex w-full items-center gap-2 border border-admin-surface-hover px-3 py-2 text-sm font-semibold text-admin-text transition-colors hover:bg-admin-surface-hover hover:text-admin-heading"
              >
                <User className="size-4" />
                Edit Profile
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 border border-admin-surface-hover px-3 py-2 text-sm font-semibold text-admin-text transition-colors hover:bg-admin-surface-hover hover:text-admin-heading"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}

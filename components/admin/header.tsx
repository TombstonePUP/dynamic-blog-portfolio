"use client";

import { BellRing, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "./ui/separator";

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
  const isDashboard = pathname === "/dashboard";
  const isEditor = pathname?.startsWith("/editor");
  const isPosts = pathname?.startsWith("/posts");
  const isUsers = pathname?.startsWith("/users");

  if (isEditor) {
    return null;
  }

  return (
    <header className=" sticky top-0 z-50 border-b ">
      <div className="mx-auto flex max-w-7xl w-full items-center justify-between gap-6 px-8 py-3">
        <div className="flex items-center gap-4">

          <h1 className="text-sm font-bold tracking-tight shrink-0 hidden sm:block">
            {isEditor ? "Writing Environment" : "Admin Console"}
          </h1>

          <div className="h-4 w-px bg-admin-contrast/10 mx-2 hidden sm:block" />


        </div>

        <div className="flex items-center gap-2.5">
          <nav className="flex items-center gap-6 text-sm font-medium text-admin-text/60">
            <Link
              href="/dashboard"
              className={`transition ${isDashboard ? "text-admin-text font-semibold" : "hover:text-admin-text"}`}
            >
              Overview
            </Link>
            <Link
              href="/posts"
              className={`transition ${isPosts ? "text-admin-text font-semibold" : "hover:text-admin-text"}`}
            >
              Explorer
            </Link>
            {isAdmin ? (
              <Link
                href="/users"
                className={`transition ${isUsers ? "text-admin-text font-semibold" : "hover:text-admin-text"}`}
              >
                Users
              </Link>
            ) : null}
          </nav>
          <Separator orientation="vertical" className="mx-2" />
          <div className="rounded-full p-2 hover:bg-admin-contrast/5 cursor-pointer relative before:absolute before:left-1/2 before:z-10 before:w-1.5 before:h-1.5 before:rounded-full before:bg-red-500 before:top-2 text-admin-text/60 hover:text-admin-text transition">
            <BellRing className="size-4" />
          </div>
          <div className="ml-1 flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-admin-text">{userName}</p>
              <p className="text-[11px] text-admin-text/45">{userEmail}</p>
            </div>
            <div className="flex size-7 items-center justify-center rounded-full border border-[#72dbcc]/50 bg-[#72dbcc]/30 text-xs font-bold text-admin-text shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-full p-2 text-admin-text/60 transition hover:bg-admin-contrast/5 hover:text-admin-text"
                title="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

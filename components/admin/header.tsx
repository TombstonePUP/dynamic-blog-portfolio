"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard/";
  const isEditor = pathname === "/editor/";

  return (
    <header className="px-8 py-6 flex items-center justify-between bg-[#FAF9F6] border-b border-black/5">
      <div className="flex items-center gap-6">
        {!isDashboard ? (
          <Link
            href="/dashboard"
            className="group flex items-center justify-center size-10 bg-white shadow-sm ring-1 ring-black/5 hover:ring-primary/40 transition"
          >
            <ArrowLeft className="size-4 text-foreground/60 transition-transform group-hover:text-foreground" />
          </Link>
        ) : (
          <div className="size-10 bg-primary/10 flex items-center justify-center rounded-full text-primary ring-1 ring-primary/20">
            <span className="font-black text-sm">A</span>
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {isEditor ? "Writing Environment" : "Admin Dashboard"}
          </h1>
          <p className="text-xs text-foreground/40 font-medium">ADMIN CONSOLE</p>
        </div>
      </div>

      <nav className="flex items-center gap-8 text-sm font-semibold text-foreground/60">
        <Link
          href="/dashboard"
          className={`transition ${isDashboard ? "text-foreground" : "hover:text-foreground"}`}
        >
          Overview
        </Link>
        <Link
          href="/editor"
          className={`transition ${isEditor ? "text-foreground" : "hover:text-foreground"}`}
        >
          Writer
        </Link>
        <Link href="/topics" className="hover:text-foreground transition">Public Site</Link>
        <div className="size-8 rounded-full bg-[#72dbcc]/30 border border-[#72dbcc]/50" />
      </nav>
    </header>
  );
}

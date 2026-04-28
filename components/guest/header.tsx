"use client";

import SearchModal from "@/components/guest/search-modal";
import type { Blog } from "@/types/blog";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoIcon, LogoText } from "../app-logo";

const leftNav = [
  { label: "Featured", href: "#featured" },
  { label: "Topics", href: "/topics" },
];

const rightNav = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function GuestHeader({ blogs = [] }: { blogs?: Blog[] }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isCompact = scrolled || pathname.startsWith("/blog/");

  return (
    <>
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        blogs={blogs}
      />

      <header className="sticky top-0 z-50 w-full bg-[#FAF9F6]">
        <div
          className={`relative mx-auto flex w-full max-w-7xl items-start justify-between px-5 transition-all duration-300 ease-in-out md:px-24 ${isCompact ? "h-20 pt-7" : "md:h-40 md:pt-10"}`}
        >
          <LogoIcon className="size-8 md:hidden" />
          {/* LEFT NAV */}
          <nav className="hidden md:flex flex-1 gap-12 text-md transition-all duration-300 ease-in-out hover:text-foreground/80">
            {leftNav.map((link) => {
              const isHome = pathname === "/";
              const targetHref =
                link.href === "#featured" && !isHome ? "/#featured" : link.href;

              return targetHref.startsWith("#") ? (
                <a key={link.href} href={targetHref}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={targetHref}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* CENTER LOGO */}
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pt-1">
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden max-h-0 opacity-0 mb-0 ${isCompact ? "max-h-0 opacity-0 mb-0" : "md:max-h-20 md:opacity-100"}`}
            >
              <LogoIcon className="hidden md:block md:size-20" />
            </div>

            <LogoText className="text-lg leading-none" />
          </div>

          {/* RIGHT NAV (DESKTOP) */}
          <nav className="hidden md:flex flex-1 justify-end items-center gap-12 text-md transition-all duration-300 ease-in-out hover:text-foreground/80">
            {rightNav.map((link) =>
              link.href.startsWith("#") ? (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ),
            )}
            <button
              onClick={() => setSearchOpen(true)}
              className="h-fit hover:text-foreground/80 transition hover:bg-transparent focus:bg-transparent focus:outline-none cursor-pointer"
              aria-label="Open search"
            >
              <Search className="size-6" strokeWidth={2.3} />
            </button>
          </nav>

          {/* MOBILE CONTROLS */}
          <div className="flex flex-1 justify-end items-center gap-4 md:hidden z-50 relative">
            <button
              onClick={() => setSearchOpen(true)}
              className="h-fit hover:text-foreground/80 transition hover:bg-transparent focus:bg-transparent focus:outline-none cursor-pointer"
              aria-label="Open search"
            >
              <Search className="size-6" strokeWidth={2.3} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex flex-col gap-1 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="size-6" strokeWidth={2.3} />
              ) : (
                <Menu className="size-6" strokeWidth={2.3} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-40 bg-[#FAF9F6] px-5 pt-32 transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-8 text-3xl font-bold">
          {[...leftNav, ...rightNav].map((link) => {
            const isHome = pathname === "/";
            const targetHref =
              link.href === "#featured" && !isHome ? "/#featured" : link.href;

            return targetHref.startsWith("#") ? (
              <a
                key={link.href}
                href={targetHref}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-foreground/80 transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={targetHref}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-foreground/80 transition-colors"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

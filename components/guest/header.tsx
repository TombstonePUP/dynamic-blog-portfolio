"use client";

import SearchModal from "@/components/guest/search-modal";
import { Menu, Search } from "lucide-react";
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

function NavContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <nav
      className={`hidden md:flex gap-12 text-md transition-all duration-300 ease-in-out hover:text-foreground/80 ${className}`}
    >
      {children}
    </nav>
  );
}

export default function GuestHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header className="sticky top-0 z-50 w-full bg-[#FAF9F6]">
        <div
          className={`relative mx-auto flex w-full max-w-7xl items-start justify-between px-5 transition-all duration-300 ease-in-out md:px-24 ${scrolled ? "h-20 pt-7" : "h-40 pt-10"}`}
        >
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
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          >
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                scrolled
                  ? "max-h-0 opacity-0 mb-0"
                  : "max-h-20 opacity-100 mb-0.5"
              }`}
            >
              <LogoIcon className="size-20" />
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
          <div className="flex flex-1 justify-end items-center gap-4 md:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="h-fit hover:text-foreground/80 transition hover:bg-transparent focus:bg-transparent focus:outline-none cursor-pointer"
              aria-label="Open search"
            >
              <Search className="size-6" strokeWidth={2.3} />
            </button>
            <button className="flex flex-col gap-1 cursor-pointer">
              <Menu className="size-6" strokeWidth={2.3} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

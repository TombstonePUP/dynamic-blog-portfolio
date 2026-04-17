"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoIcon, LogoText } from "../app-logo";

const leftNav = [
  { label: "Featured", href: "#featured" },
  { label: "Topics", href: "/topics" },
  { label: "Personal", href: "/personal" },
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
      className={`hidden md:flex gap-12 text-lg transition-all duration-300 ease-in-out font-bold hover:text-foreground/80 ${className}`}
    >
      {children}
    </nav>
  );
}

export default function GuestHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF9F6]">
      <div
        className={`relative mx-auto flex max-w-7xl justify-center transition-all duration-300 ease-in-out ${scrolled ? "h-20" : "h-40"}`}
      >
        {/* LEFT NAV */}
        <NavContainer className={`${scrolled ? "pt-8" : "pt-14"}`}>
          {leftNav.map((link) =>
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
        </NavContainer>

        {/* CENTER LOGO */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center ${scrolled ? "top-9" : "top-8"}`}
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

        {/* RIGHT NAV */}
        <NavContainer className={`ml-120 ${scrolled ? "pt-8" : "pt-14"}`}>
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
          <button className="h-fit hover:text-foreground/80 transition hover:bg-transparent focus:bg-transparent focus:outline-none cursor-pointer">
            <Search className="size-6 " strokeWidth={2.3} />
          </button>

          <button className="md:hidden flex flex-col gap-1">
            <Menu />
          </button>
        </NavContainer>
      </div>
    </header>
  );
}

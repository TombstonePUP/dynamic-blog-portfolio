"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoIcon, LogoText } from "../app-logo";

const navLinks = [
  { label: "Featured", href: "#featured" },
  { label: "Topics", href: "/topics" },
  { label: "About", href: "/about" },
];

export default function GuestHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className={`relative mx-auto flex max-w-7xl justify-center transition-all duration-300 ease-in-out ${scrolled ? "h-20" : "h-40"}`}>
        {/* LEFT NAV */}
        <nav className={`hidden md:flex gap-12 text-base text-neutral-700 transition-all duration-300 ease-in-out ${scrolled ? "pt-8" : "pt-14"} `}>
          {navLinks.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.href} href={link.href} className="hover:text-black transition">
                {link.label}
              </a>
            ) : (
              <Link key={link.href} href={link.href} className="hover:text-black transition">
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* CENTER LOGO */}
        <div className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center ${scrolled ? "top-8" : "top-8"}`}>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${scrolled ? "max-h-0 opacity-0 mb-0" : "max-h-20 opacity-100 mb-0.5"
              }`}
          >
            <LogoIcon className="size-20" />
          </div>

          <LogoText className="text-lg leading-none" />
        </div>

        {/* RIGHT NAV */}
        <nav className={`ml-120 flex gap-12 transition-all duration-300 ease-in-out ${scrolled ? "pt-8" : "pt-14"} `}>
          <Link href="/contact" className="text-base text-neutral-700 hover:text-black transition">
            Personal
          </Link>
          <Link href="/contact" className="text-base text-neutral-700 hover:text-black transition">
            Contact
          </Link>
          <button
            className="h-fit text-sm text-neutral-700 hover:text-neutral-500 transition hover:bg-transparent focus:bg-transparent focus:outline-none cursor-pointer"
          >
            <Search />
          </button>

          <button className="md:hidden flex flex-col gap-1">
            <Menu/>
          </button>
        </nav>

      </div>
    </header>
  );
}
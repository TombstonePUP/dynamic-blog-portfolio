"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import SmoothScrollLink from "./smooth-scroll-link";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when page is scrolled down 400px
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <SmoothScrollLink
      target="top"
      className={`fixed bottom-8 right-8 z-50 flex size-12 cursor-pointer items-center justify-center border-2 border-foreground bg-background text-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-foreground hover:text-background ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      ariaLabel="Scroll to top"
    >
      <ChevronUp className="size-6" strokeWidth={2.5} />
    </SmoothScrollLink>
  );
}

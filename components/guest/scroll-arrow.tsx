"use client";

import { ChevronDown } from "lucide-react";
import SmoothScrollLink from "../smooth-scroll-link";

export default function ScrollArrow() {
  return (
    <SmoothScrollLink
      target="article-content"
      className="text-white/80 transition hover:text-white cursor-pointer"
      ariaLabel="Scroll to content"
    >
      <ChevronDown
        className="size-6 animate-bounce drop-shadow-md"
        strokeWidth={2}
      />
    </SmoothScrollLink>
  );
}

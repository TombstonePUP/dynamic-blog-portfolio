"use client";

import { ChevronDown } from "lucide-react";

export default function ScrollArrow() {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const target = document.getElementById("article-content");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="text-white/80 transition hover:text-white cursor-pointer"
      aria-label="Scroll to content"
    >
      <ChevronDown className="size-6 animate-bounce drop-shadow-md" strokeWidth={2} />
    </button>
  );
}

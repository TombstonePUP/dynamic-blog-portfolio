"use client";

import { ReactNode } from "react";

type SmoothScrollLinkProps = {
  target: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export default function SmoothScrollLink({
  target,
  children,
  className = "",
  ariaLabel,
  onClick,
}: SmoothScrollLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClick?.(e);

    // If target is "top", scroll to top
    if (target === "top") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    // Otherwise, scroll to element by id
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button onClick={handleClick} className={className} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

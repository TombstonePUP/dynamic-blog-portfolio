"use client";

export function Skeleton({ className }: { className?: string }) {
  return <div className={`rounded bg-white/10 ${className}`} />;
}

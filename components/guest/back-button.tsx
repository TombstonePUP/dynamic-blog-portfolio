"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 border-2 border-white/90 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/40 cursor-pointer"
    >
      <ArrowLeft className="size-4" strokeWidth={2.5} aria-hidden />
      Back
    </button>
  );
}

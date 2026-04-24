"use client";

import { Button } from "@/components/admin/ui/button";
import { Calendar, Folder, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type PostFolder = {
  slug: string;
  files: string[];
  date: string;
};

export default function ExplorerGrid({ initialFolders }: { initialFolders: PostFolder[] }) {
  const [activeDateFilter, setActiveDateFilter] = useState<string>("All");

  // Extract unique dates for pills (sort in reverse chronological if possible, but alphabetical is fine for string months)
  const availableDates = ["All", ...Array.from(new Set(initialFolders.map(f => f.date).filter(d => d !== "Unknown"))).sort()];

  const filteredFolders = activeDateFilter === "All"
    ? initialFolders
    : initialFolders.filter(f => f.date === activeDateFilter);

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-admin-text">Explorer</h1>
            <p className="text-admin-text/50 font-medium mt-2">Manage your blog post folders and assets.</p>
          </div>
        </div>
        <Button
          variant="outline"
        >
          <Link href="/editor" className="flex items-center justify-center gap-2">
            <Plus size={16} />
            New Story
          </Link>
        </Button>
      </div>

      {/* Date Pills Filter */}
      {availableDates.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b  scrollbar-hide">
          <Calendar className="size-4  mr-2 shrink-0" />
          {availableDates.map(date => (
            <button
              key={date}
              onClick={() => setActiveDateFilter(date)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition whitespace-nowrap ${activeDateFilter === date
                ? "bg-admin-text text-admin-inverse border"
                : "bg-admin-contrast/5 text-admin-text/60 hover:bg-admin-contrast/10 hover:text-admin-text"
                }`}
            >
              {date}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filteredFolders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-admin-text/20">
          <Folder className="size-16 mb-4 opacity-50" />
          <p className="font-bold uppercase tracking-widest">No folders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredFolders.map(folder => (
            <Link
              href={`/editor?slug=${folder.slug}`}
              key={folder.slug}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-admin-contrast/5 transition active:scale-95"
            >
              <div className="relative">
                <Folder className="size-20 text-admin-primary/40 group-hover:text-admin-primary transition-colors fill-admin-primary/10 group-hover:fill-admin-primary/20" strokeWidth={0.5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-2 py-0.5 rounded text-[9px] font-black uppercase text-admin-text/60 group-hover:text-admin-text">
                    {folder.files.length} {folder.files.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </div>
              <div className="text-center w-full">
                <p className="text-sm font-bold text-admin-text truncate w-full">{folder.slug}</p>
                {folder.date && folder.date !== "Unknown" && (
                  <p className="text-[10px]  uppercase font-bold tracking-widest mt-1">{folder.date}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

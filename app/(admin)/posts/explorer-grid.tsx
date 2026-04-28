"use client";

import StoryCard from "@/components/admin/story-card";
import {
  Calendar,
  FileEdit,
  Folder,
  Inbox,
  LayoutGrid,
  Plus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PostFolder = {
  slug: string;
  title: string;
  excerpt?: string | null;
  status: "draft" | "published" | "archived";
  date: string;
  updatedAt: string;
};

type FilterType = "all" | "draft" | "published" | "archived" | string;

export default function ExplorerGrid({
  initialFolders,
}: {
  initialFolders: PostFolder[];
}) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [filterMode, setFilterMode] = useState<"status" | "date">("status");
  const [selectedPost, setSelectedPost] = useState<PostFolder | null>(null);

  // Extract unique dates for pills (sort in reverse chronological if possible)
  const availableDates = Array.from(
    new Set(
      initialFolders.map((folder) =>
        new Date(folder.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        }),
      ),
    ),
  ).sort();

  const filteredFolders = initialFolders.filter((folder) => {
    if (activeFilter === "all") return true;

    if (filterMode === "status") {
      return folder.status === activeFilter;
    }

    if (filterMode === "date") {
      return (
        new Date(folder.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        }) === activeFilter
      );
    }

    return true;
  });

  return (
    <div className="flex w-full min-h-full">
      {/* Contextual Sidebar */}
      <div className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-admin-surface-hover bg-admin-surface">
        <div className="p-6 pb-2">
          <Link
            href="/editor"
            className="inline-flex w-full items-center justify-center gap-2 border border-admin-accent bg-admin-accent px-5 py-2 text-sm font-semibold text-admin-contrast transition-colors hover:bg-admin-accent/90 [&_svg]:size-4"
          >
            <Plus size={16} />
            <span>New Story</span>
          </Link>
        </div>

        <div className="flex-1 py-4 flex flex-col gap-6">
          {/* Library */}
          <div className="px-4">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-admin-muted">
              Library
            </p>
            <div className="flex flex-col gap-1">
              <SidebarItem
                icon={Inbox}
                label="All Stories"
                isActive={activeFilter === "all"}
                onClick={() => {
                  setActiveFilter("all");
                  setFilterMode("status");
                }}
                count={initialFolders.length}
              />
              <SidebarItem
                icon={FileEdit}
                label="Drafts"
                isActive={activeFilter === "draft"}
                onClick={() => {
                  setActiveFilter("draft");
                  setFilterMode("status");
                }}
                count={
                  initialFolders.filter((f) => f.status === "draft").length
                }
              />
              <SidebarItem
                icon={LayoutGrid}
                label="Published"
                isActive={activeFilter === "published"}
                onClick={() => {
                  setActiveFilter("published");
                  setFilterMode("status");
                }}
                count={
                  initialFolders.filter((f) => f.status === "published").length
                }
              />
              <SidebarItem
                icon={Folder}
                label="Archived"
                isActive={activeFilter === "archived"}
                onClick={() => {
                  setActiveFilter("archived");
                  setFilterMode("status");
                }}
                count={
                  initialFolders.filter((f) => f.status === "archived").length
                }
              />
            </div>
          </div>

          {/* Archives By Date */}
          {availableDates.length > 0 && (
            <div className="px-4">
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-admin-muted">
                Archives
              </p>
              <div className="flex flex-col gap-1">
                {availableDates.map((date) => (
                  <SidebarItem
                    key={date}
                    icon={Calendar}
                    label={date}
                    isActive={activeFilter === date}
                    onClick={() => {
                      setActiveFilter(date);
                      setFilterMode("date");
                    }}
                    count={
                      initialFolders.filter(
                        (f) =>
                          new Date(f.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                          }) === date,
                      ).length
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-admin-bg">
        {/* Top Header for Pane */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-admin-surface-hover bg-admin-bg px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-admin-heading capitalize">
              {activeFilter === "all" ? "All Stories" : activeFilter}
            </h1>
            <p className="mt-1 text-sm text-admin-muted">
              {filteredFolders.length} item{filteredFolders.length !== 1 && "s"}
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="p-8">
          {filteredFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-admin-muted/30">
              <Folder className="size-16 mb-4 opacity-50" />
              <p className="font-bold uppercase tracking-widest">
                No stories found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredFolders.map((folder) => (
                <div
                  key={folder.slug}
                  onClick={() => setSelectedPost(folder)}
                  onDoubleClick={() =>
                    router.push(
                      `/editor?slug=${encodeURIComponent(folder.slug)}`,
                    )
                  }
                  className={`cursor-pointer transition-all ${
                    selectedPost?.slug === folder.slug
                      ? "ring-2 ring-admin-accent"
                      : ""
                  }`}
                >
                  <div className="pointer-events-none h-full">
                    <StoryCard
                      title={folder.title}
                      excerpt={folder.excerpt}
                      slug={folder.slug}
                      status={folder.status}
                      date={folder.date}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Preview Panel */}
      {selectedPost && (
        <div className="w-96 shrink-0 border-l border-admin-surface-hover bg-admin-surface flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-admin-surface-hover bg-admin-surface px-6 py-4">
            <h2 className="text-lg font-bold text-admin-heading truncate">
              Preview
            </h2>
            <button
              onClick={() => setSelectedPost(null)}
              className="text-admin-muted hover:text-admin-heading transition-colors"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Title */}
            <h3 className="text-2xl font-bold text-admin-heading mb-4 leading-tight">
              {selectedPost.title}
            </h3>

            {/* Meta */}
            <div className="flex flex-col gap-4 text-xs font-mono text-admin-muted mb-6 pb-6 border-b border-admin-surface-hover">
              <div className="flex items-center gap-4">
                {selectedPost.updatedAt && (
                  <>
                    <span className="text-xs px-1 py-0.5 bg-admin-bg text-admin-muted rounded">
                      Updated{" "}
                      {new Date(selectedPost.updatedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </span>
                  </>
                )}
                {selectedPost.date && (
                  <>
                    <span>
                      {new Date(selectedPost.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </>
                )}
              </div>
              <span className="font-semibold uppercase tracking-wider text-admin-text">
                {selectedPost.status}
              </span>
            </div>

            {/* Excerpt */}
            {selectedPost.excerpt && (
              <p className="text-sm leading-relaxed text-admin-text mb-6">
                {selectedPost.excerpt}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href={`/editor?slug=${encodeURIComponent(selectedPost.slug)}`}
                className="block w-full text-center border border-admin-accent bg-admin-accent px-4 py-2 text-sm font-semibold text-admin-contrast transition-colors hover:bg-admin-accent/90"
              >
                Edit Story
              </Link>
              <Link
                href={`/blog/${selectedPost.slug}`}
                className="block w-full text-center border border-admin-surface-hover bg-transparent px-4 py-2 text-sm font-semibold text-admin-heading transition-colors hover:bg-admin-surface-hover"
              >
                View Published
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  count,
}: {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors ${
        isActive
          ? "bg-admin-surface text-admin-accent"
          : "text-admin-muted hover:bg-admin-surface hover:text-admin-heading"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={`size-4 ${isActive ? "text-admin-accent" : "text-admin-muted"}`}
        />
        <span className="truncate">{label}</span>
      </div>
      {count !== undefined && (
        <span
          className={`px-2 py-0.5 text-[11px] font-semibold ${isActive ? "bg-admin-accent text-admin-contrast" : "bg-admin-bg text-admin-muted"}`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

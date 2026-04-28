"use client";

import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FileEdit,
  FolderOpen,
  Info,
  Plus,
} from "lucide-react";

type BlogFolder = {
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  updatedAt: string;
};

interface EditorSidebarProps {
  width: number;
  showSidebar: boolean;
  blogFolders: BlogFolder[];
  activeSlug: string | null;
  expandedSlugs: Set<string>;
  onToggleExpand: (slug: string) => void;
  onLoadPost: (slug: string) => void;
  onNewDraft: () => void;
}

export default function EditorSidebar({
  width,
  showSidebar,
  blogFolders,
  activeSlug,
  expandedSlugs,
  onToggleExpand,
  onLoadPost,
  onNewDraft,
}: EditorSidebarProps) {
  return (
    <div
      className="min-h-full shrink-0 overflow-x-hidden overflow-y-auto border-r shadow-[inset_-10px_0_15px_-15px_rgba(0,0,0,0.1)] transition-all duration-75"
      style={{ width: showSidebar ? width : 0 }}
    >
      <div
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4"
        style={{ width }}
      >
        <div className="flex items-center justify-between px-1 text-[11px] font-black uppercase tracking-[0.2em] text-admin-text/60">
          <span>Post Explorer</span>
          <button
            onClick={onNewDraft}
            disabled={!activeSlug}
            className={`transition ${!activeSlug ? "cursor-not-allowed opacity-10" : "active:scale-95 hover:text-admin-primary"}`}
            title={!activeSlug ? "Already in a draft" : "New Post"}
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {!activeSlug ? <NewDraftPlaceholder /> : null}

          {blogFolders.map((folder) => (
            <FolderItem
              key={folder.slug}
              folder={folder}
              isExpanded={expandedSlugs.has(folder.slug)}
              isActive={activeSlug === folder.slug}
              onToggleExpand={onToggleExpand}
              onLoadPost={onLoadPost}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NewDraftPlaceholder() {
  return (
    <div className="mb-4 flex flex-col">
      <div className="bg-admin-primary/20 px-3 py-2.5 text-sm font-black text-admin-text shadow-sm ring-1 ring-admin-primary/30">
        <div className="flex items-center gap-3">
          <FileEdit
            size={16}
            strokeWidth={2.5}
            className="shrink-0 text-admin-primary"
          />
          <span className="truncate">unsaved-draft</span>
        </div>
      </div>

      <div className="mt-1 flex flex-col gap-1 border-l-2 border-admin-primary/20 pl-2">
        <div className="bg-admin-primary/10 px-4 py-2 text-[12px] font-black text-admin-text shadow-sm">
          <div className="flex items-center gap-2.5">
            <FileCode
              size={14}
              strokeWidth={2.5}
              className="text-admin-primary opacity-80"
            />
            <span className="truncate">index.mdx</span>
          </div>
        </div>

        <div className="mr-2 mt-2 flex flex-col gap-4 bg-admin-primary/5 p-4">
          <div className="flex items-start gap-2.5 text-[11px] font-bold leading-tight text-admin-text">
            <Info
              size={14}
              className="mt-0.5 shrink-0 text-admin-primary opacity-60"
            />
            <span>
              Set title, excerpt, tags, status, and image URLs directly in the
              frontmatter.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderItem({
  folder,
  isExpanded,
  isActive,
  onToggleExpand,
  onLoadPost,
}: {
  folder: BlogFolder;
  isExpanded: boolean;
  isActive: boolean;
  onToggleExpand: (slug: string) => void;
  onLoadPost: (slug: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <div
        className={`min-w-0 transition ${
          isActive
            ? "bg-admin-primary/10 shadow-sm ring-1 ring-admin-primary/5"
            : "hover:bg-admin-contrast/5"
        }`}
      >
        <button
          onClick={() => onToggleExpand(folder.slug)}
          className="flex w-full min-w-0 items-center gap-3 px-3 py-2.5 text-left text-[13px] font-bold text-admin-text"
        >
          {isExpanded ? (
            <ChevronDown
              size={14}
              strokeWidth={3}
              className="shrink-0 opacity-40"
            />
          ) : (
            <ChevronRight
              size={14}
              strokeWidth={3}
              className="shrink-0 opacity-40"
            />
          )}
          <FolderOpen
            size={16}
            strokeWidth={2.5}
            className={`shrink-0 ${isActive ? "text-admin-primary" : ""}`}
          />
          <span className="truncate">{folder.title}</span>
        </button>
      </div>

      {isExpanded ? (
        <div className="ml-6 mt-1 flex flex-col gap-0.5 border-l-2 pl-2">
          <button
            onClick={() => onLoadPost(folder.slug)}
            className="flex min-w-0 items-center gap-2.5 px-4 py-2 text-left text-[12px] font-semibold text-admin-text/60 transition hover:bg-admin-primary/5 hover:text-admin-text"
          >
            <FileCode size={14} strokeWidth={2.5} className="opacity-60" />
            <span className="truncate">index.mdx</span>
          </button>
          <div className="mt-1 px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-admin-text/45">
            {folder.status} · updated{" "}
            {new Date(folder.updatedAt).toLocaleDateString("en-US")}
          </div>
          <div className="px-4 pb-1 text-[11px] text-admin-text/45">
            {folder.slug}
          </div>
        </div>
      ) : null}
    </div>
  );
}

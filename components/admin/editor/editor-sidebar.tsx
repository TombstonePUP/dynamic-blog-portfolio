"use client";

import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FileEdit,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Info,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

type BlogFolder = {
  slug: string;
  files: string[];
};

interface EditorSidebarProps {
  width: number;
  showSidebar: boolean;
  blogFolders: BlogFolder[];
  activeSlug: string | null;
  expandedSlugs: Set<string>;
  previewAsset: { slug: string; filename: string; dataUrl: string } | null;
  initialContent: string;
  onToggleExpand: (slug: string) => void;
  onLoadPost: (slug: string) => void;
  onPreviewImage: (slug: string, filename: string) => void;
  onDeleteAsset: (slug: string, filename: string) => void;
  onNewDraft: () => void;
  onUploadToFolder: (slug: string) => void;
  isImage: (filename: string) => boolean;
}

export default function EditorSidebar({
  width,
  showSidebar,
  blogFolders,
  activeSlug,
  expandedSlugs,
  previewAsset,
  initialContent,
  onToggleExpand,
  onLoadPost,
  onPreviewImage,
  onDeleteAsset,
  onNewDraft,
  onUploadToFolder,
  isImage,
}: EditorSidebarProps) {
  return (
    <div
      className=" border-r transition-all duration-75 overflow-y-auto overflow-x-hidden min-h-full flex flex-col shrink-0 shadow-[inset_-10px_0_15px_-15px_rgba(0,0,0,0.1)]"
      style={{ width: showSidebar ? width : 0 }}
    >
      <div className="p-4 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0" style={{ width }}>
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-admin-text/60 px-1">
          <span>Post Explorer</span>
          <button
            onClick={onNewDraft}
            disabled={!activeSlug}
            className={`transition ${!activeSlug ? "opacity-10 cursor-not-allowed" : "hover:text-admin-primary active:scale-95"}`}
            title={!activeSlug ? "Already in a draft" : "New Post"}
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {/* VIRTUAL NEW DRAFT ITEM */}
          {!activeSlug && <NewDraftPlaceholder />}

          {blogFolders.map((folder) => {
            const isExpanded = expandedSlugs.has(folder.slug);
            const isActive = activeSlug === folder.slug;
            return (
              <FolderItem
                key={folder.slug}
                folder={folder}
                isExpanded={isExpanded}
                isActive={isActive}
                previewAsset={previewAsset}
                onToggleExpand={onToggleExpand}
                onLoadPost={onLoadPost}
                onPreviewImage={onPreviewImage}
                onDeleteAsset={onDeleteAsset}
                onUploadToFolder={onUploadToFolder}
                isImage={isImage}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function NewDraftPlaceholder() {
  return (
    <div className="flex flex-col mb-4">
      <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-black rounded bg-admin-primary/20 text-admin-text ring-1 ring-admin-primary/30 shadow-sm">
        <FileEdit size={16} strokeWidth={2.5} className="shrink-0 text-admin-primary" />
        <span className="truncate">unsaved-draft</span>
      </div>
      <div className="ml-6 mt-1 flex flex-col border-l-2 border-admin-primary/20 pl-2 gap-1">
        {/* Placeholder MDX */}
        <div className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-admin-text font-black bg-admin-primary/10 shadow-sm rounded-md">
          <FileCode size={14} strokeWidth={2.5} className="text-admin-primary opacity-80" />
          <span className="truncate">index.mdx</span>
        </div>

        {/* Placeholder Assets */}
        <div className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-admin-text/30 font-semibold italic">
          <ImageIcon size={14} strokeWidth={2.5} className="opacity-30" />
          <span className="truncate">cover.jpg (pending)</span>
        </div>

        <div className="p-4 bg-admin-primary/5 rounded-lg mt-2 mr-2 flex flex-col gap-4">
          <div className="relative aspect-video rounded-lg bg-admin-contrast/5 border border-dashed border-admin-contrast/10 flex items-center justify-center overflow-hidden">
            <ImageIcon className="size-8 text-admin-contrast/10" />
            <div className="absolute inset-0 bg-admin-primary/5 animate-pulse" />
            <span className="absolute bottom-2 right-2 text-[8px] font-black uppercase tracking-tighter text-admin-contrast/20">Thumbnail Placeholder</span>
          </div>
          <div className="flex items-start gap-2.5 text-[11px] text-admin-text font-bold leading-tight">
            <Info size={14} className="shrink-0 mt-0.5 text-admin-primary opacity-60" />
            <span>Save this post to enable actual image uploads.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FolderItemProps {
  folder: BlogFolder;
  isExpanded: boolean;
  isActive: boolean;
  previewAsset: { slug: string; filename: string; dataUrl: string } | null;
  onToggleExpand: (slug: string) => void;
  onLoadPost: (slug: string) => void;
  onPreviewImage: (slug: string, filename: string) => void;
  onDeleteAsset: (slug: string, filename: string) => void;
  onUploadToFolder: (slug: string) => void;
  isImage: (filename: string) => boolean;
}

function FolderItem({
  folder,
  isExpanded,
  isActive,
  previewAsset,
  onToggleExpand,
  onLoadPost,
  onPreviewImage,
  onDeleteAsset,
  onUploadToFolder,
  isImage,
}: FolderItemProps) {
  return (
    <div className="flex flex-col">
      <div className={`flex items-center group transition rounded-lg min-w-0 ${isActive ? "bg-admin-primary/10 shadow-sm ring-1 ring-admin-primary/5" : "hover:bg-admin-contrast/5"}`}>
        <button onClick={() => onToggleExpand(folder.slug)} className="flex flex-1 min-w-0 items-center gap-3 px-3 py-2.5 text-[13px] font-bold transition text-left text-admin-text">
          {isExpanded ? <ChevronDown size={14} strokeWidth={3} className="shrink-0 opacity-40" /> : <ChevronRight size={14} strokeWidth={3} className="shrink-0 opacity-40" />}
          <FolderOpen size={16} strokeWidth={2.5} className={`shrink-0 ${isActive ? "text-admin-primary" : ""}`} />
          <span className="truncate">{folder.slug}</span>
        </button>
        <button onClick={() => onUploadToFolder(folder.slug)} className="opacity-0 group-hover:opacity-100 p-2.5 transition text-admin-primary hover:scale-110 active:scale-95" title="Upload Image to this Folder">
          <Upload size={16} strokeWidth={3} />
        </button>
      </div>
      {isExpanded && (
        <div className="ml-6 mt-1 flex flex-col border-l-2 pl-2 gap-0.5">
          {folder.files.map(file => {
            const isMdx = file === "index.mdx";
            const isCurrentlyPreviewing = previewAsset?.slug === folder.slug && previewAsset?.filename === file;
            return (
              <div key={file} className="group relative flex items-center min-w-0">
                <button onClick={() => { if (isMdx) onLoadPost(folder.slug); else if (isImage(file)) onPreviewImage(folder.slug, file); }}
                  className={`flex-1 min-w-0 flex items-center gap-2.5 px-4 py-2 text-[12px] transition text-left rounded-md ${isCurrentlyPreviewing ? "text-admin-text font-black bg-admin-primary/10 shadow-sm" : "text-admin-text/60 font-semibold hover:bg-admin-primary/5 hover:text-admin-text"}`}>
                  <div className="shrink-0">
                    {isMdx ? <FileCode size={14} strokeWidth={2.5} className={isCurrentlyPreviewing ? "text-admin-primary opacity-80" : "opacity-60"} /> : isImage(file) ? <ImageIcon size={14} strokeWidth={2.5} className={isCurrentlyPreviewing ? "text-admin-primary opacity-80" : "opacity-60"} /> : <FileText size={14} strokeWidth={2.5} className={isCurrentlyPreviewing ? "text-admin-primary opacity-80" : "opacity-60"} />}
                  </div>
                  <span className="truncate pr-6">{file}</span>
                </button>
                {!isMdx && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteAsset(folder.slug, file); }}
                    className="absolute right-1.5 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-600 transition rounded text-admin-text/20"
                    title="Delete File"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
          <button
            onClick={() => onUploadToFolder(folder.slug)}
            className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-admin-primary hover:bg-admin-primary/5 transition uppercase tracking-[0.1em] mt-1 rounded-md"
          >
            <Plus size={12} strokeWidth={3} />
            Add Image
          </button>
        </div>
      )}
    </div>
  );
}

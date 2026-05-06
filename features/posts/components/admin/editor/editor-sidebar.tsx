"use client";

import {
  ChevronDown,
  ChevronRight,
  FileCode,
  FileEdit,
  FolderOpen,
  Info,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Folder,
  UploadCloud,
  FileText
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { getBlogAssetsAction } from "@/app/actions/blog-actions";
import { createClient } from "@/db/supabase/client";

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
  onDeletePost: (slug: string) => void;
  onPreviewAsset: (asset: { slug: string; filename: string; dataUrl: string } | null) => void;
  onInsertAsset: (path: string) => void;
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
  onDeletePost,
  onPreviewAsset,
  onInsertAsset,
}: EditorSidebarProps) {
  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-admin-text/5 bg-admin-surface/80 shadow-xl transition-all duration-75 ${showSidebar ? "w-full md:w-auto" : "hidden md:block w-0 border-transparent shadow-none"}`}
      style={showSidebar ? { flexBasis: `var(--sidebar-width, ${width}px)` } : { width: 0 }}
    >
      <style>{`@media (max-width: 768px) { .responsive-sidebar-inner { width: 100% !important; } }`}</style>
      <div
        className="responsive-sidebar-inner flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-5"
        style={{ width: `var(--sidebar-width, ${width}px)` }}
      >
        <div className="flex items-center justify-between px-1 text-[10px] font-black uppercase tracking-[0.2em] text-admin-primary/60">
          <span>Explorer</span>
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
              onDeletePost={onDeletePost}
              onPreviewAsset={onPreviewAsset}
              onInsertAsset={onInsertAsset}
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
      <div className="bg-admin-accent text-admin-contrast px-3 py-2.5 text-sm font-black shadow-sm ring-1 ring-admin-accent/10">
        <div className="flex items-center gap-3">
          <FileEdit
            size={16}
            strokeWidth={2.5}
            className="shrink-0"
          />
          <span className="truncate">unsaved-draft</span>
        </div>
      </div>

      <div className="mt-1 flex flex-col gap-1 border-l-2 border-admin-accent/20 pl-2">
        <div className="bg-admin-surface px-4 py-2 text-[12px] font-black text-admin-heading shadow-sm border border-admin-text/5">
          <div className="flex items-center gap-2.5">
            <FileCode
              size={14}
              strokeWidth={2.5}
              className="text-admin-primary opacity-80"
            />
            <span className="truncate">index.mdx</span>
          </div>
        </div>

        <div className="mr-2 mt-2 flex flex-col gap-4 bg-admin-bg/50 border border-admin-text/5 p-4">
          <div className="flex items-start gap-2.5 text-[11px] font-bold leading-tight text-admin-text/60">
            <Info
              size={14}
              className="mt-0.5 shrink-0 text-admin-primary/40"
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
  onDeletePost,
  onPreviewAsset,
  onInsertAsset,
}: {
  folder: BlogFolder;
  isExpanded: boolean;
  isActive: boolean;
  onToggleExpand: (slug: string) => void;
  onLoadPost: (slug: string) => void;
  onDeletePost: (slug: string) => void;
  onPreviewAsset: (asset: { slug: string; filename: string; dataUrl: string } | null) => void;
  onInsertAsset: (path: string) => void;
}) {
  const [assets, setAssets] = useState<{ name: string, id: string | null }[]>([]);
  const [isLoadingAssets, startTransition] = useTransition();
  const [hasFetched, setHasFetched] = useState(false);
  const [isAssetsExpanded, setIsAssetsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const fetchAssets = useCallback(() => {
    startTransition(async () => {
      const res = await getBlogAssetsAction(folder.slug);
      if (res.success && res.assets) {
        setAssets(res.assets);
      }
      setHasFetched(true);
    });
  }, [folder.slug, startTransition]);

  useEffect(() => {
    if (isExpanded && !hasFetched) {
      fetchAssets();
    }
  }, [fetchAssets, hasFetched, isExpanded]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    const { error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_POST_ASSETS_BUCKET || "post-assets")
      .upload(`${folder.slug}/${filename}`, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      alert(`Upload failed: ${error.message}`);
    } else {
      fetchAssets();
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getPublicUrl = (filename: string) => {
    const { data } = supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_POST_ASSETS_BUCKET || "post-assets")
      .getPublicUrl(`${folder.slug}/${filename}`);
    return data.publicUrl;
  };

  return (
    <div className="flex flex-col group/folder">
      <div
        className={`min-w-0 transition-all flex items-center justify-between rounded-lg ${isActive
            ? "bg-admin-accent text-admin-contrast shadow-sm"
            : "hover:bg-admin-surface-hover text-admin-text/70 hover:text-admin-heading"
          }`}
      >
        <button
          onClick={() => onToggleExpand(folder.slug)}
          className="flex flex-1 min-w-0 items-center gap-3 px-3 py-2.5 text-left text-[13px] font-bold"
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
            className={`shrink-0 ${isActive ? "text-admin-contrast" : "text-admin-primary/60"}`}
          />
          <span className="truncate">{folder.title}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeletePost(folder.slug);
          }}
          className="p-1.5 mr-2 opacity-0 group-hover/folder:opacity-100 transition hover:text-admin-danger"
          title="Delete Story"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {isExpanded ? (
        <div className="ml-6 mt-1 flex flex-col gap-0.5 border-l border-admin-text/10 pl-2">
          <button
            onClick={() => onLoadPost(folder.slug)}
            className={`flex min-w-0 items-center gap-2.5 px-4 py-2 text-left text-[12px] font-bold transition rounded-md ${isActive ? "bg-admin-accent/5 text-admin-primary shadow-sm ring-1 ring-admin-accent/10" : "text-admin-text/50 hover:bg-admin-surface-hover hover:text-admin-heading"}`}
          >
            <FileText size={14} strokeWidth={2.5} className={isActive ? "text-admin-primary" : "opacity-40"} />
            <span className="truncate">index.mdx</span>
          </button>

          <div className="flex flex-col">
            <button
              onClick={() => setIsAssetsExpanded(!isAssetsExpanded)}
              className="flex min-w-0 items-center gap-2.5 px-4 py-2 text-left text-[12px] font-semibold text-admin-text/60 transition hover:bg-admin-primary/5 hover:text-admin-text"
            >
              {isAssetsExpanded ? (
                <ChevronDown size={12} strokeWidth={3} className="shrink-0 opacity-40" />
              ) : (
                <ChevronRight size={12} strokeWidth={3} className="shrink-0 opacity-40" />
              )}
              <Folder size={14} strokeWidth={2.5} className="opacity-60" />
              <span className="truncate">assets</span>
            </button>

            {isAssetsExpanded && (
              <div className="ml-4 flex flex-col gap-0.5 border-l pl-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-admin-primary hover:bg-admin-primary/5 transition disabled:opacity-50"
                >
                  {isUploading ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={14} />}
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

                {isLoadingAssets ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 text-[11px] text-admin-text/40">
                    <Loader2 size={12} className="animate-spin" /> Loading...
                  </div>
                ) : assets.map(asset => (
                  <div key={asset.id} className="group/asset flex items-center justify-between min-w-0 pr-2 hover:bg-admin-primary/5">
                    <button
                      onClick={() => onPreviewAsset({ slug: folder.slug, filename: asset.name, dataUrl: getPublicUrl(asset.name) })}
                      className="flex-1 flex min-w-0 items-center gap-2.5 px-4 py-1.5 text-left text-[11px] font-semibold text-admin-text/50 hover:text-admin-text truncate"
                    >
                      <ImageIcon size={12} strokeWidth={2.5} className="opacity-40" />
                      <span className="truncate">{asset.name}</span>
                    </button>
                    <button
                      onClick={() => onInsertAsset(`./assets/${asset.name}`)}
                      className="opacity-0 group-hover/asset:opacity-100 p-1 text-admin-primary hover:bg-admin-primary/10 transition"
                      title="Insert into editor"
                    >
                      <Plus size={12} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-2 px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-admin-text/45">
            {folder.status} · updated{" "}
            {new Date(folder.updatedAt).toLocaleDateString("en-US")}
          </div>
          <div className="px-4 pb-1 text-[11px] text-admin-text/45 truncate">
            {folder.slug}
          </div>
        </div>
      ) : null}
    </div>
  );
}

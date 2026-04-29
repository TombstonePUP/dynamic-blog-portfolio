"use client";

import {
  ArrowLeft,
  ExternalLink,
  FileEdit,
  FileText,
  FolderInput,
  Loader2,
  Maximize2,
  Save,
} from "lucide-react";
import { Button } from "../ui/button";

interface EditorToolbarProps {
  showSidebar: boolean;
  onToggleSidebar: () => void;
  isSplit: boolean;
  onToggleSplit: () => void;
  activeSlug: string | null;
  isDirty: boolean;
  isSaving: boolean;
  isUploading: boolean;
  isPending: boolean;
  onSave: () => void;
  onRename: () => void;
  getLiveUrl: () => string;
}

export default function EditorToolbar({
  showSidebar,
  onToggleSidebar,
  isSplit,
  onToggleSplit,
  activeSlug,
  isDirty,
  isSaving,
  isUploading,
  isPending,
  onSave,
  onRename,
  getLiveUrl,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b  ">
      <div className="flex items-center gap-4">
        <a
          href="/posts"
          className="p-1.5 hover:bg-admin-contrast/5 transition hover:text-admin-text"
          title="Back to Explorer"
        >
          <ArrowLeft size={16} />
        </a>
        <div className="w-px h-4 bg-admin-contrast/10" />
        <button
          onClick={onToggleSidebar}
          className="p-1.5 hover:bg-admin-contrast/5 transition "
        >
          <FolderInput
            size={16}
            className={showSidebar ? "opacity-40" : "opacity-100"}
          />
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-admin-contrast/5 text-xs font-bold uppercase tracking-wider text-admin-text/60">
          <FileText className="size-3" /> Editor
        </div>
        <span className="text-xs text-admin-text/30">/</span>
        <span className="text-xs font-medium text-admin-text/50 italic">
          {activeSlug ? `Editing: ${activeSlug}` : "New Draft"}
        </span>
        {(isUploading || isPending) && (
          <Loader2 className="size-3 animate-spin text-admin-primary" />
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSplit}
          className={`p-2 transition ${isSplit ? "bg-admin-contrast/5 text-admin-text" : " hover:bg-admin-contrast/5"}`}
        >
          <Maximize2 className="size-4" />
        </button>
        <div className="w-px h-4 bg-admin-contrast/10 mx-1" />

        {activeSlug && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRename}>
              <FileEdit size={14} className="opacity-40" />
              Rename
            </Button>
            <a
              href={getLiveUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-admin-text/60 hover:text-admin-text px-4 py-1.5 transition text-xs font-bold uppercase tracking-widest border shadow-sm hover:shadow-md active:scale-95"
            >
              <ExternalLink size={14} className="opacity-40" />
              View Saved Post
            </a>
          </div>
        )}

        <Button
          variant="default"
          onClick={onSave}
          disabled={isSaving || !isDirty}
          isLoading={isSaving}
        >
          {!isSaving && <Save className="size-3" />}
          {activeSlug ? (isDirty ? "Save Changes" : "Saved") : "Create Post"}
        </Button>
      </div>
    </div>
  );
}

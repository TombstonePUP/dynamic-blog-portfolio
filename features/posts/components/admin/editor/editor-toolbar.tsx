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
import Link from "next/link";
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
    <div className="border-b border-admin-text/5 bg-admin-surface/80 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden w-full md:w-auto">
        <Link
          href="/posts"
          className="group rounded-full border border-admin-text/10 bg-admin-surface p-2 transition hover:border-admin-text/20 hover:bg-admin-surface-hover hover:text-admin-heading shrink-0 shadow-sm"
          title="Back to Explorer"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition"
          />
        </Link>
            <div className="w-px h-4 bg-admin-text/10 shrink-0" />
        <button
          onClick={onToggleSidebar}
          className="hidden shrink-0 rounded-full border border-admin-text/10 bg-admin-surface p-2 transition hover:bg-admin-surface-hover md:block shadow-sm"
        >
          <FolderInput
            size={16}
            className={showSidebar ? "text-admin-primary" : "opacity-40"}
          />
        </button>
            <div className="flex items-center gap-2 rounded-full border border-admin-text/5 bg-admin-bg/80 px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-[0.16em] text-admin-primary/70 shrink-0">
              <FileText className="size-3" />
              <span className="hidden xs:inline">Live Editor</span>
            </div>
            <span className="hidden xs:inline text-xs text-admin-text/20 shrink-0">/</span>
            <span className="truncate text-[11px] md:text-sm font-bold text-admin-heading/70">
              {activeSlug ? activeSlug : "Unsaved draft"}
            </span>
            {(isUploading || isPending) && (
              <Loader2 className="size-3 animate-spin text-admin-primary shrink-0" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase font-black tracking-widest">
            <span className="rounded-full bg-admin-surface/50 px-3 py-1.5 ring-1 ring-admin-text/5 text-admin-text/40">
              Workspace
            </span>
            <span className="rounded-full bg-admin-surface/50 px-3 py-1.5 ring-1 ring-admin-text/5 text-admin-text/40">
              {isSplit ? "Split view" : "Single pane"}
            </span>
            <span
              className={`rounded-full px-3 py-1.5 ring-1 ${
                isDirty
                  ? "bg-admin-danger/5 text-admin-danger ring-admin-danger/10"
                  : "bg-admin-success/5 text-admin-success ring-admin-success/10"
              }`}
            >
              {isDirty ? "Unsaved" : "Synced"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 md:pb-0">
        <button
          onClick={onToggleSplit}
          className={`hidden rounded-full border border-admin-text/10 p-2 transition md:block shrink-0 shadow-sm ${isSplit ? "bg-admin-accent text-admin-contrast" : "bg-admin-surface hover:bg-admin-surface-hover"}`}
        >
          <Maximize2 className="size-4" />
        </button>
          <div className="hidden md:block w-px h-4 bg-admin-text/10 mx-1 shrink-0" />

        {activeSlug && (
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onRename}>
              <FileEdit size={14} />
              <span className="hidden xs:inline">Rename</span>
            </Button>
            <a
              href={getLiveUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-admin-text/10 bg-admin-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-admin-text shadow-sm transition hover:bg-admin-surface-hover hover:text-admin-heading hover:shadow-md active:scale-95 md:px-4 md:py-2 md:text-xs"
            >
              <ExternalLink size={14} />
              <span className="hidden xs:inline">View Live Post</span>
              <span className="xs:hidden">View</span>
            </a>
          </div>
        )}

        <Button
          variant="default"
          onClick={onSave}
          disabled={isSaving || !isDirty}
          isLoading={isSaving}
          className="shrink-0 rounded-full shadow-sm"
        >
          {!isSaving && <Save className="size-3" />}
          {activeSlug ? (isDirty ? "Save Changes" : "Saved") : "Create Post"}
        </Button>
        </div>
      </div>
    </div>
  );
}

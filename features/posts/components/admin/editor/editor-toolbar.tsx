"use client";

import {
  ChevronLeft,
  Code,
  ExternalLink,
  FileEdit,
  Loader2,
  PanelLeft,
  PanelRight,
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
  editorMode: "form" | "raw";
  onSwitchEditorMode: (mode: "form" | "raw") => void;
}

const iconButton = (active?: boolean) =>
  `hidden shrink-0 rounded-md border p-1.5 transition-colors md:block ${
    active
      ? "border-admin-accent/30 bg-admin-accent/8 text-admin-heading"
      : "border-admin-text/10 text-admin-muted hover:bg-admin-surface-hover/40 hover:text-admin-heading"
  }`;

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
  editorMode,
  onSwitchEditorMode,
}: EditorToolbarProps) {
  return (
    <div className="border-b border-admin-text/6 bg-admin-surface px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          <Link
            href="/posts"
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-admin-heading transition-colors hover:text-admin-accent"
          >
            <ChevronLeft className="size-4" />
            Stories
          </Link>
          <span className="truncate text-sm text-admin-muted">
            {activeSlug || "New"}
            {isDirty ? " – unsaved changes" : ""}
          </span>
          {(isUploading || isPending) && (
            <Loader2 className="size-3.5 shrink-0 animate-spin text-admin-accent" />
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={onToggleSidebar}
            className={iconButton(showSidebar)}
            title="Toggle story explorer"
          >
            <PanelLeft className="size-4" />
          </button>
          <button
            onClick={onToggleSplit}
            className={iconButton(isSplit)}
            title="Toggle preview"
          >
            <PanelRight className="size-4" />
          </button>
          <button
            onClick={() =>
              onSwitchEditorMode(editorMode === "form" ? "raw" : "form")
            }
            className={`flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors ${
              editorMode === "raw"
                ? "border-admin-accent/30 bg-admin-accent/8 text-admin-heading"
                : "border-admin-text/10 text-admin-text hover:bg-admin-surface-hover/40 hover:text-admin-heading"
            }`}
          >
            <Code className="size-3.5" />
            {editorMode === "raw" ? "Raw MDX" : "Raw MDX"}
          </button>

          {activeSlug && (
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm" onClick={onRename}>
                <FileEdit size={14} />
                <span className="hidden xs:inline">Rename</span>
              </Button>
              <a
                href={getLiveUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-admin-text/10 px-3 py-1.5 text-[13px] font-medium text-admin-text transition-colors hover:bg-admin-surface-hover/40 hover:text-admin-heading"
              >
                <ExternalLink size={14} />
                <span className="hidden xs:inline">View</span>
              </a>
            </div>
          )}

          <Button
            variant="default"
            onClick={onSave}
            disabled={isSaving || (!!activeSlug && !isDirty)}
            isLoading={isSaving}
            className="shrink-0 rounded-md"
          >
            {!isSaving && <Save className="size-3" />}
            {activeSlug ? (isDirty ? "Save" : "Saved") : "Create story"}
          </Button>
        </div>
      </div>
    </div>
  );
}

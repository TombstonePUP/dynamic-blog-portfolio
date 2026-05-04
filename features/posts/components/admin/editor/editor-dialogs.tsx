"use client";

import { FileEdit, Plus, Trash2, Type } from "lucide-react";
import Modal from "../modal";
import { Button } from "../ui/button";

interface EditorDialogsProps {
  // New Post Dialog
  isNewPostOpen: boolean;
  onCloseNewPost: () => void;
  newPostSlug: string;
  onNewPostSlugChange: (value: string) => void;
  onConfirmNewPost: () => void;

  // Rename Dialog
  isRenameOpen: boolean;
  onCloseRename: () => void;
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  onConfirmRename: () => void;
  activeSlug: string | null;

  // Delete Dialog
  deleteTarget: { slug: string; filename: string } | null;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
}

export default function EditorDialogs({
  isNewPostOpen,
  onCloseNewPost,
  newPostSlug,
  onNewPostSlugChange,
  onConfirmNewPost,
  isRenameOpen,
  onCloseRename,
  renameValue,
  onRenameValueChange,
  onConfirmRename,
  activeSlug,
  deleteTarget,
  onCloseDelete,
  onConfirmDelete,
}: EditorDialogsProps) {
  return (
    <>
      {/* NEW POST DIALOG */}
      <Modal
        isOpen={isNewPostOpen}
        onClose={onCloseNewPost}
        title="Create or Find Story"
        description="Enter a slug to start a new post or open an existing one."
        icon={<Plus size={20} />}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={onCloseNewPost}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={onConfirmNewPost}
              disabled={!newPostSlug.trim()}
            >
              Go to Story
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest  px-1">Post Slug</label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-admin-text/20" />
              <input
                autoFocus
                type="text"
                value={newPostSlug}
                onChange={(e) => onNewPostSlugChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onConfirmNewPost()}
                placeholder="e.g. why-positivity-matters"
                className="w-full bg-admin-contrast/5 border-none px-10 py-4 text-sm font-medium focus:ring-2 focus:ring-admin-primary/40 focus:transition-all outline-none"
              />
            </div>
            <p className="text-[10px] text-admin-text/30 px-1 italic">Note: If this slug already exists, we will jump to that post.</p>
          </div>
        </div>
      </Modal>

      {/* RENAME SLUG DIALOG */}
      <Modal
        isOpen={isRenameOpen}
        onClose={onCloseRename}
        title="Rename Story Slug"
        description="Changing the slug will change the post's URL."
        icon={<FileEdit size={20} />}
        variant="warning"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={onCloseRename}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={onConfirmRename}
              disabled={!renameValue.trim() || renameValue === activeSlug}
            >
              Rename Slug
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest  px-1">New Slug</label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-admin-text/20" />
              <input
                autoFocus
                type="text"
                value={renameValue}
                onChange={(e) => onRenameValueChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onConfirmRename()}
                placeholder="e.g. why-positivity-matters"
                className="w-full bg-admin-contrast/5 border-none px-10 py-4 text-sm font-medium focus:ring-2 focus:ring-admin-primary/40 focus:transition-all outline-none"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE ASSET DIALOG */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={onCloseDelete}
        title="Delete File"
        description={`Are you sure you want to delete "${deleteTarget?.filename}"? This action cannot be undone.`}
        icon={<Trash2 size={20} />}
        variant="danger"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={onCloseDelete}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onConfirmDelete}
            >
              Delete Permanently
            </Button>
          </>
        }
      />
    </>
  );
}

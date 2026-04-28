"use client";

import {
  getBlogContentAction,
  getBlogListAction,
  renameBlogSlugAction,
  saveBlogContentAction,
} from "@/app/actions/blog-actions";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import EditorDialogs from "./editor/editor-dialogs";
import EditorFooter from "./editor/editor-footer";
import EditorInput from "./editor/editor-input";
import EditorPreview from "./editor/editor-preview";
import EditorSidebar from "./editor/editor-sidebar";
import EditorToolbar from "./editor/editor-toolbar";
import { renderMarkdownToHtml } from "./editor/markdown-renderer";
import ResizeHandle from "./editor/resize-handle";

type BlogFolder = {
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  updatedAt: string;
};

export default function MdxEditor({
  initialContent = "",
  initialBlogFolders = [],
  initialBlogContents = {},
}: {
  initialContent?: string;
  initialBlogFolders?: BlogFolder[];
  initialBlogContents?: Record<string, string>;
}) {
  const searchParams = useSearchParams();
  const initialActiveSlug = searchParams.get("slug");
  const [content, setContent] = useState(initialContent);
  const [lastSavedContent, setLastSavedContent] = useState(initialContent);
  const [activeSlug, setActiveSlug] = useState<string | null>(
    initialActiveSlug || null,
  );
  const [blogFolders, setBlogFolders] =
    useState<BlogFolder[]>(initialBlogFolders);
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(
    new Set(initialActiveSlug ? [initialActiveSlug] : []),
  );
  const [previewHtml, setPreviewHtml] = useState<string>("");

  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSplit, setIsSplit] = useState(true);

  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [editorWidth, setEditorWidth] = useState(600);
  const isResizingSidebar = useRef(false);
  const isResizingEditor = useRef(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPostSlug, setNewPostSlug] = useState("");
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const isDirty = content !== lastSavedContent;

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isResizingSidebar.current) {
        setSidebarWidth(Math.max(200, Math.min(500, event.clientX)));
      }

      if (isResizingEditor.current) {
        const currentSidebarWidth = showSidebar ? sidebarWidth : 0;
        setEditorWidth(Math.max(300, event.clientX - currentSidebarWidth));
      }
    },
    [showSidebar, sidebarWidth],
  );

  const stopResizing = useCallback(
    function handleStopResizing() {
      isResizingSidebar.current = false;
      isResizingEditor.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleStopResizing);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    },
    [handleMouseMove],
  );

  const startResizingSidebar = useCallback(() => {
    isResizingSidebar.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [handleMouseMove, stopResizing]);

  const startResizingEditor = useCallback(() => {
    isResizingEditor.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [handleMouseMove, stopResizing]);

  async function refreshList() {
    const result = await getBlogListAction();
    if (result.success) {
      setBlogFolders(result.list || []);
    }
  }

  useEffect(() => {
    void refreshList();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewHtml(renderMarkdownToHtml(content));
    }, 300);

    return () => clearTimeout(timer);
  }, [content]);

  const handleLoadPost = useCallback(
    async (slug: string) => {
      startTransition(async () => {
        if (initialBlogContents[slug]) {
          setContent(initialBlogContents[slug]);
          setLastSavedContent(initialBlogContents[slug]);
          setActiveSlug(slug);
          setExpandedSlugs((previous) => new Set(previous).add(slug));
          return;
        }

        const result = await getBlogContentAction(slug);
        if (result.success) {
          setContent(result.content || "");
          setLastSavedContent(result.content || "");
          setActiveSlug(slug);
          setExpandedSlugs((previous) => {
            const next = new Set(previous);
            next.add(slug);
            return next;
          });
        }
      });
    },
    [initialBlogContents],
  );

  useEffect(() => {
    if (initialActiveSlug) {
      void handleLoadPost(initialActiveSlug);
    }
  }, [initialActiveSlug, handleLoadPost]);

  function toggleExpand(slug: string) {
    const next = new Set(expandedSlugs);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    setExpandedSlugs(next);
  }

  async function save(slug: string) {
    setIsSaving(true);
    const result = await saveBlogContentAction(slug, content);

    if (result.success) {
      const nextSlug = result.slug || slug;
      setActiveSlug(nextSlug);
      setLastSavedContent(result.content || content);
      await refreshList();
    } else {
      alert(result.error || "Failed to save story");
    }

    setIsSaving(false);
  }

  function handleSave() {
    if (!activeSlug) {
      setNewPostSlug("");
      setIsDialogOpen(true);
      return;
    }

    void save(activeSlug);
  }

  function confirmNewPost() {
    if (!newPostSlug.trim()) {
      return;
    }

    const slug = newPostSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      return;
    }

    const existing = blogFolders.find((folder) => folder.slug === slug);

    if (existing) {
      void handleLoadPost(slug);
    } else {
      setActiveSlug(slug);
      void save(slug);
    }

    setIsDialogOpen(false);
    setNewPostSlug("");
  }

  async function confirmRenameSlug() {
    if (!activeSlug || !renameValue.trim() || renameValue === activeSlug) {
      setIsRenameDialogOpen(false);
      return;
    }

    const newSlug = renameValue
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!newSlug || newSlug === activeSlug) {
      setIsRenameDialogOpen(false);
      return;
    }

    setIsSaving(true);
    const result = await renameBlogSlugAction(activeSlug, newSlug);

    if (result.success) {
      setActiveSlug(result.slug || newSlug);
      await refreshList();
    } else {
      alert(result.error || "Failed to rename slug");
    }

    setIsSaving(false);
    setIsRenameDialogOpen(false);
  }

  function getLiveUrl() {
    if (!activeSlug) {
      return "#";
    }

    return `/blog/${activeSlug}`;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden font-sans shadow-2xl ring-1 select-none">
      <EditorDialogs
        isNewPostOpen={isDialogOpen}
        onCloseNewPost={() => setIsDialogOpen(false)}
        newPostSlug={newPostSlug}
        onNewPostSlugChange={setNewPostSlug}
        onConfirmNewPost={confirmNewPost}
        isRenameOpen={isRenameDialogOpen}
        onCloseRename={() => setIsRenameDialogOpen(false)}
        renameValue={renameValue}
        onRenameValueChange={setRenameValue}
        onConfirmRename={confirmRenameSlug}
        activeSlug={activeSlug}
        deleteTarget={null}
        onCloseDelete={() => {}}
        onConfirmDelete={() => {}}
      />

      <EditorToolbar
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        isSplit={isSplit}
        onToggleSplit={() => setIsSplit(!isSplit)}
        activeSlug={activeSlug}
        isDirty={isDirty}
        isSaving={isSaving}
        isUploading={false}
        isPending={isPending}
        onSave={handleSave}
        onRename={() => {
          setRenameValue(activeSlug || "");
          setIsRenameDialogOpen(true);
        }}
        getLiveUrl={getLiveUrl}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <EditorSidebar
          width={sidebarWidth}
          showSidebar={showSidebar}
          blogFolders={blogFolders}
          activeSlug={activeSlug}
          expandedSlugs={expandedSlugs}
          onToggleExpand={toggleExpand}
          onLoadPost={handleLoadPost}
          onNewDraft={() => {
            setActiveSlug(null);
            setContent(initialContent);
            setLastSavedContent("");
            setPreviewHtml(renderMarkdownToHtml(initialContent));
          }}
        />

        {showSidebar ? (
          <ResizeHandle onMouseDown={startResizingSidebar} />
        ) : null}

        <EditorInput
          content={content}
          onChange={setContent}
          isSplit={isSplit}
          editorWidth={editorWidth}
        />

        {isSplit ? <ResizeHandle onMouseDown={startResizingEditor} /> : null}

        {isSplit ? (
          <EditorPreview
            previewHtml={previewHtml}
            previewAsset={null}
            isPending={isPending}
            onClearPreviewAsset={() => {}}
          />
        ) : null}
      </div>

      <EditorFooter content={content} isDirty={isDirty} />
    </div>
  );
}

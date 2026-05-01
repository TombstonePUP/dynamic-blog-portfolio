"use client";

import {
  getBlogContentAction,
  getBlogListAction,
  renameBlogSlugAction,
  saveBlogContentAction,
  createDraftAction,
  deleteStoryAction
} from "@/app/actions/blog-actions";
import { compileMdxAction } from "@/app/actions/mdx-actions";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import EditorDialogs from "./editor/editor-dialogs";
import EditorFooter from "./editor/editor-footer";
import CodeMirrorInput, { type CodeMirrorInputRef } from "./editor/codemirror-input";
import EditorPreview from "./editor/editor-preview";
import EditorSidebar from "./editor/editor-sidebar";
import EditorToolbar from "./editor/editor-toolbar";
import ResizeHandle from "./editor/resize-handle";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

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
  const router = useRouter();
  const initialActiveSlug = searchParams.get("slug");
  
  const defaultContent = initialActiveSlug && initialBlogContents[initialActiveSlug] 
    ? initialBlogContents[initialActiveSlug] 
    : initialContent;

  const [content, setContent] = useState(defaultContent);
  const [lastSavedContent, setLastSavedContent] = useState(defaultContent);
  const [activeSlug, setActiveSlug] = useState<string | null>(initialActiveSlug || null);
  const [blogFolders, setBlogFolders] = useState<BlogFolder[]>(initialBlogFolders);
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(
    new Set(initialActiveSlug ? [initialActiveSlug] : [])
  );
  const [previewSource, setPreviewSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [previewAsset, setPreviewAsset] = useState<{ slug: string, filename: string, dataUrl: string } | null>(null);

  const editorRef = useRef<CodeMirrorInputRef>(null);

  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSplit, setIsSplit] = useState(true);

  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [editorWidth, setEditorWidth] = useState(600);
  
  const sidebarWidthRef = useRef(sidebarWidth);
  const showSidebarRef = useRef(showSidebar);
  const isResizingSidebar = useRef(false);
  const isResizingEditor = useRef(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPostSlug, setNewPostSlug] = useState("");
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const isDirty = content !== lastSavedContent;

  useEffect(() => {
    sidebarWidthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  useEffect(() => {
    showSidebarRef.current = showSidebar;
  }, [showSidebar]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isResizingSidebar.current) {
      setSidebarWidth(Math.max(200, Math.min(500, event.clientX)));
    }

    if (isResizingEditor.current) {
      const currentSidebarWidth = showSidebarRef.current ? sidebarWidthRef.current : 0;
      setEditorWidth(Math.max(300, event.clientX - currentSidebarWidth));
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizingSidebar.current = false;
    isResizingEditor.current = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, [handleMouseMove]);

  const startResizingSidebar = useCallback(() => {
    isResizingSidebar.current = true;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [handleMouseMove, stopResizing]);

  const startResizingEditor = useCallback(() => {
    isResizingEditor.current = true;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
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
    const timer = setTimeout(async () => {
      if (!content.trim()) {
        setPreviewSource(null);
        return;
      }
      const res = await compileMdxAction(content);
      if (res.success && res.source) {
        setPreviewSource(res.source);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [content]);

  const handleLoadPost = useCallback(
    async (slug: string) => {
      if (typeof window !== "undefined") {
        const currentUrlSlug = new URLSearchParams(window.location.search).get("slug");
        if (currentUrlSlug !== slug) {
          router.push(`?slug=${slug}`, { scroll: false });
        }
      }
      
      // Update synchronously to prevent infinite loops with useSearchParams effect
      setActiveSlug(slug);

      startTransition(async () => {
        if (initialBlogContents[slug]) {
          setContent(initialBlogContents[slug]);
          setLastSavedContent(initialBlogContents[slug]);
          setExpandedSlugs((previous) => new Set(previous).add(slug));
          return;
        }

        const result = await getBlogContentAction(slug);
        if (result.success) {
          setContent(result.content || "");
          setLastSavedContent(result.content || "");
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
    if (initialActiveSlug && initialActiveSlug !== activeSlug) {
      void handleLoadPost(initialActiveSlug);
    } else if (!initialActiveSlug && activeSlug) {
      setActiveSlug(null);
      setContent(initialContent);
      setLastSavedContent(initialContent);
      setPreviewSource(null);
    }
  }, [initialActiveSlug, activeSlug, handleLoadPost, initialContent]);

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
      if (nextSlug !== activeSlug) {
        router.replace(`?slug=${nextSlug}`, { scroll: false });
      }
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

  async function confirmNewPost() {
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

    setIsDialogOpen(false);
    setNewPostSlug("");
    setIsSaving(true);

    const existing = blogFolders.find((folder) => folder.slug === slug);

    if (existing) {
      void handleLoadPost(slug);
      setIsSaving(false);
    } else {
      const result = await createDraftAction(slug);
      if (result.success && result.slug) {
        await refreshList();
        void handleLoadPost(result.slug);
      } else {
        alert(result.error || "Failed to create draft");
      }
      setIsSaving(false);
    }
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
      const updatedSlug = result.slug || newSlug;
      setActiveSlug(updatedSlug);
      router.replace(`?slug=${updatedSlug}`, { scroll: false });
      await refreshList();
    } else {
      alert(result.error || "Failed to rename slug");
    }

    setIsSaving(false);
    setIsRenameDialogOpen(false);
  }

  async function handleDeletePost(slug: string) {
    if (!confirm(`Are you sure you want to delete ${slug}?`)) {
      return;
    }

    setIsSaving(true);
    const result = await deleteStoryAction(slug);
    
    if (result.success) {
      if (activeSlug === slug) {
        setActiveSlug(null);
        setContent(initialContent);
        setLastSavedContent(initialContent);
        setPreviewSource(null);
        router.push("/editor");
      }
      await refreshList();
    } else {
      alert(result.error || "Failed to delete story");
    }
    setIsSaving(false);
  }

  function getLiveUrl() {
    if (!activeSlug) {
      return "#";
    }

    return `/${activeSlug}`;
  }

  function insertAsset(filename: string) {
    if (editorRef.current) {
      let cleanName = filename;
      if (cleanName.startsWith("./assets/")) cleanName = cleanName.slice(9);
      else if (cleanName.startsWith("assets/")) cleanName = cleanName.slice(7);
      
      editorRef.current.insertText(`\n![Image](./assets/${cleanName})\n`);
    }
  }

  return (
    <div className="flex min-h-0 max-h-[93vh] flex-1 flex-col overflow-hidden font-sans shadow-2xl ring-1 select-none">
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

      <div className="relative flex flex-col md:flex-row flex-1 overflow-x-hidden overflow-y-auto md:overflow-hidden">
        <div className="w-full md:w-auto shrink-0 md:h-full">
          <EditorSidebar
          width={sidebarWidth}
          showSidebar={showSidebar}
          blogFolders={blogFolders}
          activeSlug={activeSlug}
          expandedSlugs={expandedSlugs}
          onToggleExpand={toggleExpand}
          onLoadPost={handleLoadPost}
          onNewDraft={() => {
            setNewPostSlug("");
            setIsDialogOpen(true);
          }}
          onDeletePost={handleDeletePost}
          onPreviewAsset={setPreviewAsset}
          onInsertAsset={insertAsset}
        />
        </div>

        {showSidebar ? (
          <div className="hidden md:flex">
            <ResizeHandle onMouseDown={startResizingSidebar} />
          </div>
        ) : null}

        <div className="w-full md:w-auto flex-1 shrink-0 md:h-full min-h-[50vh]">
          <CodeMirrorInput
            ref={editorRef}
            content={content}
            onChange={setContent}
            editorWidth={isSplit ? editorWidth : undefined}
          />
        </div>

        {isSplit ? (
          <div className="hidden md:flex">
            <ResizeHandle onMouseDown={startResizingEditor} />
          </div>
        ) : null}

        {isSplit ? (
          <div className="w-full md:w-auto flex-1 shrink-0 md:h-full min-h-[50vh] border-t md:border-t-0">
          <EditorPreview
            previewSource={previewSource}
            activeSlug={activeSlug}
            previewAsset={previewAsset}
            isPending={isPending}
            onClearPreviewAsset={() => setPreviewAsset(null)}
            onInsertAsset={insertAsset}
          />
          </div>
        ) : null}
      </div>

      <EditorFooter content={content} isDirty={isDirty} />
    </div>
  );
}

"use client";

import {
  deleteAssetAction,
  getAssetDataAction,
  getBlogContentAction,
  getBlogListAction,
  renameBlogSlugAction,
  saveBlogContentAction,
  uploadAssetAction
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
  files: string[];
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
  const [activeSlug, setActiveSlug] = useState<string | null>(initialActiveSlug || null);
  const [blogFolders, setBlogFolders] = useState<BlogFolder[]>(initialBlogFolders);
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(
    new Set(initialActiveSlug ? [initialActiveSlug] : [])
  );
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewAsset, setPreviewAsset] = useState<{ slug: string, filename: string, dataUrl: string } | null>(null);
  const [assetCache, setAssetCache] = useState<Record<string, string>>({});

  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSplit, setIsSplit] = useState(true);

  // Layout State
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [editorWidth, setEditorWidth] = useState(600);
  const isResizingSidebar = useRef(false);
  const isResizingEditor = useRef(false);

  // New Post Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPostSlug, setNewPostSlug] = useState("");

  // Rename Dialog State
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<{ slug: string, filename: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = content !== lastSavedContent;

  // Resize Handlers
  const startResizingSidebar = useCallback((e: React.MouseEvent) => {
    isResizingSidebar.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const startResizingEditor = useCallback((e: React.MouseEvent) => {
    isResizingEditor.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const stopResizing = useCallback(() => {
    isResizingSidebar.current = false;
    isResizingEditor.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingSidebar.current) {
      const newWidth = Math.max(200, Math.min(500, e.clientX));
      setSidebarWidth(newWidth);
    }
    if (isResizingEditor.current) {
      const currentSidebarWidth = showSidebar ? sidebarWidth : 0;
      const newWidth = Math.max(300, e.clientX - currentSidebarWidth);
      setEditorWidth(newWidth);
    }
  }, [showSidebar, sidebarWidth]);



  const refreshList = async () => {
    // In prototype mode, we just use the initial list passed from the server
    if (initialBlogFolders.length > 0) {
      setBlogFolders(initialBlogFolders);
      return;
    }
    const result = await getBlogListAction();
    if (result.success) setBlogFolders(result.list || []);
  };

  useEffect(() => {
    refreshList();
  }, []);

  useEffect(() => {
    if (previewAsset) return;
    const timer = setTimeout(() => {
      setPreviewHtml(renderMarkdownToHtml(content));
    }, 300);
    return () => clearTimeout(timer);
  }, [content, previewAsset]);

  const handleLoadPost = useCallback(async (slug: string) => {
    setPreviewAsset(null);
    startTransition(async () => {
      // If we have the initial content from the server (prototype/static mode), use it
      if (initialBlogContents[slug]) {
        setContent(initialBlogContents[slug]);
        setLastSavedContent(initialBlogContents[slug]);
        setActiveSlug(slug);
        setExpandedSlugs(prev => new Set(prev).add(slug));
        return;
      }

      // Fallback to the action (which returns dummy data in prototype)
      const result = await getBlogContentAction(slug);
      if (result.success) {
        setContent(result.content || "");
        setLastSavedContent(result.content || "");
        setActiveSlug(slug);

        setExpandedSlugs(prev => {
          const next = new Set(prev);
          next.add(slug);
          return next;
        });
      }
    });
  }, [initialBlogContents]);

  // Handle Initial Load from URL Slug
  useEffect(() => {
    if (initialActiveSlug) {
      handleLoadPost(initialActiveSlug);
    }
  }, [initialActiveSlug, handleLoadPost]);

  const toggleExpand = (slug: string) => {
    const newExpanded = new Set(expandedSlugs);
    if (newExpanded.has(slug)) newExpanded.delete(slug);
    else newExpanded.add(slug);
    setExpandedSlugs(newExpanded);
  };

  const handlePreviewImage = async (slug: string, filename: string) => {
    const cacheKey = `${slug}/${filename}`;
    if (assetCache[cacheKey]) {
      setPreviewAsset({ slug, filename, dataUrl: assetCache[cacheKey] });
      return;
    }
    startTransition(async () => {
      const result = await getAssetDataAction(slug, filename);
      if (result.success && result.dataUrl) {
        setAssetCache(prev => ({ ...prev, [cacheKey]: result.dataUrl }));
        setPreviewAsset({ slug, filename, dataUrl: result.dataUrl });
      }
    });
  };

  const handleSave = async () => {
    if (!activeSlug) {
      setNewPostSlug("");
      setIsDialogOpen(true);
    } else {
      save(activeSlug);
    }
  };

  const save = async (slug: string) => {
    setIsSaving(true);
    const result = await saveBlogContentAction(slug, content);
    if (result.success) {
      setLastSavedContent(content);
      await refreshList();
    }
    setIsSaving(false);
  };

  const confirmNewPost = () => {
    if (!newPostSlug.trim()) return;

    const slug = newPostSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) return;

    const existing = blogFolders.find(f => f.slug === slug);

    if (existing) {
      handleLoadPost(slug);
    } else {
      setActiveSlug(slug);
      save(slug);
    }

    setIsDialogOpen(false);
    setNewPostSlug("");
  };

  const confirmRenameSlug = async () => {
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
      setActiveSlug(newSlug);
      await refreshList();
    } else {
      alert(result.error || "Failed to rename slug");
    }
    setIsSaving(false);
    setIsRenameDialogOpen(false);
  };

  const handleDeleteAsset = async (slug: string, filename: string) => {
    setDeleteTarget({ slug, filename });
  };

  const confirmDeleteAsset = async () => {
    if (!deleteTarget) return;

    const { slug, filename } = deleteTarget;
    setIsSaving(true);
    const result = await deleteAssetAction(slug, filename);
    if (result.success) {
      if (previewAsset?.slug === slug && previewAsset?.filename === filename) {
        setPreviewAsset(null);
      }
      refreshList();
    } else {
      alert(result.error || "Failed to delete file");
    }
    setIsSaving(false);
    setDeleteTarget(null);
  };

  const getLiveUrl = () => {
    if (!activeSlug) return "#";
    const tagsMatch = content.match(/tags:\s*\["(.*?)"/);
    const topic = tagsMatch ? tagsMatch[1] : "personal blog";
    return `/blog/${activeSlug}/?topic=${encodeURIComponent(topic)}`;
  };

  const isImage = (filename: string) => /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(filename);

  return (
    <div className="flex-1 min-h-0 flex flex-col shadow-2xl ring-1 rounded-2xl overflow-hidden font-sans select-none">
      <input type="file" ref={fileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file || !activeSlug) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        uploadAssetAction(activeSlug, formData).then(result => {
          if (result.success) {
            refreshList();
            if (file.name.endsWith(".mdx")) handleLoadPost(activeSlug);
            else if (isImage(file.name)) handlePreviewImage(activeSlug, file.name);
          }
          setIsUploading(false);
        });
        e.target.value = "";
      }} className="hidden" accept="image/*,.mdx" />

      {/* DIALOGS */}
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
        deleteTarget={deleteTarget}
        onCloseDelete={() => setDeleteTarget(null)}
        onConfirmDelete={confirmDeleteAsset}
      />

      {/* TOOLBAR */}
      <EditorToolbar
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        isSplit={isSplit}
        onToggleSplit={() => setIsSplit(!isSplit)}
        activeSlug={activeSlug}
        isDirty={isDirty}
        isSaving={isSaving}
        isUploading={isUploading}
        isPending={isPending}
        onSave={handleSave}
        onRename={() => {
          setRenameValue(activeSlug || "");
          setIsRenameDialogOpen(true);
        }}
        getLiveUrl={getLiveUrl}
      />

      {/* WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR */}
        <EditorSidebar
          width={sidebarWidth}
          showSidebar={showSidebar}
          blogFolders={blogFolders}
          activeSlug={activeSlug}
          expandedSlugs={expandedSlugs}
          previewAsset={previewAsset}
          initialContent={initialContent}
          onToggleExpand={toggleExpand}
          onLoadPost={handleLoadPost}
          onPreviewImage={handlePreviewImage}
          onDeleteAsset={handleDeleteAsset}
          onNewDraft={() => { setActiveSlug(null); setContent(initialContent); setLastSavedContent(""); setPreviewAsset(null); }}
          onUploadToFolder={(slug) => { setActiveSlug(slug); fileInputRef.current?.click(); }}
          isImage={isImage}
        />

        {/* SIDEBAR RESIZER */}
        {showSidebar && <ResizeHandle onMouseDown={startResizingSidebar} />}

        {/* INPUT PANE */}
        <EditorInput
          content={content}
          onChange={setContent}
          isSplit={isSplit}
          editorWidth={editorWidth}
        />

        {/* EDITOR RESIZER */}
        {isSplit && <ResizeHandle onMouseDown={startResizingEditor} />}

        {/* PREVIEW PANE */}
        {isSplit && (
          <EditorPreview
            previewHtml={previewHtml}
            previewAsset={previewAsset}
            isPending={isPending}
            onClearPreviewAsset={() => setPreviewAsset(null)}
          />
        )}
      </div>

      {/* FOOTER */}
      <EditorFooter content={content} isDirty={isDirty} />
    </div>
  );
}

"use client";

import {
  createDraftAction,
  deleteStoryAction,
  getBlogContentAction,
  getBlogListAction,
  renameBlogSlugAction,
  saveBlogContentAction
} from "@/app/actions/blog-actions";
import { compileMdxAction } from "@/app/actions/mdx-actions";
import { buildEditorDocument, parseEditorDocument } from "@/features/posts/lib/post-documents";
import { ChevronDown, ChevronRight, Eye, FileEdit, FolderOpen } from "lucide-react";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import CodeMirrorInput, { type CodeMirrorInputRef } from "./editor/codemirror-input";
import EditorDialogs from "./editor/editor-dialogs";
import EditorFooter from "./editor/editor-footer";
import EditorMetadata, { type PostMetadata } from "./editor/editor-metadata";
import EditorPreview from "./editor/editor-preview";
import EditorSidebar from "./editor/editor-sidebar";
import EditorToolbar from "./editor/editor-toolbar";
import ResizeHandle from "./editor/resize-handle";

type BlogFolder = {
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  updatedAt: string;
};

type EditorMode = "form" | "raw";

function extractMetadataAndBody(content: string): { metadata: PostMetadata; body: string } {
  try {
    const doc = parseEditorDocument(content);
    return {
      metadata: {
        title: doc.title,
        date: doc.date,
        author: doc.author,
        image: doc.image,
        excerpt: doc.excerpt,
        tags: doc.tags,
        status: doc.status,
      },
      body: doc.body,
    };
  } catch {
    return {
      metadata: {
        title: "Untitled story",
        date: new Date().toISOString().slice(0, 10),
        author: "writer",
        image: "",
        excerpt: "",
        tags: [],
        status: "draft",
      },
      body: content,
    };
  }
}

function rebuildContent(metadata: PostMetadata, body: string): string {
  return buildEditorDocument({
    ...metadata,
    body,
  });
}

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

  // Editor mode: "form" (structured inputs) or "raw" (full MDX)
  const [editorMode, setEditorMode] = useState<EditorMode>("form");
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(true);
  const [isContentExpanded, setIsContentExpanded] = useState(true);

  // Structured metadata state — derived from content
  const [metadata, setMetadata] = useState<PostMetadata>(() => extractMetadataAndBody(defaultContent).metadata);
  const [bodyContent, setBodyContent] = useState<string>(() => extractMetadataAndBody(defaultContent).body);

  const editorRef = useRef<CodeMirrorInputRef>(null);

  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSplit, setIsSplit] = useState(true);
  const [activeTab, setActiveTab] = useState<"explorer" | "editor" | "preview">("editor");

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

  // Ref to track whether we're doing a mode-switch sync, to avoid infinite loops
  const isSyncing = useRef(false);

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

  const stopResizing = useCallback(function handleStopResizing() {
    isResizingSidebar.current = false;
    isResizingEditor.current = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleStopResizing);
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

  // Preview compilation
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      if (!content.trim()) {
        setIsCompiling(false);
        setPreviewSource(null);
        return;
      }
      setIsCompiling(true);
      const res = await compileMdxAction(content);
      if (isCancelled) {
        return;
      }
      if (res.success && res.source) {
        setPreviewSource(res.source);
      } else {
        setPreviewSource(null);
      }
      setIsCompiling(false);
    }, 500);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [content]);

  // Sync: when content changes externally (e.g. loading a post), update metadata + body
  useEffect(() => {
    if (isSyncing.current) return;
    const { metadata: m, body: b } = extractMetadataAndBody(content);
    setMetadata(m);
    setBodyContent(b);
  }, [content]);

  // Handle metadata changes in form mode → rebuild content
  const handleMetadataChange = useCallback((newMetadata: PostMetadata) => {
    setMetadata(newMetadata);
    isSyncing.current = true;
    const rebuilt = rebuildContent(newMetadata, bodyContent);
    setContent(rebuilt);
    requestAnimationFrame(() => { isSyncing.current = false; });
  }, [bodyContent]);

  // Handle body changes in form mode → rebuild content
  const handleBodyChange = useCallback((newBody: string) => {
    setBodyContent(newBody);
    isSyncing.current = true;
    const rebuilt = rebuildContent(metadata, newBody);
    setContent(rebuilt);
    requestAnimationFrame(() => { isSyncing.current = false; });
  }, [metadata]);

  // Handle raw content changes → update content + let the effect sync metadata
  const handleRawContentChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  // Switch mode: sync state when switching
  const switchEditorMode = useCallback((mode: EditorMode) => {
    if (mode === editorMode) return;

    if (mode === "form") {
      // Switching from raw → form: parse the raw content
      const { metadata: m, body: b } = extractMetadataAndBody(content);
      setMetadata(m);
      setBodyContent(b);
    } else {
      // Switching from form → raw: rebuild from metadata + body
      const rebuilt = rebuildContent(metadata, bodyContent);
      setContent(rebuilt);
    }
    setEditorMode(mode);
  }, [editorMode, content, metadata, bodyContent]);

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
    [initialBlogContents, router],
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
    <div className="flex h-screen flex-col overflow-hidden bg-admin-bg font-sans shadow-xl select-none">
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
        onCloseDelete={() => { }}
        onConfirmDelete={() => { }}
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
        isPending={isPending || isCompiling}
        onSave={handleSave}
        onRename={() => {
          setRenameValue(activeSlug || "");
          setIsRenameDialogOpen(true);
        }}
        getLiveUrl={getLiveUrl}
        editorMode={editorMode}
        onSwitchEditorMode={switchEditorMode}
      />

      <div className="shrink-0 border-b border-admin-text/5 bg-admin-surface/30">
        <div className="flex items-center justify-end px-4 py-2 md:px-6">

          <div className="flex rounded-full border border-admin-text/10 bg-admin-contrast/65 p-1 md:hidden">
            <button
              onClick={() => setActiveTab("explorer")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold transition-colors ${activeTab === "explorer"
                ? "bg-white text-admin-accent shadow-sm"
                : "text-admin-muted hover:text-admin-heading"
                }`}
            >
              <FolderOpen size={13} />
            </button>
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold transition-colors ${activeTab === "editor"
                ? "bg-white text-admin-accent shadow-sm"
                : "text-admin-muted hover:text-admin-heading"
                }`}
            >
              <FileEdit size={13} />
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold transition-colors ${activeTab === "preview"
                ? "bg-white text-admin-accent shadow-sm"
                : "text-admin-muted hover:text-admin-heading"
                }`}
            >
              <Eye size={13} />
            </button>
          </div>
        </div>

      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <div className={`min-h-0 w-full md:w-auto shrink-0 md:h-full ${activeTab === "explorer" ? "block" : "hidden md:block"}`}>
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

        <div
          className={`min-h-0 w-full shrink-0 md:h-full md:w-auto ${isSplit ? "md:flex-none" : "flex-1"} ${activeTab === "editor" ? "flex" : "hidden md:flex"}`}
          style={isSplit ? { flexBasis: editorWidth, width: editorWidth } : {}}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-r border-admin-text/5 bg-admin-surface/90">
            {editorMode === "form" ? (
              /* Structured Form Mode: Metadata panel on top + Body editor below */
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {/* Metadata Panel — scrollable */}
                <button
                  onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
                  className="shrink-0 flex items-center justify-between border-b border-admin-text/5 bg-admin-surface/50 px-4 py-3 backdrop-blur hover:bg-admin-surface-hover transition-colors text-left"
                >
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-admin-primary/60">
                      Post Details (Metadata)
                    </p>
                  </div>
                  {isMetadataExpanded ? (
                    <ChevronDown size={18} className="text-admin-text/40" />
                  ) : (
                    <ChevronRight size={18} className="text-admin-text/40" />
                  )}
                </button>
                {isMetadataExpanded && (
                  <div className="shrink-0 max-h-[40%] overflow-y-auto border-b border-admin-text/5">
                    <EditorMetadata
                      metadata={metadata}
                      onChange={handleMetadataChange}
                      activeSlug={activeSlug}
                    />
                  </div>
                )}

                {/* Body Content Editor */}
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <button
                    onClick={() => setIsContentExpanded(!isContentExpanded)}
                    className="sticky top-0 z-10 flex items-center justify-between border-b border-admin-text/5 bg-admin-surface/50 px-4 py-2 backdrop-blur hover:bg-admin-surface-hover transition-colors text-left"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-admin-primary/60">
                      Story content (MDX)
                    </span>
                    {isContentExpanded ? (
                      <ChevronDown size={16} className="text-admin-text/40" />
                    ) : (
                      <ChevronRight size={16} className="text-admin-text/40" />
                    )}
                  </button>
                  {isContentExpanded && (
                    <div className="min-h-0 flex-1 bg-admin-surface overflow-y-scroll">
                      <CodeMirrorInput
                        ref={editorRef}
                        content={bodyContent}
                        onChange={handleBodyChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="shrink-0 border-b border-admin-text/5 bg-admin-surface/50 px-4 py-3 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-admin-primary/60">
                    Raw MDX
                  </p>
                  <p className="text-sm font-bold text-admin-heading tracking-tight">
                    Full document editing
                  </p>
                </div>
                <div className="min-h-0 flex-1 bg-admin-surface">
                  <CodeMirrorInput
                    ref={editorRef}
                    content={content}
                    onChange={handleRawContentChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {isSplit ? (
          <div className="hidden md:flex">
            <ResizeHandle onMouseDown={startResizingEditor} />
          </div>
        ) : null}

        {isSplit || activeTab === "preview" ? (
          <div className={`min-h-0 w-full flex-1 shrink-0 md:h-full md:w-auto ${activeTab === "preview" ? "flex" : "hidden md:flex"}`}>
            <EditorPreview
              previewSource={previewSource}
              activeSlug={activeSlug}
              previewAsset={previewAsset}
              metadata={metadata}
              previewContent={content}
              isPending={isCompiling}
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

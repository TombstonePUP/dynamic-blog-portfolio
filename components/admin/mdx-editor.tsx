"use client";

import { useEffect, useState, useTransition, useRef, useCallback } from "react";
import { compileMdxAction } from "@/app/actions/mdx-actions";
import { 
  getBlogListAction, 
  getBlogContentAction, 
  saveBlogContentAction,
  uploadAssetAction,
  getAssetDataAction,
  renameBlogSlugAction,
  deleteAssetAction
} from "@/app/actions/blog-actions";
import { MDXRemote } from "next-mdx-remote";
import Modal from "./modal";
import { 
  Eye, 
  FileText, 
  Loader2, 
  Maximize2, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  FolderOpen,
  Plus,
  Image as ImageIcon,
  FileCode,
  ChevronDown,
  Upload,
  X,
  GripVertical,
  Type,
  FileEdit,
  Info,
  Search,
  ExternalLink,
  Trash2
} from "lucide-react";

type BlogFolder = {
  slug: string;
  files: string[];
};

export default function MdxEditor({ initialContent = "" }: { initialContent?: string }) {
  const [content, setContent] = useState(initialContent);
  const [lastSavedContent, setLastSavedContent] = useState(initialContent);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [blogFolders, setBlogFolders] = useState<BlogFolder[]>([]);
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());
  const [mdxSource, setMdxSource] = useState<any>(null);
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

  // Custom components for the MDX preview
  const previewComponents = {
    h1: (props: any) => <h1 className="mt-8 mb-4 text-3xl font-bold" {...props} />,
    h2: (props: any) => <h2 className="mt-8 mb-4 text-2xl font-bold" {...props} />,
    p: (props: any) => <p className="mb-6 leading-relaxed" {...props} />,
    img: ({ src, alt, ...props }: any) => {
      const cacheKey = (src?.startsWith("./") && activeSlug) 
        ? `${activeSlug}/${src.replace("./", "")}` 
        : null;
      const resolvedSrc = (cacheKey && assetCache[cacheKey]) ? assetCache[cacheKey] : src;
      return (
        <div className="my-8 overflow-hidden rounded-xl bg-black/5 p-4 text-center">
          <p className="text-[10px] text-foreground/40 italic mb-2 uppercase tracking-widest">
            Asset: {src} {!(cacheKey && assetCache[cacheKey]) && "(Click file in sidebar to load preview)"}
          </p>
          <img {...props} src={resolvedSrc} className="mx-auto max-h-96 rounded-lg object-contain shadow-sm" alt={alt || ""} />
        </div>
      );
    },
  };

  const refreshList = async () => {
    const result = await getBlogListAction();
    if (result.success) setBlogFolders(result.list || []);
  };

  useEffect(() => {
    refreshList();
  }, []);

  useEffect(() => {
    if (previewAsset) return; 
    const timer = setTimeout(() => {
      startTransition(async () => {
        const result = await compileMdxAction(content);
        if (result.success) setMdxSource(result.source);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [content, previewAsset]);

  const handleLoadPost = async (slug: string) => {
    setPreviewAsset(null);
    startTransition(async () => {
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
  };

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
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden font-sans select-none">
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

      {/* NEW POST DIALOG */}
      <Modal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Create or Find Story"
        description="Enter a slug to start a new post or open an existing one."
        icon={<Plus size={20} />}
        footer={
          <>
            <button 
              onClick={() => setIsDialogOpen(false)}
              className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition"
            >
              Cancel
            </button>
            <button 
              onClick={confirmNewPost}
              disabled={!newPostSlug.trim()}
              className="bg-foreground px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-background transition hover:bg-foreground/80 disabled:opacity-30 disabled:hover:bg-foreground"
            >
              Go to Story
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 px-1">Post Slug</label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground/20" />
              <input 
                autoFocus
                type="text" 
                value={newPostSlug}
                onChange={(e) => setNewPostSlug(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmNewPost()}
                placeholder="e.g. why-positivity-matters"
                className="w-full bg-black/5 border-none px-10 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none"
              />
            </div>
            <p className="text-[10px] text-foreground/30 px-1 italic">Note: If this slug already exists, we will jump to that post.</p>
          </div>
        </div>
      </Modal>

      {/* RENAME SLUG DIALOG */}
      <Modal
        isOpen={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        title="Rename Story Slug"
        description="Changing the slug will change the post's URL."
        icon={<FileEdit size={20} />}
        variant="warning"
        footer={
          <>
            <button 
              onClick={() => setIsRenameDialogOpen(false)}
              className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition"
            >
              Cancel
            </button>
            <button 
              onClick={confirmRenameSlug}
              disabled={!renameValue.trim() || renameValue === activeSlug}
              className="bg-foreground px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-background transition hover:bg-foreground/80 disabled:opacity-30 disabled:hover:bg-foreground"
            >
              Rename Slug
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 px-1">New Slug</label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground/20" />
              <input 
                autoFocus
                type="text" 
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmRenameSlug()}
                placeholder="e.g. why-positivity-matters"
                className="w-full bg-black/5 border-none px-10 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE ASSET DIALOG */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete File"
        description={`Are you sure you want to delete "${deleteTarget?.filename}"? This action cannot be undone.`}
        icon={<Trash2 size={20} />}
        variant="danger"
        footer={
          <>
            <button 
              onClick={() => setDeleteTarget(null)}
              className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition"
            >
              Cancel
            </button>
            <button 
              onClick={confirmDeleteAsset}
              className="bg-red-600 px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-red-700 active:scale-95 shadow-sm"
            >
              Delete Permanently
            </button>
          </>
        }
      />

      {/* TOOLBAR */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-black/5 bg-[#FAF9F6]">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowSidebar(!showSidebar)} className="p-1.5 hover:bg-black/5 rounded transition text-foreground/40">
            {showSidebar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full text-xs font-bold uppercase tracking-wider text-foreground/60">
            <FileText className="size-3" /> Editor
          </div>
          <span className="text-xs text-foreground/30">/</span>
          <span className="text-xs font-medium text-foreground/50 italic">{activeSlug ? `Editing: ${activeSlug}` : "New Draft"}</span>
          {(isUploading || isPending) && <Loader2 className="size-3 animate-spin text-primary" />}
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSplit(!isSplit)} className={`p-2 rounded-lg transition ${isSplit ? "bg-black/5 text-foreground" : "text-foreground/40 hover:bg-black/5"}`}>
            <Maximize2 className="size-4" />
          </button>
          <div className="w-px h-4 bg-black/10 mx-1" />
          
          {activeSlug && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setRenameValue(activeSlug);
                  setIsRenameDialogOpen(true);
                }}
                className="flex items-center gap-2 text-foreground/60 hover:text-foreground px-4 py-1.5 transition text-xs font-bold uppercase tracking-widest border border-black/5 bg-white shadow-sm rounded hover:shadow-md active:scale-95"
              >
                <FileEdit size={14} className="opacity-40" />
                Rename
              </button>
              <a 
                href={getLiveUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground/60 hover:text-foreground px-4 py-1.5 transition text-xs font-bold uppercase tracking-widest border border-black/5 bg-white shadow-sm rounded hover:shadow-md active:scale-95"
              >
                <ExternalLink size={14} className="opacity-40" />
                View Saved Post
              </a>
            </div>
          )}

          <button 
            onClick={handleSave} 
            disabled={isSaving || !isDirty} 
            className="flex items-center gap-2 bg-foreground px-5 py-2 text-xs font-bold text-background transition hover:bg-foreground/80 disabled:opacity-20 shadow-sm"
          >
            {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
            {activeSlug ? (isDirty ? "Save Changes" : "Saved") : "Create Post"}
          </button>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR */}
        <div 
          className="bg-[#FAF9F6] border-r border-black/5 transition-all duration-75 overflow-hidden flex flex-col shrink-0 shadow-[inset_-10px_0_15px_-15px_rgba(0,0,0,0.1)]"
          style={{ width: showSidebar ? sidebarWidth : 0 }}
        >
          <div className="p-4 flex flex-col gap-6 overflow-y-auto h-full" style={{ width: sidebarWidth }}>
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60 px-1">
              <span>Post Explorer</span>
              <button 
                onClick={() => { setActiveSlug(null); setContent(initialContent); setLastSavedContent(""); setPreviewAsset(null); }} 
                disabled={!activeSlug}
                className={`transition ${!activeSlug ? "opacity-10 cursor-not-allowed" : "hover:text-primary active:scale-95"}`}
                title={!activeSlug ? "Already in a draft" : "New Post"}
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5">
              {/* VIRTUAL NEW DRAFT ITEM */}
              {!activeSlug && (
                <div className="flex flex-col mb-4">
                  <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-black rounded bg-primary/20 text-foreground ring-1 ring-primary/30 shadow-sm">
                    <FileEdit size={16} strokeWidth={2.5} className="shrink-0 text-primary" />
                    <span className="truncate">unsaved-draft</span>
                  </div>
                  <div className="ml-6 mt-1 flex flex-col border-l-2 border-primary/20 pl-2 gap-1">
                    {/* Placeholder MDX */}
                    <div className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-foreground font-black bg-primary/10 shadow-sm rounded-md">
                      <FileCode size={14} strokeWidth={2.5} className="text-primary opacity-80" />
                      <span className="truncate">index.mdx</span>
                    </div>
                    
                    {/* Placeholder Assets */}
                    <div className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-foreground/30 font-semibold italic">
                      <ImageIcon size={14} strokeWidth={2.5} className="opacity-30" />
                      <span className="truncate">cover.jpg (pending)</span>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-lg mt-2 mr-2 flex flex-col gap-4">
                      <div className="relative aspect-video rounded-lg bg-black/5 border border-dashed border-black/10 flex items-center justify-center overflow-hidden">
                        <ImageIcon className="size-8 text-black/10" />
                        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                        <span className="absolute bottom-2 right-2 text-[8px] font-black uppercase tracking-tighter text-black/20">Thumbnail Placeholder</span>
                      </div>
                      <div className="flex items-start gap-2.5 text-[11px] text-foreground font-bold leading-tight">
                        <Info size={14} className="shrink-0 mt-0.5 text-primary opacity-60" />
                        <span>Save this post to enable actual image uploads.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {blogFolders.map((folder) => {
                const isExpanded = expandedSlugs.has(folder.slug);
                const isActive = activeSlug === folder.slug;
                return (
                  <div key={folder.slug} className="flex flex-col">
                    <div className={`flex items-center group transition rounded-lg ${isActive ? "bg-primary/10 shadow-sm ring-1 ring-primary/5" : "hover:bg-black/5"}`}>
                      <button onClick={() => toggleExpand(folder.slug)} className={`flex flex-1 items-center gap-3 px-3 py-2.5 text-[13px] font-bold transition text-left text-foreground`}>
                        {isExpanded ? <ChevronDown size={14} strokeWidth={3} className="shrink-0 opacity-40" /> : <ChevronRight size={14} strokeWidth={3} className="shrink-0 opacity-40" />}
                        <FolderOpen size={16} strokeWidth={2.5} className={`shrink-0 ${isActive ? "text-primary" : "text-foreground/40"}`} />
                        <span className="truncate">{folder.slug}</span>
                      </button>
                      <button onClick={() => { setActiveSlug(folder.slug); fileInputRef.current?.click(); }} className="opacity-0 group-hover:opacity-100 p-2.5 transition text-primary hover:scale-110 active:scale-95" title="Upload Image to this Folder">
                        <Upload size={16} strokeWidth={3} />
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="ml-6 mt-1 flex flex-col border-l-2 border-black/5 pl-2 gap-0.5">
                        {folder.files.map(file => {
                          const isMdx = file === "index.mdx";
                          const isCurrentlyPreviewing = previewAsset?.slug === folder.slug && previewAsset?.filename === file;
                          return (
                            <div key={file} className="group relative flex items-center">
                              <button onClick={() => { if (isMdx) handleLoadPost(folder.slug); else if (isImage(file)) handlePreviewImage(folder.slug, file); }}
                                className={`flex-1 flex items-center gap-2.5 px-4 py-2 text-[12px] transition text-left rounded-md ${isCurrentlyPreviewing ? "text-foreground font-black bg-primary/10 shadow-sm" : "text-foreground/60 font-semibold hover:bg-primary/5 hover:text-foreground"}`}>
                                {isMdx ? <FileCode size={14} strokeWidth={2.5} className={isCurrentlyPreviewing ? "text-primary opacity-80" : "opacity-60"} /> : isImage(file) ? <ImageIcon size={14} strokeWidth={2.5} className={isCurrentlyPreviewing ? "text-primary opacity-80" : "opacity-60"} /> : <FileText size={14} strokeWidth={2.5} className={isCurrentlyPreviewing ? "text-primary opacity-80" : "opacity-60"} />}
                                <span className="truncate pr-6">{file}</span>
                              </button>
                              {!isMdx && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteAsset(folder.slug, file); }}
                                  className="absolute right-1.5 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-600 transition rounded text-foreground/20"
                                  title="Delete File"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                        <button 
                          onClick={() => { setActiveSlug(folder.slug); fileInputRef.current?.click(); }}
                          className="flex items-center gap-2 px-4 py-2 text-[11px] font-black text-primary hover:bg-primary/5 transition uppercase tracking-[0.1em] mt-1 rounded-md"
                        >
                          <Plus size={12} strokeWidth={3} />
                          Add Image
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIDEBAR RESIZER */}
        {showSidebar && (
          <div onMouseDown={startResizingSidebar} className="w-1 h-full cursor-col-resize hover:bg-primary transition-colors shrink-0 bg-black/5 active:bg-primary group flex items-center justify-center z-10">
            <div className="w-px h-8 bg-foreground/10 group-hover:bg-white/50" />
          </div>
        )}

        {/* INPUT PANE */}
        <div 
          className={`flex flex-col transition-all duration-75 w-full bg-white overflow-y-auto ${!isSplit ? "items-center" : ""}`}
          style={{ width: isSplit ? editorWidth : "100%" }}
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your story..."
            className={`flex-1 p-10 font-mono text-sm leading-relaxed resize-none focus:outline-none bg-transparent select-text text-foreground/80 ${!isSplit ? "max-w-7xl w-full" : "w-full"}`}
            spellCheck={false}
          />
        </div>

        {/* EDITOR RESIZER */}
        {isSplit && (
          <div onMouseDown={startResizingEditor} className="w-1 h-full cursor-col-resize hover:bg-primary transition-colors shrink-0 bg-black/5 active:bg-primary group flex items-center justify-center z-10">
            <div className="w-px h-8 bg-foreground/10 group-hover:bg-white/50" />
          </div>
        )}

        {/* PREVIEW PANE */}
        {isSplit && (
          <div className="flex-1 flex flex-col bg-[#FAF9F6] overflow-y-auto border-l border-black/5">
            <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 bg-[#FAF9F6]/80 backdrop-blur-md border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40">{previewAsset ? "Media Preview" : "Live Preview"}</span>
                {previewAsset && <button onClick={() => setPreviewAsset(null)} className="p-1.5 hover:bg-black/5 rounded-full text-foreground/40 transition"><X size={14} strokeWidth={3} /></button>}
              </div>
              {isPending && !previewAsset && <Loader2 className="size-4 animate-spin text-primary" />}
            </div>
            
            <div className="px-10 pb-20 prose prose-slate max-w-none">
              {previewAsset ? (
                <div className="flex flex-col items-center gap-8 pt-12">
                  <div className="relative group">
                    <img src={previewAsset.dataUrl} alt={previewAsset.filename} className="max-w-full h-auto shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-2xl ring-1 ring-black/5 bg-white" />
                    <div className="mt-6 p-5 bg-white shadow-xl ring-1 ring-black/5 rounded-xl text-center">
                      <p className="text-sm font-black text-foreground">{previewAsset.filename}</p>
                      <p className="text-[10px] text-foreground/40 mt-1.5 uppercase font-bold tracking-widest">Path: ./{previewAsset.filename}</p>
                    </div>
                  </div>
                </div>
              ) : mdxSource ? (
                <MDXRemote {...mdxSource} components={previewComponents} />
              ) : (
                <div className="flex flex-col items-center justify-center pt-32 text-foreground/10">
                  <Eye className="size-20 mb-6 opacity-50" />
                  <p className="text-sm font-black uppercase tracking-widest">Preview Area</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER STATS */}
      <div className="px-6 py-2.5 border-t border-black/5 bg-white flex items-center justify-between text-[11px] font-black text-foreground/60 uppercase tracking-[0.1em]">
        <div className="flex gap-6">
          <span>Words: {content.split(/\s+/).filter(Boolean).length}</span>
          <span>Chars: {content.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {isDirty ? (
            <div className="flex items-center gap-2 text-amber-600">
              <div className="size-1.5 rounded-full bg-amber-600 animate-pulse" />
              Unsaved Changes
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600">
              <div className="size-1.5 rounded-full bg-emerald-600" />
              All Changes Saved
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

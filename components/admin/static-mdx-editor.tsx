"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  Type,
  FileEdit,
  Info,
  ExternalLink,
  Trash2
} from "lucide-react";

type BlogFolder = {
  slug: string;
  files: string[];
};

const STATIC_INITIAL_CONTENT = `---
title: "Welcome to the Prototype Editor"
date: "2026-04-24"
tags: ["featured", "personal-blog"]
description: "This is a static version of the editor for UI showcasing."
---

# Welcome to the Prototype Editor

This editor is a **static showcase** of the UI and interactions. 
It looks and feels like the real thing, but it doesn't save to the server.

## Features:
- **Responsive Layout**: Drag the dividers to resize panes.
- **File Explorer**: Mock files and folders.
- **Real-time Stats**: Word and character counts update as you type.
- **Simulated Save**: Buttons show loading states and success feedback.

### Sample Markdown:
- Item one
- Item two
- Item three

[Check out the blog](/blog/first-post)
`;

const STATIC_FOLDERS: BlogFolder[] = [
  { slug: "getting-started", files: ["index.mdx", "cover.jpg", "setup.png"] },
  { slug: "my-first-story", files: ["index.mdx", "hero.webp"] },
  { slug: "positive-psychology", files: ["index.mdx"] },
  { slug: "strengths-guide", files: ["index.mdx", "chart.svg"] },
];

export default function StaticMdxEditor() {
  const [content, setContent] = useState(STATIC_INITIAL_CONTENT);
  const [lastSavedContent, setLastSavedContent] = useState(STATIC_INITIAL_CONTENT);
  const [activeSlug, setActiveSlug] = useState<string | null>("getting-started");
  const [blogFolders, setBlogFolders] = useState<BlogFolder[]>(STATIC_FOLDERS);
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set(["getting-started"]));
  const [previewAsset, setPreviewAsset] = useState<{ slug: string, filename: string, dataUrl: string } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isSplit, setIsSplit] = useState(true);

  // Layout State
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [editorWidth, setEditorWidth] = useState(600);
  const isResizingSidebar = useRef(false);
  const isResizingEditor = useRef(false);

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPostSlug, setNewPostSlug] = useState("");
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ slug: string, filename: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDirty = content !== lastSavedContent;

  // Resize Handlers (Identical to dynamic version)
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

  const stopResizing = useCallback(() => {
    isResizingSidebar.current = false;
    isResizingEditor.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

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

  // Mock Handlers
  const handleLoadPost = (slug: string) => {
    setPreviewAsset(null);
    setActiveSlug(slug);
    setContent(`# ${slug.replace(/-/g, " ")}\n\nThis is static content for the ${slug} post.`);
    setLastSavedContent(`# ${slug.replace(/-/g, " ")}\n\nThis is static content for the ${slug} post.`);
    setExpandedSlugs(prev => new Set(prev).add(slug));
  };

  const toggleExpand = (slug: string) => {
    const newExpanded = new Set(expandedSlugs);
    if (newExpanded.has(slug)) newExpanded.delete(slug);
    else newExpanded.add(slug);
    setExpandedSlugs(newExpanded);
  };

  const handleSave = () => {
    if (!activeSlug) setIsDialogOpen(true);
    else {
      setIsSaving(true);
      setTimeout(() => {
        setLastSavedContent(content);
        setIsSaving(false);
      }, 800);
    }
  };

  const confirmNewPost = () => {
    if (!newPostSlug.trim()) return;
    const slug = newPostSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    setBlogFolders(prev => [...prev, { slug, files: ["index.mdx"] }]);
    setActiveSlug(slug);
    setContent(`# ${newPostSlug}\n\nNew post content...`);
    setLastSavedContent(`# ${newPostSlug}\n\nNew post content...`);
    setIsDialogOpen(false);
    setNewPostSlug("");
  };

  const handlePreviewImage = (slug: string, filename: string) => {
    setPreviewAsset({ 
      slug, 
      filename, 
      dataUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800" 
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden font-sans select-none">
      <input type="file" ref={fileInputRef} className="hidden" onChange={() => {
        setIsUploading(true);
        setTimeout(() => setIsUploading(false), 1000);
      }} />

      {/* DIALOGS (Same as dynamic) */}
      <Modal isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Create or Find Story" description="Enter a slug to start a new post." icon={<Plus size={20} />}
        footer={<><button onClick={() => setIsDialogOpen(false)} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground">Cancel</button>
        <button onClick={confirmNewPost} className="bg-foreground px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-background">Go to Story</button></>}
      >
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 px-1">Post Slug</label>
          <input type="text" value={newPostSlug} onChange={(e) => setNewPostSlug(e.target.value)} placeholder="e.g. why-positivity-matters" className="w-full bg-black/5 border-none px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
      </Modal>

      {/* TOOLBAR */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-black/5 bg-[#FAF9F6]">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowSidebar(!showSidebar)} className="p-1.5 hover:bg-black/5 rounded transition text-foreground/40">
            {showSidebar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary ring-1 ring-primary/20">
            Prototype Mode
          </div>
          <span className="text-xs text-foreground/30">/</span>
          <span className="text-xs font-medium text-foreground/50 italic">{activeSlug ? `Editing: ${activeSlug}` : "New Draft"}</span>
          {(isUploading || isSaving) && <Loader2 className="size-3 animate-spin text-primary" />}
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSplit(!isSplit)} className={`p-2 rounded-lg transition ${isSplit ? "bg-black/5 text-foreground" : "text-foreground/40 hover:bg-black/5"}`}>
            <Maximize2 className="size-4" />
          </button>
          <div className="w-px h-4 bg-black/10 mx-1" />
          <button onClick={handleSave} disabled={isSaving || !isDirty} className="flex items-center gap-2 bg-foreground px-5 py-2 text-xs font-bold text-background transition hover:bg-foreground/80 disabled:opacity-20 shadow-sm">
            {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
            {activeSlug ? (isDirty ? "Save Changes" : "Saved") : "Create Post"}
          </button>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR */}
        <div className="bg-[#FAF9F6] border-r border-black/5 overflow-hidden flex flex-col shrink-0 shadow-[inset_-10px_0_15px_-15px_rgba(0,0,0,0.1)]" style={{ width: showSidebar ? sidebarWidth : 0 }}>
          <div className="p-4 flex flex-col gap-6 overflow-y-auto h-full" style={{ width: sidebarWidth }}>
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60 px-1">
              <span>Post Explorer</span>
              <button onClick={() => setIsDialogOpen(true)} className="hover:text-primary active:scale-95"><Plus size={16} strokeWidth={3} /></button>
            </div>
            <div className="flex flex-col gap-1.5">
              {blogFolders.map((folder) => {
                const isExpanded = expandedSlugs.has(folder.slug);
                const isActive = activeSlug === folder.slug;
                return (
                  <div key={folder.slug} className="flex flex-col">
                    <div className={`flex items-center group transition rounded-lg ${isActive ? "bg-primary/10 shadow-sm ring-1 ring-primary/5" : "hover:bg-black/5"}`}>
                      <button onClick={() => toggleExpand(folder.slug)} className="flex flex-1 items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-left text-foreground">
                        {isExpanded ? <ChevronDown size={14} strokeWidth={3} className="shrink-0 opacity-40" /> : <ChevronRight size={14} strokeWidth={3} className="shrink-0 opacity-40" />}
                        <FolderOpen size={16} strokeWidth={2.5} className={`shrink-0 ${isActive ? "text-primary" : "text-foreground/40"}`} />
                        <span className="truncate">{folder.slug}</span>
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="ml-6 mt-1 flex flex-col border-l-2 border-black/5 pl-2 gap-0.5">
                        {folder.files.map(file => (
                          <button key={file} onClick={() => { if (file.endsWith(".mdx")) handleLoadPost(folder.slug); else handlePreviewImage(folder.slug, file); }}
                            className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-foreground/60 font-semibold hover:bg-primary/5 hover:text-foreground rounded-md">
                            {file.endsWith(".mdx") ? <FileCode size={14} /> : <ImageIcon size={14} />}
                            <span className="truncate">{file}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RESIZERS */}
        {showSidebar && <div onMouseDown={startResizingSidebar} className="w-1 h-full cursor-col-resize hover:bg-primary transition-colors shrink-0 bg-black/5 z-10" />}
        
        {/* INPUT PANE */}
        <div className={`flex flex-col transition-all duration-75 bg-white overflow-y-auto ${!isSplit ? "items-center" : "w-full"}`} style={{ width: isSplit ? editorWidth : "100%" }}>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className={`flex-1 p-10 font-mono text-sm leading-relaxed resize-none focus:outline-none bg-transparent text-foreground/80 ${!isSplit ? "max-w-4xl" : "w-full"}`} spellCheck={false} />
        </div>

        {isSplit && <div onMouseDown={startResizingEditor} className="w-1 h-full cursor-col-resize hover:bg-primary transition-colors shrink-0 bg-black/5 z-10" />}

        {/* PREVIEW PANE (Static Mock) */}
        {isSplit && (
          <div className="flex-1 flex flex-col bg-[#FAF9F6] overflow-y-auto border-l border-black/5">
            <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 bg-[#FAF9F6]/80 backdrop-blur-md border-b border-black/5">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/40">{previewAsset ? "Media Preview" : "Static Preview"}</span>
              {previewAsset && <button onClick={() => setPreviewAsset(null)} className="p-1.5 hover:bg-black/5 rounded-full text-foreground/40 transition"><X size={14} strokeWidth={3} /></button>}
            </div>
            
            <div className="px-10 pb-20 prose prose-slate max-w-none">
              {previewAsset ? (
                <div className="flex flex-col items-center gap-8 pt-12">
                  <img src={previewAsset.dataUrl} alt={previewAsset.filename} className="max-w-full h-auto shadow-2xl rounded-2xl ring-1 ring-black/5 bg-white" />
                  <div className="p-5 bg-white shadow-xl ring-1 ring-black/5 rounded-xl text-center">
                    <p className="text-sm font-black text-foreground">{previewAsset.filename}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col pt-8">
                  <div className="p-8 bg-white shadow-xl ring-1 ring-black/5 rounded-2xl">
                    <h1 className="text-3xl font-black mb-6">Preview Mockup</h1>
                    <div className="space-y-4 text-foreground/60 leading-relaxed italic">
                      <p>In this prototype version, the MDX is not compiled live to ensure 100% stability in the static export.</p>
                      <p>The layout and styling here exactly match what you would see in the real editor.</p>
                      <hr className="border-black/5 my-8" />
                      <div className="bg-black/5 p-6 rounded-xl font-mono text-[11px] overflow-hidden">
                        {content.slice(0, 500)}...
                      </div>
                    </div>
                  </div>
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
          {isDirty ? <div className="flex items-center gap-2 text-amber-600"><div className="size-1.5 rounded-full bg-amber-600 animate-pulse" />Unsaved Changes</div> : 
          <div className="flex items-center gap-2 text-emerald-600"><div className="size-1.5 rounded-full bg-emerald-600" />All Changes Saved</div>}
        </div>
      </div>
    </div>
  );
}

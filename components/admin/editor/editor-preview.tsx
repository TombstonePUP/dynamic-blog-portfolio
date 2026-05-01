"use client";

import { X } from "lucide-react";
import { ClientMDXRemote } from "@/components/mdx/client-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";

interface EditorPreviewProps {
  previewSource: MDXRemoteSerializeResult | null;
  activeSlug: string | null;
  previewAsset: { slug: string; filename: string; dataUrl: string } | null;
  isPending: boolean;
  onClearPreviewAsset: () => void;
  onInsertAsset: (filename: string) => void;
}

export default function EditorPreview({
  previewSource,
  activeSlug,
  previewAsset,
  isPending,
  onClearPreviewAsset,
  onInsertAsset,
}: EditorPreviewProps) {
  if (previewAsset) {
    return (
      <div className="flex flex-1 flex-col bg-admin-bg p-8 relative overflow-auto">
        <button
          onClick={onClearPreviewAsset}
          className="absolute top-4 right-4 p-2 hover:bg-admin-contrast/5 rounded-full transition"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
          <div className="w-full bg-white shadow-xl ring-1 ring-black/5 p-4 mb-6">
            <img 
              src={previewAsset.dataUrl} 
              alt={previewAsset.filename}
              className="w-full h-auto object-contain max-h-[60vh]"
            />
          </div>
          
          <div className="bg-admin-primary/10 px-4 py-3 rounded-sm border border-admin-primary/20 w-full mb-4">
            <p className="text-[10px] uppercase font-black tracking-widest text-admin-primary mb-1">
              Relative Path
            </p>
            <code className="text-sm font-bold text-admin-text">
              ./assets/{previewAsset.filename}
            </code>
          </div>
          
          <button
            onClick={() => {
              onInsertAsset(previewAsset.filename);
              onClearPreviewAsset();
            }}
            className="w-full py-2 bg-admin-primary text-white font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-admin-primary/90 transition-colors"
          >
            Insert Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-admin-bg p-8 font-sans">
      <div className="prose prose-sm max-w-none prose-slate">
        {isPending ? (
          <div className="flex items-center justify-center py-20 opacity-20">
            Compiling...
          </div>
        ) : previewSource ? (
          <ClientMDXRemote source={previewSource} assetFolder={activeSlug || undefined} />
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-sm border-2 border-dashed border-admin-contrast/10">
            <p className="text-[12px] font-bold text-admin-text/30">
              {activeSlug
                ? "Waiting for content..."
                : "Select a story to preview"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Eye, Loader2, X } from "lucide-react";

interface EditorPreviewProps {
  previewHtml: string;
  previewAsset: { slug: string; filename: string; dataUrl: string } | null;
  isPending: boolean;
  onClearPreviewAsset: () => void;
}

export default function EditorPreview({
  previewHtml,
  previewAsset,
  isPending,
  onClearPreviewAsset,
}: EditorPreviewProps) {
  return (
    <div className="flex-1 flex flex-col  overflow-y-auto border-l">
      <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 /80 backdrop-blur-md border-b ">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] ">{previewAsset ? "Media Preview" : "Live Preview"}</span>
          {previewAsset && <button onClick={onClearPreviewAsset} className="p-1.5 hover:bg-admin-contrast/5 rounded-full  transition"><X size={14} strokeWidth={3} /></button>}
        </div>
        {isPending && !previewAsset && <Loader2 className="size-4 animate-spin text-admin-primary" />}
      </div>

      <div className="px-10 py-10 prose prose-slate max-w-none">
        {previewAsset ? (
          <div className="flex flex-col items-center gap-8 pt-12">
            <div className="relative group">
              <img src={previewAsset.dataUrl} alt={previewAsset.filename} className="max-w-full h-auto shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-2xl ring-1 bg-admin-bg" />
              <div className="mt-6 p-5 shadow-xl ring-1 rounded-xl text-center">
                <p className="text-sm font-black text-admin-text">{previewAsset.filename}</p>
                <p className="text-[10px]  mt-1.5 uppercase font-bold tracking-widest">Path: ./{previewAsset.filename}</p>
              </div>
            </div>
          </div>
        ) : previewHtml ? (
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        ) : (
          <div className="flex flex-col items-center justify-center pt-32 text-admin-text/10">
            <Eye className="size-20 mb-6 opacity-50" />
            <p className="text-sm font-black uppercase tracking-widest">Preview Area</p>
          </div>
        )}
      </div>
    </div>
  );
}

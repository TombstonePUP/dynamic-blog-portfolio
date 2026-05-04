"use client";

interface EditorFooterProps {
  content: string;
  isDirty: boolean;
}

export default function EditorFooter({ content, isDirty }: EditorFooterProps) {
  return (
    <div className="px-6 py-2.5 border-t flex items-center justify-between text-[11px] font-black text-admin-text/60 uppercase tracking-[0.1em]">
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
  );
}

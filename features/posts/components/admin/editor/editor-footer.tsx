"use client";

interface EditorFooterProps {
  content: string;
  isDirty: boolean;
}

export default function EditorFooter({ content, isDirty }: EditorFooterProps) {
  return (
    <div className="px-6 py-3 border-t border-admin-text/5 flex items-center justify-between text-[10px] font-black text-admin-text/40 uppercase tracking-[0.15em] bg-admin-surface/50">
      <div className="flex gap-6">
        <span>Words: {content.split(/\s+/).filter(Boolean).length}</span>
        <span>Chars: {content.length}</span>
      </div>
      <div className="flex items-center gap-2">
        {isDirty ? (
          <div className="flex items-center gap-2 text-admin-danger/70">
            <div className="size-1.5 rounded-full bg-admin-danger/70 animate-pulse" />
            Unsaved Changes
          </div>
        ) : (
          <div className="flex items-center gap-2 text-admin-success">
            <div className="size-1.5 rounded-full bg-admin-success" />
            All Changes Saved
          </div>
        )}
      </div>
    </div>
  );
}

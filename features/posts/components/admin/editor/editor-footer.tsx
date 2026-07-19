"use client";

interface EditorFooterProps {
  content: string;
  isDirty: boolean;
}

export default function EditorFooter({ content, isDirty }: EditorFooterProps) {
  return (
    <div className="flex items-center justify-between border-t border-admin-text/6 bg-admin-surface px-6 py-2.5 text-[13px] text-admin-muted">
      <div className="flex gap-4">
        <span>{content.split(/\s+/).filter(Boolean).length} words</span>
        <span>{content.length} characters</span>
      </div>
      <div className="flex items-center gap-2">
        {isDirty ? (
          <div className="flex items-center gap-2">
            <div className="size-1.5 animate-pulse rounded-full bg-admin-danger/70" />
            Unsaved changes
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-admin-success" />
            Saved
          </div>
        )}
      </div>
    </div>
  );
}

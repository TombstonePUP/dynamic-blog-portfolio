"use client";

import React from "react";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="w-1 h-full cursor-col-resize hover:bg-admin-primary transition-colors shrink-0 bg-admin-contrast/5 active:bg-admin-primary group flex items-center justify-center z-10"
    >
      <div className="w-px h-8 bg-admin-text/10 group-hover:bg-admin-bg/50" />
    </div>
  );
}

"use client";

import React from "react";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export default function ResizeHandle({ onMouseDown }: ResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="w-1.5 h-full cursor-col-resize hover:bg-admin-primary/20 transition-colors shrink-0 bg-admin-text/5 active:bg-admin-primary/40 group flex items-center justify-center z-10"
    >
      <div className="w-px h-10 bg-admin-text/10 group-hover:bg-admin-primary/40 transition-colors" />
    </div>
  );
}

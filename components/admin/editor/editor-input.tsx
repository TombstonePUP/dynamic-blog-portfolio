"use client";

interface EditorInputProps {
  content: string;
  onChange: (value: string) => void;
  isSplit: boolean;
  editorWidth: number;
}

export default function EditorInput({
  content,
  onChange,
  isSplit,
  editorWidth,
}: EditorInputProps) {
  return (
    <div
      className={`flex flex-col transition-all duration-75 w-full overflow-y-auto ${!isSplit ? "items-center" : ""}`}
      style={{ width: isSplit ? editorWidth : "100%" }}
    >
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start writing your story..."
        className={`flex-1 p-10 font-mono text-sm leading-relaxed resize-none focus:outline-none bg-transparent select-text ${!isSplit ? "max-w-7xl w-full" : "w-full"}`}
        spellCheck={false}
      />
    </div>
  );
}

"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { tags as t } from "@lezer/highlight";
import { createTheme } from "@uiw/codemirror-themes";
import { EditorView } from "@codemirror/view";

export interface CodeMirrorInputRef {
  insertText: (text: string) => void;
  getContent: () => string;
}

interface CodeMirrorInputProps {
  content: string;
  onChange: (value: string) => void;
  editorWidth?: number;
}

const adminTheme = createTheme({
  theme: "light",
  settings: {
    background: "transparent",
    foreground: "var(--color-admin-text)",
    caret: "var(--color-admin-accent)",
    selection: "var(--color-admin-accent)",
    selectionMatch: "var(--color-admin-muted)",
    lineHighlight: "transparent",
    gutterBackground: "transparent",
    gutterForeground: "var(--color-admin-muted)",
  },
  styles: [
    { tag: t.heading1, fontSize: "1.6em", fontWeight: "bold", color: "var(--color-admin-heading)" },
    { tag: t.heading2, fontSize: "1.4em", fontWeight: "bold", color: "var(--color-admin-heading)" },
    { tag: t.heading3, fontSize: "1.2em", fontWeight: "bold", color: "var(--color-admin-heading)" },
    { tag: t.keyword, color: "var(--color-admin-accent)", fontWeight: "bold" },
    { tag: t.comment, color: "var(--color-admin-muted)", fontStyle: "italic" },
    { tag: t.url, color: "var(--color-admin-info)", textDecoration: "underline" },
    { tag: t.link, color: "var(--color-admin-info)", textDecoration: "underline" },
    { tag: t.strong, fontWeight: "bold", color: "var(--color-admin-heading)" },
    { tag: t.emphasis, fontStyle: "italic", color: "var(--color-admin-text)" },
    { tag: t.strikethrough, textDecoration: "line-through", color: "var(--color-admin-muted)" },
    { tag: t.list, color: "var(--color-admin-text)" },
    { tag: t.meta, color: "var(--color-admin-muted)" },
  ],
});

const CodeMirrorInput = forwardRef<CodeMirrorInputRef, CodeMirrorInputProps>(
  ({ content, onChange, editorWidth }, ref) => {
    const editorRef = useRef<ReactCodeMirrorRef>(null);

    useImperativeHandle(ref, () => ({
      insertText: (text: string) => {
        if (editorRef.current?.view) {
          const view = editorRef.current.view;
          const selection = view.state.selection.main;
          view.dispatch({
            changes: {
              from: selection.from,
              to: selection.to,
              insert: text,
            },
            selection: { anchor: selection.from + text.length },
          });
          view.focus();
        }
      },
      getContent: () => content,
    }));

    return (
      <div 
        className={`overflow-hidden border-r bg-admin-surface font-mono ${editorWidth ? "md:shrink-0 flex-1 md:flex-none" : "flex-1"}`}
        style={editorWidth ? { flexBasis: editorWidth, width: "100%" } : {}}
      >
        <CodeMirror
          ref={editorRef}
          value={content}
          height="100%"
          theme={adminTheme}
          extensions={[
            markdown({ base: markdownLanguage, codeLanguages: languages }),
            EditorView.lineWrapping,
          ]}
          onChange={(value) => onChange(value)}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
          }}
          className="h-full text-[13px]"
        />
      </div>
    );
  }
);

CodeMirrorInput.displayName = "CodeMirrorInput";

export default CodeMirrorInput;

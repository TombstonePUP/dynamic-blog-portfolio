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
    background: "#ffffff",
    foreground: "#3a332f",
    caret: "#1f3d39",
    selection: "#1f3d3920",
    selectionMatch: "#1f3d3930",
    lineHighlight: "#f7f2ea50",
    gutterBackground: "#f7f2ea",
    gutterForeground: "#3a332f50",
  },
  styles: [
    { tag: t.heading1, fontSize: "1.6em", fontWeight: "bold", color: "#1f3d39" },
    { tag: t.heading2, fontSize: "1.4em", fontWeight: "bold", color: "#1f3d39" },
    { tag: t.heading3, fontSize: "1.2em", fontWeight: "bold", color: "#1f3d39" },
    { tag: t.keyword, color: "#1f3d39", fontWeight: "bold" },
    { tag: t.comment, color: "#7b6f64", fontStyle: "italic" },
    { tag: t.url, color: "#2b776a", textDecoration: "underline" },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.link, color: "#1f3d39", textDecoration: "underline" },
    { tag: t.strikethrough, textDecoration: "line-through" },
    { tag: t.meta, color: "#7b6f64" },
    { tag: t.link, color: "#1f3d39" },
    { tag: t.atom, color: "#b4534a" },
    { tag: t.bool, color: "#b4534a" },
    { tag: t.number, color: "#b4534a" },
    { tag: t.string, color: "#2b776a" },
    { tag: t.variableName, color: "#3a332f" },
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
        className={`overflow-hidden border-r bg-white font-mono ${editorWidth ? "shrink-0" : "flex-1"}`}
        style={editorWidth ? { width: editorWidth } : {}}
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

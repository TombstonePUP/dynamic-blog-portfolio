"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";

export interface CodeMirrorInputRef {
  insertText: (text: string) => void;
  getContent: () => string;
}

interface CodeMirrorInputProps {
  content: string;
  onChange: (value: string) => void;
  editorWidth: number;
}

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
        className="flex-1 overflow-hidden border-r bg-white"
        style={{ width: editorWidth }}
      >
        <CodeMirror
          ref={editorRef}
          value={content}
          height="100%"
          theme="light"
          extensions={[
            markdown({ base: markdownLanguage, codeLanguages: languages }),
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

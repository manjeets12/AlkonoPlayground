import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import styles from "./Editor.module.css";

type Props = {
  code: string;
  onChange: (value: string) => void;
};

export default function Editor({ code, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Initial mount
  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: code,
      extensions: [
        basicSetup,
        javascript({
          jsx: true,
          typescript: true,
        }),

        // 🎨 THEME
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px",
            backgroundColor: "#0b1220",
            color: "#e5e7eb",
            textAlign: "left", // Force left alignment here
          },

          ".cm-editor": {
            height: "100%",
          },

          ".cm-scroller": {
            padding: "16px",
            lineHeight: "1.6",
          },

          ".cm-content": {
            fontFamily: "Menlo, Monaco, Consolas, monospace",
            caretColor: "#22c55e",
            maxWidth: "900px",
          },

          ".cm-cursor": {
            borderLeftColor: "#22c55e",
          },

          ".cm-gutters": {
            backgroundColor: "#020617",
            color: "#64748b",
            borderRight: "1px solid #1e293b",
          },

          ".cm-activeLine": {
            backgroundColor: "rgba(255,255,255,0.04)",
          },
        }),

        EditorView.lineWrapping,

        // 🔁 Sync back to React
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => view.destroy();
  }, []);

  // 🔄 Sync React → Editor (important for Prettier)
  useEffect(() => {
    if (!viewRef.current) return;

    const current = viewRef.current.state.doc.toString();

    if (current !== code) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: current.length,
          insert: code,
        },
      });
    }
  }, [code]);

  return <div ref={editorRef} className={styles.editorContainer} />;
}

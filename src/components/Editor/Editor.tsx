import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { Compartment } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { THEMES } from "../../utils/editorThemes";
import type { ThemeId } from "../../utils/editorThemes";
import styles from "./Editor.module.css";

type Props = {
  code: string;
  theme: ThemeId;
  onChange: (value: string) => void;
};

// ── Compartments ───────────────────────────────────────────────────────────
const themeConfig = new Compartment();

export default function Editor({ code, theme, onChange }: Props) {
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

        // 🎨 THEME (Dynamic via Compartment)
        themeConfig.of(THEMES[theme].extension),

        // 🏗 Base Base View Styling
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "14px",
            textAlign: "left",
          },
          ".cm-editor": { height: "100%" },
          ".cm-scroller": {
            padding: "16px",
            lineHeight: "1.6",
          },
          ".cm-content": {
            fontFamily: "Menlo, Monaco, Consolas, monospace",
            maxWidth: "900px",
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

  // 🔄 Sync React → Theme (Dynamic Reconfiguration)
  useEffect(() => {
    if (!viewRef.current) return;

    viewRef.current.dispatch({
      effects: themeConfig.reconfigure(THEMES[theme].extension),
    });
  }, [theme]);

  // 🔄 Sync React → Editor Content (e.g., Prettier)
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

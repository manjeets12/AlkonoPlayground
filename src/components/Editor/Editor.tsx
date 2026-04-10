import { useEffect, useRef, useMemo } from "react";
import { EditorView, basicSetup } from "codemirror";
import { Compartment } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { syntaxTree } from "@codemirror/language";
import { linter, lintGutter } from "@codemirror/lint";
import { THEMES } from "../../utils/editorThemes";
import type { ThemeId } from "../../utils/editorThemes";
import type { DifficultyMode } from "../../types/settings";
import styles from "./Editor.module.css";

type Props = {
  code: string;
  theme: ThemeId;
  mode: DifficultyMode;
  onChange: (value: string) => void;
};

// ── Compartments ───────────────────────────────────────────────────────────
const themeConfig = new Compartment();
const languageConfig = new Compartment();
const lintConfig = new Compartment();

export default function Editor({ code, theme, mode, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  // ── Linter: Simple Syntax Error Detection ──────────────────────────────────
  const simpleSyntaxLinter = useMemo(() => linter((view) => {
    if (mode !== "easy") return [];
    
    const diagnostics: any[] = [];
    syntaxTree(view.state).iterate({
      enter: (node) => {
        if (node.type.isError) {
          diagnostics.push({
            from: node.from,
            to: node.to,
            severity: "error",
            message: "Syntax error",
          });
        }
      },
    });
    return diagnostics;
  }), [mode]);

  // Initial mount
  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      basicSetup,
      lintGutter(),
      
      // 🎨 THEME (Dynamic via Compartment)
      themeConfig.of(THEMES[theme].extension),

      // 🏗 Language (Dynamic via Compartment)
      languageConfig.of(mode === "hard" ? [] : javascript({
        jsx: true,
        typescript: true,
      })),

      // 🔍 Linting (Dynamic via Compartment)
      lintConfig.of(mode === "easy" ? simpleSyntaxLinter : []),

      // 🏗 Base View Styling
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
    ];

    const view = new EditorView({
      doc: code,
      extensions,
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

  // 🔄 Sync React → Mode (Dynamic Reconfiguration)
  useEffect(() => {
    if (!viewRef.current) return;

    viewRef.current.dispatch({
      effects: [
        languageConfig.reconfigure(mode === "hard" ? [] : javascript({
          jsx: true,
          typescript: true,
        })),
        lintConfig.reconfigure(mode === "easy" ? simpleSyntaxLinter : []),
      ],
    });
  }, [mode, simpleSyntaxLinter]);

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

import { EditorView } from "codemirror";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

export type ThemeId = "dark" | "light" | "midnight";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  extension: any[];
}

// ── Dark Theme (Default) ──────────────────────────────────────────────────
const darkTheme = EditorView.theme({
  "&": {
    backgroundColor: "#0b1220",
    color: "#e5e7eb",
  },
  ".cm-gutters": {
    backgroundColor: "#020617",
    color: "#64748b",
    borderRight: "1px solid #1e293b",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  ".cm-cursor": {
    borderLeftColor: "#22c55e",
  },
}, { dark: true });

const darkHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: t.keyword, color: "#c678dd" },
  { tag: t.variableName, color: "#e06c75" },
  { tag: t.propertyName, color: "#61afef" },
  { tag: t.string, color: "#98c379" },
  { tag: t.comment, color: "#5c6370", fontStyle: "italic" },
  { tag: t.number, color: "#d19a66" },
  { tag: t.function(t.variableName), color: "#61afef" },
  { tag: t.className, color: "#e5c07b" },
]));

// ── Light Theme ───────────────────────────────────────────────────────────
const lightTheme = EditorView.theme({
  "&": {
    backgroundColor: "#ffffff",
    color: "#24292e",
  },
  ".cm-gutters": {
    backgroundColor: "#f6f8fa",
    color: "#6a737d",
    borderRight: "1px solid #e1e4e8",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  ".cm-cursor": {
    borderLeftColor: "#24292e",
  },
}, { dark: false });

const lightHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: t.keyword, color: "#d73a49" },
  { tag: t.variableName, color: "#e36209" },
  { tag: t.propertyName, color: "#005cc5" },
  { tag: t.string, color: "#032f62" },
  { tag: t.comment, color: "#6a737d", fontStyle: "italic" },
  { tag: t.number, color: "#005cc5" },
  { tag: t.function(t.variableName), color: "#6f42c1" },
]));

// ── Midnight Ocean Theme ──────────────────────────────────────────────────
const midnightTheme = EditorView.theme({
  "&": {
    backgroundColor: "#011627",
    color: "#d6deeb",
  },
  ".cm-gutters": {
    backgroundColor: "#01111d",
    color: "#4b6479",
    borderRight: "1px solid #1d3b53",
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(2, 137, 255, 0.08)",
  },
  ".cm-cursor": {
    borderLeftColor: "#ecc48d",
  },
}, { dark: true });

const midnightHighlight = syntaxHighlighting(HighlightStyle.define([
  { tag: t.keyword, color: "#c792ea" },
  { tag: t.variableName, color: "#82aaff" },
  { tag: t.propertyName, color: "#addb67" },
  { tag: t.string, color: "#ecc48d" },
  { tag: t.comment, color: "#637777", fontStyle: "italic" },
  { tag: t.number, color: "#f78c6c" },
  { tag: t.function(t.variableName), color: "#82aaff" },
]));

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  dark: {
    id: "dark",
    name: "Dark Default",
    extension: [darkTheme, darkHighlight],
  },
  light: {
    id: "light",
    name: "Light Minimal",
    extension: [lightTheme, lightHighlight],
  },
  midnight: {
    id: "midnight",
    name: "Midnight Ocean",
    extension: [midnightTheme, midnightHighlight],
  },
};

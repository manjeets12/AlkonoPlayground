import { useState } from "react";
import FileExplorer from "../components/FileExplorer";
import type { FileMap } from "../hooks/useFileSystem";

interface LeftPanelProps {
  files: FileMap;
  activeFile: string;
  problem?: string;
  onOpen: (path: string) => void;
  onCreate: (path: string) => void;
  onDelete: (path: string) => void;
  onRename: (oldPath: string, newPath: string) => void;
}

export default function LeftPanel({
  files,
  activeFile,
  problem,
  onOpen,
  onCreate,
  onDelete,
  onRename,
}: LeftPanelProps) {
  const [problemOpen, setProblemOpen] = useState(false);

  return (
    <aside
      style={{
        flex: 0.2,
        background: "#0a0f1e",
        borderRight: "1px solid #1e2d4a",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── Problem statement ─────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid #1e2d4a" }}>
        <button
          onClick={() => setProblemOpen((v) => !v)}
          aria-expanded={problemOpen}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "0 12px",
            height: 32,
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span style={sectionLabelStyle}>Problem</span>
          <span
            style={{
              ...sectionLabelStyle,
              transition: "transform 0.2s",
              transform: problemOpen ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            ▶
          </span>
        </button>

        {problemOpen && (
          <div
            style={{
              padding: "8px 12px 12px",
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            <pre
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 11,
                color: "#8899bb",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {problem ?? "No problem statement provided."}
            </pre>
          </div>
        )}
      </div>

      {/* ── File explorer ────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid #1e2d4a", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            height: 32,
          }}
        >
          <span style={sectionLabelStyle}>Explorer</span>
        </div>
      </div>

      <FileExplorer
        files={files}
        activeFile={activeFile}
        onOpen={onOpen}
        onCreate={onCreate}
        onDelete={onDelete}
        onRename={onRename}
      />
    </aside>
  );
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#445577",
};

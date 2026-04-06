import { useState } from "react";
import FileExplorer from "../../components/FileExplorer";
import type { FileMap } from "../../hooks/useFileSystem";
import styles from "./LeftPanel.module.css";

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
    <aside className={styles.aside}>
      {/* ── Problem statement ─────────────────────────────────────────── */}
      <div className={styles.section}>
        <button
          onClick={() => setProblemOpen((v) => !v)}
          aria-expanded={problemOpen}
          className={styles.sectionButton}
        >
          <span className={styles.sectionLabel}>Problem</span>
          <span
            className={styles.sectionChevron}
            style={{
              transform: problemOpen ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            ▶
          </span>
        </button>

        {problemOpen && (
          <div className={styles.sectionContent}>
            <pre className={styles.problemText}>
              {problem ?? "No problem statement provided."}
            </pre>
          </div>
        )}
      </div>

      {/* ── File explorer ────────────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.explorerHeader}>
          <span className={styles.sectionLabel}>Explorer</span>
        </div>
      </div>

      <div className={styles.explorerScroll}>
        <FileExplorer
          files={files}
          activeFile={activeFile}
          onOpen={onOpen}
          onCreate={onCreate}
          onDelete={onDelete}
          onRename={onRename}
        />
      </div>
    </aside>
  );
}

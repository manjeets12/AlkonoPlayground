import { useState } from "react";
import FileExplorer from "../../components/FileExplorer";
import ProblemViewer from "../../components/ProblemViewer/ProblemViewer";
import type { FileMap, Directories } from "../../types/framework";
import styles from "./LeftPanel.module.css";

interface LeftPanelProps {
  files: FileMap;
  directories: Directories;
  activeFile: string;
  isReadOnly: (path: string) => boolean;
  onOpen: (path: string) => void;
  onCreate: (path: string) => void;
  onDelete: (path: string) => void;
  onRename: (oldPath: string, newPath: string) => void;
}

type TabType = "problem" | "files";

export default function LeftPanel({
  files,
  directories,
  activeFile,
  isReadOnly,
  onOpen,
  onCreate,
  onDelete,
  onRename,
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("problem");

  return (
    <aside className={styles.aside}>
      {/* ── Tab Header ────────────────────────────────────────────── */}
      <nav className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === "problem" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("problem")}
        >
          Problem
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "files" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("files")}
        >
          Files
        </button>
      </nav>

      {/* ── Content Area ─────────────────────────────────────────── */}
      <div className={styles.content}>
        {activeTab === "problem" && (
          <ProblemViewer />
        )}

        {activeTab === "files" && (
          <div className={styles.explorerWrapper}>
            <div className={styles.explorerScroll}>
              <FileExplorer
                files={files}
                directories={directories}
                activeFile={activeFile}
                isReadOnly={isReadOnly}
                onOpen={onOpen}
                onCreate={onCreate}
                onDelete={onDelete}
                onRename={onRename}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

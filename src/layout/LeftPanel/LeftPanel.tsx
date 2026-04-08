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
  return (
    <aside className={styles.aside}>
      <ProblemViewer />

      {/* ── File explorer ────────────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.explorerHeader}>
          <span className={styles.sectionLabel}>Explorer</span>
        </div>
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
    </aside>
  );
}

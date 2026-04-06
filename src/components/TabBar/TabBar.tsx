interface TabBarProps {
  openTabs: string[];
  activeFile: string;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
}

import styles from "./TabBar.module.css";

export default function TabBar({
  openTabs,
  activeFile,
  onSelect,
  onClose,
}: TabBarProps) {
  if (openTabs.length === 0) return null;

  return (
    <div className={styles.container} role="tablist">
      {openTabs.map((path) => {
        const filename = path.split("/").pop() ?? path;
        const dotIndex = filename.lastIndexOf(".");
        const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
        const ext = dotIndex > 0 ? filename.slice(dotIndex) : "";
        const isActive = path === activeFile;

        return (
          <div
            key={path}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onClick={() => onSelect(path)}
            onKeyDown={(e) => e.key === "Enter" && onSelect(path)}
            className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
          >
            <span className={styles.tabName}>{base}</span>
            <span className={styles.tabExt}>{ext}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(path);
              }}
              aria-label={`Close ${filename}`}
              className={styles.closeButton}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

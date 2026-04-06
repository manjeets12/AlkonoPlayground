import type { ReactNode } from "react";
import type { ExecutionStatus } from "../../hooks/useExecutor";
import styles from "./MainLayout.module.css";

interface MainLayoutProps {
  leftPanel?: ReactNode;
  editor: ReactNode;
  rightPanel?: ReactNode;
  status: ExecutionStatus;
}

export default function MainLayout({
  leftPanel,
  editor,
  rightPanel,
  status,
}: MainLayoutProps) {
  const statusColorClass =
    status === "running"
      ? styles.statusRunning
      : status === "success"
        ? styles.statusSuccess
        : styles.statusError;

  return (
    <div className={styles.root}>
      {/* ── Titlebar ────────────────────────────────────────────────── */}
      <header className={styles.header}>
        {/* Brand */}
        <span className={styles.brand}>
          <span className={styles.brandDot} />
          RN Playground
        </span>

        <span className={styles.headerSpacer} />

        {/* Status indicator in titlebar */}
        <div className={styles.statusContainer}>
          {status !== "idle" && (
            <span className={`${styles.statusText} ${statusColorClass}`}>
              {status === "running"
                ? "● building"
                : status === "success"
                  ? "✓ ready"
                  : "✕ error"}
            </span>
          )}
        </div>
      </header>

      {/* ── Three-column body ────────────────────────────────────────── */}
      <div className={styles.body}>
        {/* Left: file explorer + problem */}
        {leftPanel}

        {/* Center: tab bar + editor */}
        <main className={styles.main}>{editor}</main>

        {/* Right: run bar + preview + logs */}
        {rightPanel}
      </div>
    </div>
  );
}

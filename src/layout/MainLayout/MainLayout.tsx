import type { ReactNode } from "react";
import type { ExecutionStatus } from "../../hooks/useExecutor";
import styles from "./MainLayout.module.css";

interface MainLayoutProps {
  leftPanel?: ReactNode;
  editor: ReactNode;
  rightPanel?: ReactNode;
  bottomPanel?: ReactNode;
  footer?: ReactNode;
  status: ExecutionStatus;
}

export default function MainLayout({
  leftPanel,
  editor,
  rightPanel,
  bottomPanel,
  footer,
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

      {/* ── Main body ────────────────────────────────────────── */}
      <div className={styles.body}>
        {/* Container for Left and Center (Editor + Logs) */}
        <div className={styles.centerContainer}>
          <div className={styles.upperArea}>
            {leftPanel}
            <main className={styles.main}>{editor}</main>
          </div>
          {bottomPanel}
        </div>

        {/* Right: run bar + preview */}
        {rightPanel}
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      {footer}
    </div>
  );
}


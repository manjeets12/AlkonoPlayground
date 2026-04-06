import { forwardRef } from "react";
import Preview from "../../components/Preview";
import Logs from "../../components/Logs";
import type { ExecutionStatus, LogEntry } from "../../hooks/useExecutor";
import styles from "./RightPanel.module.css";

interface RightPanelProps {
  status: ExecutionStatus;
  logs: LogEntry[];
  isStale: boolean;
  lastRanAt: number | null;
  onRun: () => void;
  onClearLogs: () => void;
}

const STATUS_CONFIG: Record<
  ExecutionStatus,
  { label: string; className: string }
> = {
  idle: { label: "idle", className: styles.statusBadgeIdle },
  running: { label: "running", className: styles.statusBadgeRunning },
  success: { label: "success", className: styles.statusBadgeSuccess },
  error: { label: "error", className: styles.statusBadgeError },
};

/**
 * iframeRef is forwarded through RightPanel → Preview so that App can pass
 * it to useExecutor without Preview needing to know about execution logic.
 */
const RightPanel = forwardRef<HTMLIFrameElement, RightPanelProps>(
  function RightPanel(
    { status, logs, isStale, lastRanAt, onRun, onClearLogs },
    ref,
  ) {
    const isRunning = status === "running";
    const sc = STATUS_CONFIG[status];

    return (
      <div className={styles.root}>
        {/* ── Run bar ───────────────────────────────────────────────── */}
        <div className={styles.runBar}>
          {/* Run / Stop button */}
          <button
            onClick={onRun}
            disabled={isRunning}
            className={styles.runButton}
          >
            {/* Play triangle / loading square */}
            <span className={isRunning ? styles.stopIcon : styles.runIcon} />
            {isRunning ? "Running…" : "Run"}
          </button>

          {/* Stale indicator — code changed since last run */}
          {isStale && (
            <span className={styles.staleIndicator}>● unsaved changes</span>
          )}

          {/* Spacer */}
          <span className={styles.spacer} />

          {/* Execution status pill */}
          <span className={`${styles.statusBadge} ${sc.className}`}>
            {/* Pip */}
            <span className={styles.statusPip} />
            {sc.label}
          </span>
        </div>

        {/* ── Preview header ────────────────────────────────────────── */}
        <div className={styles.previewHeader}>Preview</div>

        {/* ── Preview (iframe ref forwarded) ────────────────────────── */}
        <Preview ref={ref} status={status} lastRanAt={lastRanAt} />

        {/* ── Logs ──────────────────────────────────────────────────── */}
        <Logs logs={logs} onClear={onClearLogs} />
      </div>
    );
  },
);

export default RightPanel;

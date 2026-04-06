import { forwardRef } from "react";
import Preview from "../../components/Preview";
import Logs from "../../components/Logs";
import { typography } from "../../theme/typography";
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
            style={{
              opacity: isRunning ? 0.7 : 1,
              cursor: isRunning ? "not-allowed" : "pointer",
            }}
          >
            {/* Play triangle / loading square */}
            <span className={isRunning ? styles.stopIcon : styles.runIcon} />
            {isRunning ? "Running…" : "Run"}
          </button>

          {/* Stale indicator — code changed since last run */}
          {isStale && (
            <span
              style={{
                fontFamily: typography.fontFamily.mono,
                fontSize: 9,
                padding: "2px 7px",
                borderRadius: 3,
                background: "#3d2a08",
                border: "1px solid #f5a623",
                color: "#f5a623",
                letterSpacing: "0.04em",
              }}
            >
              ● unsaved changes
            </span>
          )}

          {/* Spacer */}
          <span style={{ flex: 1 }} />

          {/* Execution status pill */}
          <span className={`${styles.statusBadge} ${sc.className}`}>
            {/* Pip */}
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "currentColor",
                flexShrink: 0,
              }}
            />
            {sc.label}
          </span>
        </div>

        {/* ── Preview header ────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            height: 28,
            borderBottom: "1px solid #1e2d4a",
            flexShrink: 0,
            fontFamily: typography.fontFamily.mono,
            fontSize: 9,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#445577",
          }}
        >
          Preview
        </div>

        {/* ── Preview (iframe ref forwarded) ────────────────────────── */}
        <Preview ref={ref} status={status} lastRanAt={lastRanAt} />

        {/* ── Logs ──────────────────────────────────────────────────── */}
        <Logs logs={logs} onClear={onClearLogs} />
      </div>
    );
  },
);

export default RightPanel;

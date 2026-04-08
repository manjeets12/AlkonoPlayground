import { forwardRef } from "react";
import Preview from "../../components/Preview";
import DeviceFrame from "../../components/DeviceFrame";
import type { ExecutionStatus } from "../../hooks/useExecutor";
import type { Framework } from "../FooterBar/FooterBar";
import styles from "./RightPanel.module.css";


interface RightPanelProps {
  framework: Framework;
  status: ExecutionStatus;
  isStale: boolean;
  lastRanAt: number | null;
  onRun: () => void;
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
  function RightPanel({ framework, status, isStale, lastRanAt, onRun }, ref) {
    const isRunning = status === "running";
    const sc = STATUS_CONFIG[status];

    return (
      <div className={styles.root}>
        {/* ── Run bar ───────────────────────────────────────────────── */}
        <div className={styles.runBar}>
          <button
            onClick={onRun}
            disabled={isRunning}
            className={styles.runButton}
          >
            <span className={isRunning ? styles.stopIcon : styles.runIcon} />
            {isRunning ? "Running…" : "Run"}
          </button>

          {isStale && (
            <span className={styles.staleIndicator}>● unsaved changes</span>
          )}

          <span className={styles.spacer} />

          <span className={`${styles.statusBadge} ${sc.className}`}>
            <span className={styles.statusPip} />
            {sc.label}
          </span>
        </div>

        {/* ── Preview header ────────────────────────────────────────── */}
        <div className={styles.previewHeader}>Preview</div>

        {/* ── Preview with Device Frame ────────────────────────────── */}
        <div className={styles.previewContainer}>
          <DeviceFrame active={framework === "react-native"}>
            <Preview ref={ref} status={status} lastRanAt={lastRanAt} />
          </DeviceFrame>
        </div>
      </div>
    );
  },
);

export default RightPanel;

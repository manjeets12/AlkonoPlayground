import { forwardRef } from "react";
import type { ExecutionStatus } from "../../hooks/useExecutor";
import styles from "./Preview.module.css";

interface PreviewProps {
  status: ExecutionStatus;
  lastRanAt: number | null;
}

/**
 * Preview owns the <iframe>.
 * The ref is forwarded to App → useExecutor, which writes srcdoc directly.
 * Preview never receives `code` as a prop — that coupling is the root cause
 * of the double-fire bug (code change → prop change → useEffect → srcdoc set twice).
 */
const Preview = forwardRef<HTMLIFrameElement, PreviewProps>(function Preview(
  { status, lastRanAt },
  ref,
) {
  const neverRan = lastRanAt === null;
  const isRunning = status === "running";

  const ranTime = lastRanAt
    ? new Date(lastRanAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : null;

  return (
    <div className={styles.root}>
      {/* Iframe — srcdoc controlled externally by useExecutor */}
      <iframe
        ref={ref}
        title="preview"
        className={styles.iframe}
        sandbox="allow-scripts allow-same-origin"
      />

      {/* Idle overlay — shown before first run */}
      {status === "idle" && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <span className={styles.overlayIcon}>▷</span>
            <span className={styles.overlayText}>press run to execute</span>
          </div>
        </div>
      )}

      {/* Bundling spinner */}
      {isRunning && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <span className={styles.spinner} />
            <span className={styles.overlayText}>bundling…</span>
          </div>
        </div>
      )}

      {/* Last-run timestamp — shown in corner after successful run */}
      {ranTime && !isRunning && (
        <div className={styles.timestamp}>last run {ranTime}</div>
      )}
    </div>
  );
});

export default Preview;

import { forwardRef } from "react";
import type { ExecutionStatus } from "../hooks/useExecutor";

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
    <div
      style={{
        flex: 1,
        minHeight: 0,
        position: "relative",
        background: "#0b1220",
      }}
    >
      {/* Iframe — srcdoc controlled externally by useExecutor */}
      <iframe
        ref={ref}
        sandbox="allow-scripts"
        title="Preview"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />

      {/* Idle overlay — shown before first run */}
      {neverRan && !isRunning && (
        <div style={overlayStyle}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 28, opacity: 0.15, lineHeight: 1 }}>
              ▷
            </span>
            <span style={overlayTextStyle}>press run to execute</span>
          </div>
        </div>
      )}

      {/* Bundling spinner */}
      {isRunning && (
        <div style={overlayStyle}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={spinnerStyle} />
            <span style={overlayTextStyle}>bundling…</span>
          </div>
        </div>
      )}

      {/* Last-run timestamp — shown in corner after successful run */}
      {ranTime && !isRunning && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 10,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: "#2a3d5e",
            pointerEvents: "none",
          }}
        >
          last run {ranTime}
        </div>
      )}
    </div>
  );
});

export default Preview;

// ─── Styles ───────────────────────────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(6, 9, 18, 0.88)",
  backdropFilter: "blur(2px)",
  pointerEvents: "none",
};

const overlayTextStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 11,
  color: "#445577",
  letterSpacing: "0.04em",
};

const spinnerStyle: React.CSSProperties = {
  display: "block",
  width: 20,
  height: 20,
  border: "2px solid #1e2d4a",
  borderTopColor: "#3b7ff5",
  borderRadius: "50%",
  // Note: animation must be added via CSS class or keyframes in index.css
  // Add this to your global CSS:
  // @keyframes spin { to { transform: rotate(360deg); } }
  // .preview-spinner { animation: spin 0.7s linear infinite; }
};

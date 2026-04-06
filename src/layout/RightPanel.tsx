import { forwardRef } from "react";
import Preview from "../components/Preview";
import Logs from "../components/Logs";
import type { ExecutionStatus, LogEntry } from "../hooks/useExecutor";

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
  { label: string; color: string; bg: string; border: string }
> = {
  idle: { label: "idle", color: "#445577", bg: "#141c33", border: "#1e2d4a" },
  running: {
    label: "running",
    color: "#f5a623",
    bg: "#3d2a08",
    border: "#f5a623",
  },
  success: {
    label: "success",
    color: "#22c97a",
    bg: "#0d3d24",
    border: "#22c97a",
  },
  error: { label: "error", color: "#f5524a", bg: "#3d1410", border: "#f5524a" },
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
      <div
        style={{
          width: "42%",
          minWidth: 380,
          display: "flex",
          flexDirection: "column",
          background: "#0a0f1e",
          borderLeft: "1px solid #1e2d4a",
          flexShrink: 0,
        }}
      >
        {/* ── Run bar ───────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderBottom: "1px solid #1e2d4a",
            background: "#0f1629",
            flexShrink: 0,
          }}
        >
          {/* Run / Stop button */}
          <button
            onClick={onRun}
            disabled={isRunning}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 14px",
              background: isRunning ? "#3d2a08" : "#3b7ff5",
              color: "#fff",
              border: "none",
              cursor: isRunning ? "not-allowed" : "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.04em",
              borderRadius: 4,
              opacity: isRunning ? 0.7 : 1,
              transition: "all 0.15s",
            }}
          >
            {/* Play triangle / loading square */}
            <span
              style={
                isRunning
                  ? {
                      display: "block",
                      width: 8,
                      height: 8,
                      background: "#f5a623",
                      borderRadius: 1,
                    }
                  : {
                      display: "block",
                      borderLeft: "9px solid #fff",
                      borderTop: "5px solid transparent",
                      borderBottom: "5px solid transparent",
                    }
              }
            />
            {isRunning ? "Running…" : "Run"}
          </button>

          {/* Stale indicator — code changed since last run */}
          {isStale && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                padding: "2px 7px",
                borderRadius: 3,
                background: "#3d2a08",
                border: "1px solid #f5a623",
                color: "#f5a623",
                letterSpacing: "0.04em",
                animation: "fadeIn 0.2s ease",
              }}
            >
              ● unsaved changes
            </span>
          )}

          {/* Spacer */}
          <span style={{ flex: 1 }} />

          {/* Execution status pill */}
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "2px 8px",
              borderRadius: 3,
              background: sc.bg,
              border: `1px solid ${sc.border}`,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 500,
              color: sc.color,
              letterSpacing: "0.04em",
              transition: "all 0.2s",
            }}
          >
            {/* Pip */}
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: sc.color,
                flexShrink: 0,
                // Pulse animation on "running" — add @keyframes pulse to global CSS
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
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#445577",
            }}
          >
            Preview
          </span>
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

import { useEffect, useRef } from "react";
import type { LogEntry } from "../hooks/useExecutor";

interface LogsProps {
  logs: LogEntry[];
  onClear: () => void;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const LEVEL_COLORS: Record<
  LogEntry["level"],
  { text: string; badge: string; bg: string; border: string }
> = {
  log: {
    text: "#8899bb",
    badge: "#445577",
    bg: "transparent",
    border: "transparent",
  },
  info: {
    text: "#3b7ff5",
    badge: "#3b7ff5",
    bg: "rgba(59,127,245,0.04)",
    border: "#3b7ff5",
  },
  warn: {
    text: "#f5a623",
    badge: "#f5a623",
    bg: "rgba(245,166,35,0.04)",
    border: "#f5a623",
  },
  error: {
    text: "#f5524a",
    badge: "#f5524a",
    bg: "rgba(245,82,74,0.05)",
    border: "#f5524a",
  },
};

// ─── Log row ──────────────────────────────────────────────────────────────────

function LogRow({ entry }: { entry: LogEntry }) {
  const c = LEVEL_COLORS[entry.level];
  const time = new Date(entry.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        padding: "3px 12px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        lineHeight: 1.5,
        color: c.text,
        background: c.bg,
        borderLeft: `2px solid ${c.border}`,
        transition: "background 0.1s",
      }}
    >
      {/* Level badge */}
      <span
        style={{
          fontSize: 9,
          padding: "1px 4px",
          borderRadius: 2,
          border: `1px solid ${c.badge}`,
          color: c.badge,
          background: c.bg,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          fontWeight: 600,
          flexShrink: 0,
          minWidth: 30,
          textAlign: "center",
        }}
      >
        {entry.level === "error" ? "err" : entry.level}
      </span>

      {/* Message */}
      <span style={{ flex: 1, wordBreak: "break-all", whiteSpace: "pre-wrap" }}>
        {entry.message}
      </span>

      {/* Source file + line */}
      {entry.source && (
        <span
          style={{
            fontSize: 9,
            color: "#2a3d5e",
            flexShrink: 0,
            fontStyle: "italic",
          }}
        >
          {entry.source}
          {entry.line != null ? `:${entry.line}` : ""}
          {entry.col != null ? `:${entry.col}` : ""}
        </span>
      )}

      {/* Timestamp */}
      <span
        style={{
          fontSize: 9,
          color: "#2a3d5e",
          flexShrink: 0,
          marginLeft: "auto",
        }}
      >
        {time}
      </span>
    </div>
  );
}

// ─── Logs panel ───────────────────────────────────────────────────────────────

export default function Logs({ logs, onClear }: LogsProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever a new log is appended
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: 200,
        flexShrink: 0,
        borderTop: "1px solid #1e2d4a",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          height: 28,
          borderBottom: "1px solid #1e2d4a",
          background: "#0a0f1e",
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
          Console
        </span>

        {/* Log count badge */}
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            padding: "1px 5px",
            borderRadius: 10,
            background: "#141c33",
            color: "#445577",
            border: "1px solid #1e2d4a",
            minWidth: 18,
            textAlign: "center",
          }}
        >
          {logs.length}
        </span>

        {/* Error count — shown only when there are errors */}
        {logs.filter((l) => l.level === "error").length > 0 && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              padding: "1px 5px",
              borderRadius: 10,
              background: "#3d1410",
              color: "#f5524a",
              border: "1px solid #f5524a",
            }}
          >
            {logs.filter((l) => l.level === "error").length} error
            {logs.filter((l) => l.level === "error").length > 1 ? "s" : ""}
          </span>
        )}

        {/* Clear button */}
        <button
          onClick={onClear}
          disabled={logs.length === 0}
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "none",
            cursor: logs.length > 0 ? "pointer" : "not-allowed",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: logs.length > 0 ? "#445577" : "#2a3d5e",
            padding: "2px 6px",
            borderRadius: 3,
            opacity: logs.length > 0 ? 1 : 0.4,
            transition: "color 0.1s",
          }}
        >
          clear
        </button>
      </div>

      {/* Log entries */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Console output"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 0",
        }}
      >
        {logs.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "#2a3d5e",
            }}
          >
            no output yet
          </div>
        ) : (
          logs.map((entry) => <LogRow key={entry.id} entry={entry} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

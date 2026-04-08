import { useEffect, useRef, useState } from "react";
import type { LogEntry } from "../../hooks/useExecutor";
import styles from "./Logs.module.css";

interface LogsProps {
  logs: LogEntry[];
  onClear: () => void;
}

// ─── Log row ──────────────────────────────────────────────────────────────────

function LogRow({ entry }: { entry: LogEntry }) {
  const time = new Date(entry.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const levelClass =
    entry.level === "error"
      ? styles.logBadgeError
      : entry.level === "warn"
        ? styles.logBadgeWarn
        : entry.level === "info"
          ? styles.logBadgeInfo
          : styles.logBadgeLog;

  const messageClass =
    entry.level === "error"
      ? styles.logMessageError
      : entry.level === "warn"
        ? styles.logMessageWarn
        : entry.level === "info"
          ? styles.logMessageInfo
          : styles.logMessageLog;

  const rowClass =
    entry.level === "error"
      ? styles.logRowError
      : entry.level === "warn"
        ? styles.logRowWarn
        : entry.level === "info"
          ? styles.logRowInfo
          : "";

  return (
    <div className={`${styles.logRow} ${rowClass}`}>
      {/* Level badge */}
      <span className={`${styles.logBadge} ${levelClass}`}>
        {entry.level === "error" ? "err" : entry.level}
      </span>

      {/* Message */}
      <span className={`${styles.logMessage} ${messageClass}`}>
        {entry.message}
      </span>

      {/* Source file + line */}
      {entry.source && (
        <span className={styles.logSource}>
          {entry.source}
          {entry.line != null ? `:${entry.line}` : ""}
          {entry.col != null ? `:${entry.col}` : ""}
        </span>
      )}

      {/* Timestamp */}
      <span className={styles.logTime}>{time}</span>
    </div>
  );
}

// ─── Logs panel ───────────────────────────────────────────────────────────────

export default function Logs({ logs, onClear }: LogsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever a new log is appended
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div
      className={`${styles.root} ${!isExpanded ? styles.rootCollapsed : ""}`}
    >
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>Console</span>

        {/* Log count badge */}
        <span className={styles.logCountBadge}>{logs.length}</span>

        {/* Error count — shown only when there are errors */}
        {logs.filter((l) => l.level === "error").length > 0 && (
          <span className={styles.errorCountBadge}>
            {logs.filter((l) => l.level === "error").length} error
            {logs.filter((l) => l.level === "error").length > 1 ? "s" : ""}
          </span>
        )}

        {/* Clear button */}
        <button
          onClick={onClear}
          disabled={logs.length === 0}
          className={`${styles.clearButton} ${logs.length > 0 ? styles.clearButtonActive : styles.clearButtonDisabled}`}
        >
          clear
        </button>

        {/* Collapse button */}
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className={`${styles.clearButton} ${styles.collapseButton}`}
          title={isExpanded ? "Collapse logs" : "Expand logs"}
        >
          {isExpanded ? "▼" : "▶"}
        </button>
      </div>

      {/* Log entries */}
      {isExpanded && (
        <div
          className={styles.scroll}
          role="log"
          aria-live="polite"
          aria-label="Console output"
        >
          {logs.length === 0 ? (
            <div className={styles.empty}>no output yet</div>
          ) : (
            logs.map((entry) => <LogRow key={entry.id} entry={entry} />)
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}

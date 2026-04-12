import { useEffect, useRef, useState, useMemo } from "react";
import type { LogEntry } from "../../hooks/useExecutor";
import styles from "./Logger.module.css";

interface LogsProps {
  logs: LogEntry[];
  onClear: () => void;
}

// ─── Object Inspector Node ───────────────────────────────────────────────────

function ObjectInspector({ value, label, depth = 0 }: { value: any, label?: string, depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 1 && Object.keys(value || {}).length < 5);
  
  const isArray = Array.isArray(value);
  const keys = useMemo(() => Object.keys(value || {}), [value]);
  const typeName = isArray ? `Array(${value.length})` : (value.constructor?.name || "Object");

  if (keys.length === 0) {
    return (
      <div className={styles.inspectorNode}>
        <div className={styles.nodeHeader}>
          {label && <span className={styles.nodeKey}>{label}: </span>}
          <span className={styles.nodeType}>{isArray ? "[]" : "{}"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.inspectorNode}>
      <div className={styles.nodeHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <span className={`${styles.toggleArrow} ${isExpanded ? styles.toggleArrowExpanded : ""}`}>▶</span>
        {label && <span className={styles.nodeKey}>{label}: </span>}
        <span className={styles.nodeType}>{typeName}</span>
        {!isExpanded && <span className={styles.nodeType}> {isArray ? "[...]" : "{...}"}</span>}
      </div>
      
      {isExpanded && (
        <div className={styles.nodeChildren}>
          {keys.map(key => (
            <LogValue key={key} value={value[key]} label={key} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Log Value Renderer ──────────────────────────────────────────────────────

function LogValue({ value, label, depth = 0 }: { value: any, label?: string, depth?: number }) {
  const type = typeof value;

  if (value === null) {
    return (
      <div className={styles.logData}>
        {label && <span className={styles.nodeKey}>{label}: </span>}
        <span className={`${styles.logValue} ${styles.valNull}`}>null</span>
      </div>
    );
  }
  
  if (value === undefined) {
    return (
      <div className={styles.logData}>
        {label && <span className={styles.nodeKey}>{label}: </span>}
        <span className={`${styles.logValue} ${styles.valUndefined}`}>undefined</span>
      </div>
    );
  }

  if (type === "object") {
    if (value.__error) {
       return (
         <div className={styles.logData}>
           {label && <span className={styles.nodeKey}>{label}: </span>}
           <span className={styles.valBoolean}>{value.name}: {value.message}</span>
         </div>
       );
    }
    return <ObjectInspector value={value} label={label} depth={depth} />;
  }

  const className = 
    type === "string" ? styles.valString :
    type === "number" ? styles.valNumber :
    type === "boolean" ? styles.valBoolean : "";

  return (
    <div className={styles.logData}>
      {label && <span className={styles.nodeKey}>{label}: </span>}
      <span className={`${styles.logValue} ${className}`}>
        {type === "string" ? `"${value}"` : String(value)}
      </span>
    </div>
  );
}

// ─── Log row ──────────────────────────────────────────────────────────────────

function LogRow({ entry }: { entry: LogEntry }) {
  const time = new Date(entry.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const accentClass = styles[`accent${entry.level}` as keyof typeof styles] || styles.accentlog;
  const data = entry.data || (entry.message ? [entry.message] : []);

  return (
    <div className={styles.logRow}>
      <div className={`${styles.levelAccent} ${accentClass}`} />
      
      <span className={styles.logBadge}>
        {entry.level.toUpperCase()}
      </span>

      <div className={styles.logContent}>
        {data.map((val, i) => (
          <LogValue key={i} value={val} />
        ))}
      </div>

      <div className={styles.logTime}>
        {entry.source && (
          <span className={styles.logSource}>
            {entry.source.split("/").pop()}
            {entry.line != null ? `:${entry.line}` : ""}
          </span>
        )}
        {time}
      </div>
    </div>
  );
}

// ─── Logs panel ───────────────────────────────────────────────────────────────

export default function Logs({ logs, onClear }: LogsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  return (
    <div className={`${styles.root} ${!isExpanded ? styles.rootCollapsed : ""}`}>
      <div className={styles.header} onClick={() => !isExpanded && setIsExpanded(true)}>
        <span className={styles.title}>Console</span>
        <span className={styles.logCountBadge}>{logs.length}</span>
        
        {logs.filter((l) => l.level === "error").length > 0 && (
          <span className={styles.errorCountBadge}>
            {logs.filter((l) => l.level === "error").length}
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          disabled={logs.length === 0}
          aria-label="Clear console logs"
          className={styles.clearButton}
        >
          clear
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setIsExpanded((v) => !v); }}
          aria-label={isExpanded ? "Collapse console" : "Expand console"}
          className={`${styles.clearButton} ${styles.collapseButton}`}
        >
          {isExpanded ? "▼" : "▲"}
        </button>
      </div>

      {isExpanded && (
        <div className={styles.scroll} role="log" aria-live="polite">
          {logs.length === 0 ? (
            <div className={styles.empty}>No output yet</div>
          ) : (
            logs.map((entry) => <LogRow key={entry.id} entry={entry} />)
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}


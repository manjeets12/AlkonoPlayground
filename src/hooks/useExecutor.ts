import { useEffect, useRef, useState, useCallback } from "react";
import type { FileMap, Framework } from "../types/framework";
import { buildExecutionIframe, buildErrorIframe } from "../templates/execution/iframe";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExecutionStatus = "idle" | "running" | "success" | "error";

export interface LogEntry {
  id: string;
  level: "log" | "warn" | "error" | "info";
  message: string;
  source?: string;
  line?: number;
  col?: number;
  timestamp: number;
}

export interface BundleError {
  message: string;
  file?: string;
  line?: number;
  col?: number;
}

interface WorkerSuccessMessage {
  type: "success";
  code: string;
  warnings: BundleError[];
}

interface WorkerErrorMessage {
  type: "error";
  errors: BundleError[];
}

type WorkerMessage = WorkerSuccessMessage | WorkerErrorMessage;

// ─── Hook ─────────────────────────────────────────────────────────────────────

let logIdCounter = 0;
function newLogId() {
  return `log-${++logIdCounter}`;
}

export function useExecutor(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
) {
  const workerRef = useRef<Worker | null>(null);
  const runIdRef = useRef<number>(0);
  const frameworkRef = useRef<Framework>("react-native");

  const [status, setStatus] = useState<ExecutionStatus>("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [bundleErrors, setBundleErrors] = useState<BundleError[]>([]);
  const [isStale, setIsStale] = useState(false);
  const [lastRanAt, setLastRanAt] = useState<number | null>(null);

  // ── Worker lifecycle ────────────────────────────────────────────────────────
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../worker/executor.worker.ts", import.meta.url),
      { type: "module" },
    );

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  // ── iframe → parent message listener ────────────────────────────────────────
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) {
        return;
      }

      const msg = e.data;
      if (!msg || !msg.type) return;

      const level: LogEntry["level"] = ["log", "warn", "error", "info"].includes(msg.type)
        ? msg.type
        : "error";

      setLogs((prev) => [
        ...prev,
        {
          id: newLogId(),
          level,
          message: msg.data ?? String(msg),
          source: msg.source,
          line: msg.line,
          col: msg.col,
          timestamp: Date.now(),
        },
      ]);
    }

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [iframeRef]);

  // ── Run ─────────────────────────────────────────────────────────────────────

  const run = useCallback(
    (
      files: FileMap,
      framework: Framework = "react-native",
      entryPoint = "App.tsx",
    ) => {
      const worker = workerRef.current;
      if (!worker) return;

      const thisRunId = ++runIdRef.current;
      frameworkRef.current = framework;

      setStatus("running");
      setLogs([]);
      setBundleErrors([]);
      setIsStale(false);

      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write("<!DOCTYPE html><html><body></body></html>");
          doc.close();
        }
      }

      worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        if (thisRunId !== runIdRef.current) return;

        const msg = e.data;

        if (msg.type === "success") {
          // Log warnings
          if (msg.warnings.length > 0) {
            setLogs((prev) => [
              ...prev,
              ...msg.warnings.map((w) => ({
                id: newLogId(),
                level: "warn" as const,
                message: w.message,
                source: w.file,
                line: w.line,
                timestamp: Date.now(),
              })),
            ]);
          }

          const html = buildExecutionIframe(msg.code, framework);

          if (iframeRef.current) {
            const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
            if (doc) {
              doc.open();
              doc.write(html);
              doc.close();
            }
          }

          setStatus("success");
          setLastRanAt(Date.now());
        } else {
          // Bundle errors
          const formattedErrors = msg.errors
            .map((err) => `${err.file ? err.file + (err.line ? `:${err.line}` : "") : "Error"}\n${err.message}`)
            .join("\n\n");

          if (iframeRef.current) {
            const errorHtml = buildErrorIframe(formattedErrors);
            const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
            if (doc) {
              doc.open();
              doc.write(errorHtml);
              doc.close();
            }
          }

          setBundleErrors(msg.errors);
          setLogs((prev) => [
            ...prev,
            ...msg.errors.map((err) => ({
              id: newLogId(),
              level: "error" as const,
              message: err.message,
              source: err.file,
              line: err.line,
              col: err.col,
              timestamp: Date.now(),
            })),
          ]);
          setStatus("error");
        }
      };

      worker.onerror = (e) => {
        if (thisRunId !== runIdRef.current) return;
        const msg = `Worker error: ${e.message}`;
        if (iframeRef.current) {
          const errorHtml = buildErrorIframe(msg);
          const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
          if (doc) {
            doc.open();
            doc.write(errorHtml);
            doc.close();
          }
        }
        setLogs((prev) => [
          ...prev,
          {
            id: newLogId(),
            level: "error",
            message: msg,
            timestamp: Date.now(),
          },
        ]);
        setStatus("error");
      };

      worker.postMessage({ files, framework, entryPoint });
    },
    [iframeRef],
  );

  const markStale = useCallback(() => setIsStale(true), []);
  const clearLogs = useCallback(() => setLogs([]), []);

  return {
    run,
    markStale,
    clearLogs,
    status,
    logs,
    bundleErrors,
    isStale,
    lastRanAt,
  };
}


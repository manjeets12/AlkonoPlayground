import { useEffect, useRef, useState, useCallback } from "react";
import type { FileMap } from "./useFileSystem";
import { getConsoleProxyScript } from "../utils/consoleProxy";

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

// ─── iframe HTML builder ──────────────────────────────────────────────────────

/**
 * Wraps the bundled IIFE code in a full HTML document.
 *
 * Global mapping (CDN → window globals that esbuild externalized):
 *   react             → window.React
 *   react-dom         → window.ReactDOM
 *   react-native-web  → window.ReactNativeWeb
 *   react/jsx-runtime → resolved from window.React automatically
 *
 * The IIFE output from esbuild assigns to window.App (globalName: "App").
 * After it runs, we mount window.App.default (or window.App if no .default).
 */
function buildIframeHTML(bundledCode: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0b1220; height: 100vh; overflow: hidden; }
    #root { height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- CDN globals — must load before user bundle -->
  <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-native-web@0.19.13/dist/index.js"></script>

  <script>
    // Map esbuild externals to CDN globals
    window.__esbuild_globals__ = {
      "react":            window.React,
      "react-dom":        window.ReactDOM,
      "react-native-web": window.ReactNativeWeb,
      "react/jsx-runtime": window.React, // fallback; esbuild uses React.createElement with automatic runtime
    };

    // Console + error capture — must run before user code
    ${getConsoleProxyScript()}
  </script>

  <script>
    // User bundle (IIFE, assigns to window.App)
    ${bundledCode}
  </script>

  <script>
    // Mount
    try {
      const AppComponent =
        (window.App && window.App.default) ||
        window.App ||
        null;

      if (!AppComponent) {
        throw new Error(
          'No default export found. Make sure App.tsx has: export default function App() { ... }'
        );
      }

      const rootEl = document.getElementById('root');
      const reactRoot = window.ReactDOM.createRoot(rootEl);
      reactRoot.render(window.React.createElement(AppComponent));
    } catch (err) {
      window.parent.postMessage(
        { type: 'error', data: err.name + ': ' + err.message },
        '*'
      );
    }
  </script>
</body>
</html>`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

let logIdCounter = 0;
function newLogId() {
  return `log-${++logIdCounter}`;
}

export function useExecutor(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
) {
  const workerRef = useRef<Worker | null>(null);
  const runIdRef = useRef(0); // incremented on every run; lets us discard stale worker messages

  const [status, setStatus] = useState<ExecutionStatus>("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [bundleErrors, setBundleErrors] = useState<BundleError[]>([]);
  const [isStale, setIsStale] = useState(false);
  const [lastRanAt, setLastRanAt] = useState<number | null>(null);

  // ── Worker lifecycle ────────────────────────────────────────────────────────
  // Instantiate once; terminate on unmount.

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
  // Registered once; guards on iframe source to prevent foreign messages.

  useEffect(() => {
    function handler(e: MessageEvent) {
      // Only accept messages from our iframe
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) {
        return;
      }

      const msg = e.data;
      if (!msg || !msg.type) return;

      const level: LogEntry["level"] = [
        "log",
        "warn",
        "error",
        "info",
      ].includes(msg.type)
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
  }, [iframeRef]); // iframeRef is stable, so this runs once

  // ── Run ─────────────────────────────────────────────────────────────────────

  const run = useCallback(
    (files: FileMap, entryPoint = "App.tsx") => {
      const worker = workerRef.current;
      if (!worker) return;

      // Capture current run ID to detect if a newer run starts before this one finishes
      const thisRunId = ++runIdRef.current;

      setStatus("running");
      setLogs([]);
      setBundleErrors([]);
      setIsStale(false);

      // Clear preview while bundling
      if (iframeRef.current) {
        iframeRef.current.srcdoc = "";
      }

      worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        // Discard if a newer run has started
        if (thisRunId !== runIdRef.current) return;

        const msg = e.data;

        if (msg.type === "success") {
          // Surface bundle warnings as log entries
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

          const html = buildIframeHTML(msg.code);

          if (iframeRef.current) {
            iframeRef.current.srcdoc = html;
          }

          setStatus("success");
          setLastRanAt(Date.now());
        } else {
          // Bundle errors
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
        setLogs((prev) => [
          ...prev,
          {
            id: newLogId(),
            level: "error",
            message: `Worker error: ${e.message}`,
            timestamp: Date.now(),
          },
        ]);
        setStatus("error");
      };

      worker.postMessage({ files, entryPoint });
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

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
function buildErrorIframeHTML(errorMessage: string): string {
  const safeMessage = errorMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0b1220; height: 100vh; overflow: hidden; }
    #error-overlay {
      display: flex;
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(220, 38, 38, 0.95);
      color: #fff;
      font-family: Menlo, Monaco, Consolas, monospace;
      padding: 20px;
      z-index: 9999;
      white-space: pre-wrap;
      overflow: auto;
      flex-direction: column;
    }
  </style>
</head>
<body>
  <div id="error-overlay">${safeMessage}</div>
</body>
</html>`;
}

function buildIframeHTML(
  bundledCode: string,
  framework: "react" | "react-native",
): string {
  const isRN = framework === "react-native";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>
    html, body, #root { 
      height: 100%; width: 100%; margin: 0; padding: 0; 
      background: #0b1220; color: #ffffff; 
      display: flex; flex-direction: column;
      overflow: hidden;
    }
    #error-overlay {
      display: none; position: fixed; inset: 0;
      background: #7f1d1d; color: #fecaca;
      padding: 24px; z-index: 9999; font-family: monospace;
      white-space: pre-wrap; overflow-y: auto;
    }
  </style>
</head>
<body>
  <div id="error-overlay"></div>
  <div id="root"></div>

  <script src="/vendor.bundle.js"></script>

  <script>
    window.__showError__ = (msg) => {
      const overlay = document.getElementById('error-overlay');
      overlay.textContent = msg;
      overlay.style.display = 'block';
    };

    // Map internal bundle imports to the globals we just loaded
    window.__esbuild_globals__ = {
      "react": window.React,
      "react-dom": window.ReactDOM,
      "react-native": window.ReactNativeWeb,
      "react-native-web": window.ReactNativeWeb,
      "react/jsx-runtime": {
        jsx: window.React.createElement,
        jsxs: window.React.createElement,
        Fragment: window.React.Fragment
      }
    };

    ${getConsoleProxyScript()}
  </script>

  <script>
    try {
      // Check if vendor bundle actually loaded
      if (!window.React || !window.ReactDOM || ( ${isRN} && !window.ReactNativeWeb)) {
        throw new Error("Vendor bundle failed to initialize globals.");
      }
      ${bundledCode}
    } catch (err) {
      window.__showError__('Execution Error:\\n' + err.stack);
    }
  </script>

  <script>
    (function mount() {
      try {
        const rootElement = document.getElementById('root');
        const AppComponent = (window.App && window.App.default) || window.App;
        
        if (!AppComponent) throw new Error('No default export found in App.tsx');

        if (${isRN}) {
           const { AppRegistry } = window.ReactNativeWeb;
           AppRegistry.registerComponent('Main', () => AppComponent);
           AppRegistry.runApplication('Main', {
             initialProps: {},
             rootTag: rootElement
           });
        } else {
           const root = window.ReactDOM.createRoot(rootElement);
           root.render(window.React.createElement(AppComponent));
        }
      } catch (err) {
        window.__showError__('Mounting Error:\\n' + err.message);
      }
    })();
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
  const runIdRef = useRef<number>(0);
  const frameworkRef = useRef<"react" | "react-native">("react-native");

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
    (
      files: FileMap,
      framework: "react" | "react-native" = "react-native",
      entryPoint = "App.tsx",
    ) => {
      console.log("Starting run with framework:", framework);
      const worker = workerRef.current;
      if (!worker) return;

      // Capture current run ID to detect if a newer run starts before this one finishes
      const thisRunId = ++runIdRef.current;
      frameworkRef.current = framework;

      setStatus("running");
      setLogs([]);
      setBundleErrors([]);
      setIsStale(false);

      // Clear preview while bundling
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write("<!DOCTYPE html><html><body></body></html>");
          doc.close();
        } else {
          iframe.srcdoc = "";
        }
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

          const html = buildIframeHTML(
            msg.code,
            framework ?? frameworkRef.current,
          );

          if (iframeRef.current) {
            const iframe = iframeRef.current;
            const doc =
              iframe.contentDocument || iframe.contentWindow?.document;
            if (doc) {
              doc.open();
              doc.write(html);
              doc.close();
            } else {
              iframe.srcdoc = html;
            }
          }

          setStatus("success");
          setLastRanAt(Date.now());
        } else {
          // Bundle errors
          const formattedErrors = msg.errors
            .map((err) => {
              return `${err.file ? err.file + (err.line ? `:${err.line}` : "") : "Error"}\n${err.message}`;
            })
            .join("\n\n");

          if (iframeRef.current) {
            const iframe = iframeRef.current;
            const errorHtml = buildErrorIframeHTML(formattedErrors);
            const doc =
              iframe.contentDocument || iframe.contentWindow?.document;
            if (doc) {
              doc.open();
              doc.write(errorHtml);
              doc.close();
            } else {
              iframe.srcdoc = errorHtml;
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
          const iframe = iframeRef.current;
          const errorHtml = buildErrorIframeHTML(msg);
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            doc.open();
            doc.write(errorHtml);
            doc.close();
          } else {
            iframe.srcdoc = errorHtml;
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

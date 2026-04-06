import type { ReactNode } from "react";
import type { ExecutionStatus } from "../hooks/useExecutor";

interface MainLayoutProps {
  leftPanel: ReactNode;
  editor: ReactNode;
  rightPanel: ReactNode;
  status: ExecutionStatus;
}

export default function MainLayout({
  leftPanel,
  editor,
  rightPanel,
  status,
}: MainLayoutProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        height: "100%",
        flexDirection: "column",
        background: "#060912",
        overflow: "hidden",
      }}
    >
      {/* ── Titlebar ────────────────────────────────────────────────── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          height: 36,
          background: "#0a0f1e",
          borderBottom: "1px solid #1e2d4a",
          flexShrink: 0,
          paddingLeft: 16,
          gap: 8,
        }}
      >
        {/* Brand */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            color: "#445577",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#3b7ff5",
              boxShadow: "0 0 6px #3b7ff5",
              flexShrink: 0,
            }}
          />
          RN Playground
        </span>

        <span style={{ flex: 1 }} />

        {/* Status indicator in titlebar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginRight: 16,
          }}
        >
          {status !== "idle" && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color:
                  status === "running"
                    ? "#f5a623"
                    : status === "success"
                      ? "#22c97a"
                      : "#f5524a",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {status === "running"
                ? "● building"
                : status === "success"
                  ? "✓ ready"
                  : "✕ error"}
            </span>
          )}
        </div>
      </header>

      {/* ── Three-column body ────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Left: file explorer + problem */}
        {leftPanel}

        {/* Center: tab bar + editor */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#060912",
            overflow: "hidden",
            minWidth: 0,
            borderRight: "1px solid #1e2d4a",
          }}
        >
          {editor}
        </main>

        {/* Right: run bar + preview + logs */}
        {rightPanel}
      </div>
    </div>
  );
}

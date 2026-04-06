import { useRef, useCallback, useState, useEffect } from "react";
import { useFileSystem } from "./hooks/useFileSystem";
import { useExecutor } from "./hooks/useExecutor";
import MainLayout from "./layout/MainLayout";
import LeftPanel from "./layout/LeftPanel";
import RightPanel from "./layout/RightPanel";
import Editor from "./components/Editor";
import TabBar from "./components/TabBar";
import TopBar from "./components/TopBar";
import type { Framework } from "./components/TopBar/TopBar";
import styles from "./App.module.css";

const PROBLEM = `Build a card-flip memory game.

Render a 4×4 grid of cards, all face-down. On tap, flip two cards:
• If they match → stay face-up (matched state)
• If not → flip back after 800ms

Requirements:
  – 8 unique emoji pairs (16 cards total)
  – Shuffle deck on mount
  – Track and display move counter
  – Show "You won!" when all pairs are matched
  – Restart button resets the board`;

export default function App() {
  const [framework, setFramework] = useState<Framework>("react");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  // ── File system ────────────────────────────────────────────────────────────
  const fs = useFileSystem();

  // ── Update main.tsx when framework changes ─────────────────────────────────
  useEffect(() => {
    fs.updateMainContent(framework);
  }, [framework, fs]);

  // ── iframe ref — shared between Preview (renders it) and useExecutor (writes srcdoc) ──
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ── Executor ───────────────────────────────────────────────────────────────
  const { run, markStale, clearLogs, status, logs, isStale, lastRanAt } =
    useExecutor(iframeRef);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCodeChange = useCallback(
    (content: string) => {
      fs.setContent(fs.activeFile, content);
      markStale();
    },
    [fs, markStale],
  );

  const handleRun = useCallback(() => {
    run(fs.snapshot(), framework);
  }, [run, fs, framework]);

  const handleFormat = useCallback(() => {
    // Placeholder for format functionality
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    try {
      if (!isFullscreen) {
        // Enter fullscreen
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen toggle error:", error);
    }
  }, [isFullscreen]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <MainLayout
      status={status}
      leftPanel={
        !isFullscreen &&
        isLeftPanelOpen && (
          <LeftPanel
            files={fs.files}
            activeFile={fs.activeFile}
            problem={PROBLEM}
            isReadOnly={fs.isReadOnly}
            onOpen={fs.openFile}
            onCreate={fs.createFile}
            onDelete={fs.deleteFile}
            onRename={fs.renameFile}
          />
        )
      }
      editor={
        <>
          {!isFullscreen && (
            <TopBar
              framework={framework}
              onChange={setFramework}
              onFormat={handleFormat}
              onToggleFullscreen={handleToggleFullscreen}
            />
          )}
          {!isFullscreen && (
            <TabBar
              openTabs={fs.openTabs}
              activeFile={fs.activeFile}
              onSelect={fs.openFile}
              onClose={fs.closeTab}
            />
          )}
          {isFullscreen && (
            <button
              onClick={handleToggleFullscreen}
              className={styles.exitButton}
              title="Exit fullscreen"
            >
              ✕ Exit
            </button>
          )}
          {!isFullscreen && (
            <>
              <button
                onClick={() => setIsLeftPanelOpen((v) => !v)}
                className={styles.leftPanelToggle}
                title={isLeftPanelOpen ? "Hide left panel" : "Show left panel"}
              >
                {isLeftPanelOpen ? "◀" : "▶"}
              </button>
              <button
                onClick={() => setIsRightPanelOpen((v) => !v)}
                className={styles.rightPanelToggle}
                title={
                  isRightPanelOpen ? "Hide right panel" : "Show right panel"
                }
              >
                {isRightPanelOpen ? "▶" : "◀"}
              </button>
            </>
          )}
          <Editor
            key={fs.activeFile} // remount when file switches — avoids stale CodeMirror state
            code={fs.getContent(fs.activeFile)}
            onChange={handleCodeChange}
          />
        </>
      }
      rightPanel={
        !isFullscreen &&
        isRightPanelOpen && (
          <RightPanel
            ref={iframeRef}
            status={status}
            logs={logs}
            isStale={isStale}
            lastRanAt={lastRanAt}
            onRun={handleRun}
            onClearLogs={clearLogs}
          />
        )
      }
    />
  );
}

import { useRef, useCallback, useState } from "react";
import { useFileSystem } from "./hooks/useFileSystem";
import { useExecutor } from "./hooks/useExecutor";
import MainLayout from "./layout/MainLayout";
import LeftPanel from "./layout/LeftPanel";
import RightPanel from "./layout/RightPanel";
import Editor from "./components/Editor";
import TabBar from "./components/TabBar";
import TopBar from "./components/TopBar";
import type { Framework } from "./components/TopBar/TopBar";

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

  // ── File system ────────────────────────────────────────────────────────────
  const fs = useFileSystem();

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <MainLayout
      status={status}
      leftPanel={
        <LeftPanel
          files={fs.files}
          activeFile={fs.activeFile}
          problem={PROBLEM}
          onOpen={fs.openFile}
          onCreate={fs.createFile}
          onDelete={fs.deleteFile}
          onRename={fs.renameFile}
        />
      }
      editor={
        <>
          <TopBar framework={framework} onChange={setFramework} />
          <TabBar
            openTabs={fs.openTabs}
            activeFile={fs.activeFile}
            onSelect={fs.openFile}
            onClose={fs.closeTab}
          />
          <Editor
            key={fs.activeFile} // remount when file switches — avoids stale CodeMirror state
            code={fs.getContent(fs.activeFile)}
            onChange={handleCodeChange}
          />
        </>
      }
      rightPanel={
        <RightPanel
          ref={iframeRef}
          status={status}
          logs={logs}
          isStale={isStale}
          lastRanAt={lastRanAt}
          onRun={handleRun}
          onClearLogs={clearLogs}
        />
      }
    />
  );
}

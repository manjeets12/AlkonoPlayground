import { useRef, useCallback, useState } from "react";

import { useFileSystem } from "./hooks/useFileSystem";
import { useExecutor } from "./hooks/useExecutor";
import MainLayout from "./layout/MainLayout";
import LeftPanel from "./layout/LeftPanel";
import RightPanel from "./layout/RightPanel";
import Editor from "./components/Editor";
import TabBar from "./components/TabBar";
import Logs from "./components/Logs";
import FooterBar from "./layout/FooterBar";
import ProblemPortal from "./components/ProblemPortal/ProblemPortal";
import type { Framework } from "./layout/FooterBar";
import { usePersistence } from "./hooks/usePersistence";

import styles from "./App.module.css";
import { useProblemStore } from "./store/useProblemStore";
import ProblemDetailView from "./components/ProblemDetailView/ProblemDetailView";




export default function App() {
  const [framework, setFramework] = useState<Framework>("react");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // ── File system ────────────────────────────────────────────────────────────
  const { restoreState, updateMainContent, ...fs } = useFileSystem();

  // ── Persistence ────────────────────────────────────────────────────────────
  const { handleSave, isSaving } = usePersistence({
    framework,
    setFramework,
    updateMainContent,
    restoreState,
    fs,
  });

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

  const handleFrameworkChange = useCallback(
    (fw: Framework) => {
      setFramework(fw);
      updateMainContent(fw);
    },
    [updateMainContent],
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

  const { isDetailedViewOpen } = useProblemStore();

  return (
    <>
      <ProblemPortal />
      <MainLayout
        status={status}
        leftPanel={
          !isFullscreen &&
          isLeftPanelOpen && (
            <LeftPanel
              files={fs.files}
              directories={fs.directories}
              activeFile={fs.activeFile}
              isReadOnly={fs.isReadOnly}
              onOpen={fs.openFile}
              onCreate={fs.createFile}
              onDelete={fs.deleteFile}
              onRename={fs.renameFile}
            />
          )
        }
        editor={
          <div className={styles.editorArea}>
            {isDetailedViewOpen ? (
              <ProblemDetailView />
            ) : (
              <>
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
                <Editor
                  key={fs.activeFile} // remount when file switches — avoids stale CodeMirror state
                  code={fs.getContent(fs.activeFile)}
                  onChange={handleCodeChange}
                />
              </>
            )}
          </div>
        }



        bottomPanel={!isFullscreen && <Logs logs={logs} onClear={clearLogs} />}
        rightPanel={
          !isFullscreen &&
          isRightPanelOpen && (
            <RightPanel
              ref={iframeRef}
              status={status}
              isStale={isStale}
              lastRanAt={lastRanAt}
              onRun={handleRun}
            />
          )
        }
        footer={
          !isFullscreen && (
            <FooterBar
              framework={framework}
              onChange={handleFrameworkChange}
              onFormat={handleFormat}



              onToggleFullscreen={handleToggleFullscreen}
              isLeftPanelOpen={isLeftPanelOpen}
              isRightPanelOpen={isRightPanelOpen}
              onToggleLeftPanel={() => setIsLeftPanelOpen((v) => !v)}
              onToggleRightPanel={() => setIsRightPanelOpen((v) => !v)}
              onSave={handleSave}
              isSaving={isSaving}
            />
          )
        }


      />
    </>
  );
}



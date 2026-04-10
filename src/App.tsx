import { useRef, useCallback, useState } from "react";

import { useFileSystem } from "./hooks/useFileSystem";
import { useExecutor } from "./hooks/useExecutor";
import MainLayout from "./layout/MainLayout";
import LeftPanel from "./layout/LeftPanel";
import RightPanel from "./layout/RightPanel";
import Editor from "./components/Editor";
import TabBar from "./components/TabBar";
import Logger from "./components/Logger";
import FooterBar from "./layout/FooterBar";
import ProblemPortal from "./components/ProblemPortal/ProblemPortal";
import SolvedSuccessModal from "./components/SolvedSuccessModal/SolvedSuccessModal";
import type { Framework } from "./layout/FooterBar";
import { usePersistence } from "./hooks/usePersistence";
import { formatCode } from "./utils/formatCode";
import styles from "./App.module.css";
import { useProblemStore } from "./store/useProblemStore";
import ProblemDetailView from "./components/ProblemDetailView/ProblemDetailView";
import type { ThemeId } from "./utils/editorThemes";
import type { DifficultyMode } from "./types/settings";




export default function App() {
  const [framework, setFramework] = useState<Framework>("react");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [editorTheme, setEditorTheme] = useState<ThemeId>("dark");
  const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>("easy");

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
    useProblemStore.getState().recordRunClick();
  }, [run, fs, framework]);

  const handleFormat = useCallback(async () => {
    const currentCode = fs.getContent(fs.activeFile);
    const formattedCode = await formatCode(currentCode, fs.activeFile);

    if (formattedCode !== currentCode) {
      fs.setContent(fs.activeFile, formattedCode);
    }
  }, [fs]);

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
      <SolvedSuccessModal />
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
                  theme={editorTheme}
                  mode={difficultyMode}
                  onChange={handleCodeChange}
                />
              </>
            )}
          </div>
        }



        bottomPanel={!isFullscreen && <Logger logs={logs} onClear={clearLogs} />}
        rightPanel={
          !isFullscreen &&
          isRightPanelOpen && (
            <RightPanel
              ref={iframeRef}
              framework={framework}
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
              theme={editorTheme}
              onThemeChange={setEditorTheme}
              difficultyMode={difficultyMode}
              onDifficultyChange={setDifficultyMode}
            />
          )
        }


      />
    </>
  );
}



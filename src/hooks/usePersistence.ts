import { useState, useEffect, useCallback, useRef } from "react";
import { storage } from "../services/storage";
import type { AppState } from "../types/appState";
import type { Framework } from "../types/framework";
import type { FileSystemActions, FileSystemState } from "./useFileSystem";


const STORAGE_KEY = "alkono_playground_state_v2";


interface UsePersistenceProps {
  framework: Framework;
  setFramework: (fw: Framework) => void;
  updateMainContent: (fw: Framework) => void;
  restoreState: (state: any) => void;
  fs: FileSystemState & Omit<FileSystemActions, "restoreState" | "updateMainContent">;
}

export function usePersistence({
  framework,
  setFramework,
  updateMainContent,
  restoreState,
  fs,
}: UsePersistenceProps) {
  const [isSaving, setIsSaving] = useState(false);
  const isInitialized = useRef(false);

  // ── Restoration logic ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isInitialized.current) return;

    const savedState = storage.getItem<AppState>(STORAGE_KEY);
    if (savedState) {
      setFramework(savedState.framework);
      restoreState({
        files: savedState.files,
        activeFile: savedState.activeFile,
        openTabs: savedState.openTabs,
        directories: savedState.directories,
      });
    } else {
      updateMainContent(framework);
    }

    isInitialized.current = true;
  }, [restoreState, setFramework, updateMainContent, framework]);

  // ── Save logic ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    setIsSaving(true);
    
    const state: AppState = {
      files: fs.files,
      activeFile: fs.activeFile,
      openTabs: fs.openTabs,
      directories: Array.from(fs.directories),
      framework,
      timestamp: Date.now(),
    };

    storage.setItem(STORAGE_KEY, state);

    setTimeout(() => setIsSaving(false), 2000);
  }, [fs, framework]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return {
    handleSave,
    isSaving,
  };
}



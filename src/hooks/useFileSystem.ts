import { useState, useCallback } from "react";
import type { Framework, FileMap } from "../types/framework";
import { getScaffold, getMainContent } from "../templates";


// ─── Types ────────────────────────────────────────────────────────────────────

export type ReadOnlyFiles = Set<string>; // paths that cannot be edited/deleted
export type Directories = Set<string>; // paths that are directories

export interface FileSystemState {
  files: FileMap;
  activeFile: string;
  openTabs: string[];
  readOnlyFiles: ReadOnlyFiles;
  directories: Directories;
}

export interface FileSystemActions {
  // Content
  getContent: (path: string) => string;
  setContent: (path: string, content: string) => void;

  // CRUD
  createFile: (path: string, content?: string) => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;

  // Tabs / navigation
  openFile: (path: string) => void;
  closeTab: (path: string) => void;

  // Bundler snapshot: flat map of all files
  snapshot: () => FileMap;

  // Check if file is read-only
  isReadOnly: (path: string) => boolean;

  // Update main.tsx content for a specific framework
  updateMainContent: (framework: Framework) => void;

  // Hydrate state from external source (e.g. storage)
  restoreState: (state: {
    files?: FileMap;
    activeFile?: string;
    openTabs?: string[];
    directories?: string[];
  }) => void;
}



// ─── Default scaffold ─────────────────────────────────────────────────────────

const DEFAULT_FILES: FileMap = getScaffold("react");


// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFileSystem(): FileSystemState & FileSystemActions {
  const [files, setFiles] = useState<FileMap>({ ...DEFAULT_FILES });
  const [activeFile, setActiveFile] = useState("main.tsx");
  const [openTabs, setOpenTabs] = useState<string[]>(["main.tsx"]);
  const [directories, setDirectories] = useState<Directories>(new Set());
  const readOnlyFiles: ReadOnlyFiles = new Set(["App.tsx"]); // Files that cannot be edited/deleted

  // ── Content ──────────────────────────────────────────────────────────────

  const getContent = useCallback((path: string) => files[path] ?? "", [files]);

  const setContent = useCallback((path: string, content: string) => {
    if (readOnlyFiles.has(path)) {
      console.warn(`Cannot edit read-only file: ${path}`);
      return;
    }
    setFiles((prev) => ({ ...prev, [path]: content }));
  }, []);

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const createFile = useCallback((path: string, content = "") => {
    // Check if this is a directory (ends with .gitkeep)
    const isDir = path.endsWith("/.gitkeep");
    const dirPath = isDir ? path.replace("/.gitkeep", "") : null;

    setFiles((prev) => {
      if (prev[path] !== undefined) return prev; // already exists
      return { ...prev, [path]: content };
    });

    // Mark directory if this is a .gitkeep file
    if (isDir && dirPath) {
      setDirectories((prev) => new Set([...prev, dirPath]));
    }

    // Only open tabs for actual files, not .gitkeep
    if (!isDir) {
      setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
      setActiveFile(path);
    }
  }, []);

  const deleteFile = useCallback(
    (path: string) => {
      if (readOnlyFiles.has(path)) {
        console.warn(`Cannot delete read-only file: ${path}`);
        return;
      }
      setFiles((prev) => {
        const next = { ...prev };
        delete next[path];
        return next;
      });
      setOpenTabs((prev) => {
        const next = prev.filter((t) => t !== path);
        return next;
      });
      setActiveFile((prev) => {
        if (prev !== path) return prev;
        const remaining = openTabs.filter((t) => t !== path);
        return remaining[remaining.length - 1] ?? "";
      });
    },
    [openTabs],
  );

  const renameFile = useCallback((oldPath: string, newPath: string) => {
    setFiles((prev) => {
      const next = { ...prev };
      next[newPath] = next[oldPath] ?? "";
      delete next[oldPath];
      return next;
    });
    setOpenTabs((prev) => prev.map((t) => (t === oldPath ? newPath : t)));
    setActiveFile((prev) => (prev === oldPath ? newPath : prev));
  }, []);

  // ── Tabs ─────────────────────────────────────────────────────────────────

  const openFile = useCallback((path: string) => {
    setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
    setActiveFile(path);
  }, []);

  const closeTab = useCallback((path: string) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t !== path);
      setActiveFile((active) => {
        if (active !== path) return active;
        return next[next.length - 1] ?? "";
      });
      return next;
    });
  }, []);

  // ── Snapshot ─────────────────────────────────────────────────────────────

  // Returns the current file map by reference — call at run-time, not during render
  const snapshot = useCallback((): FileMap => ({ ...files }), [files]);

  const isReadOnly = useCallback((path: string) => readOnlyFiles.has(path), []);

  const updateMainContent = useCallback((framework: Framework) => {
    const newContent = getMainContent(framework);
    setFiles((prev) => ({ ...prev, "main.tsx": newContent }));
  }, []);

  const restoreState = useCallback((state: {
    files?: FileMap;
    activeFile?: string;
    openTabs?: string[];
    directories?: string[];
  }) => {
    if (state.files) setFiles(state.files);
    if (state.activeFile) setActiveFile(state.activeFile);
    if (state.openTabs) setOpenTabs(state.openTabs);
    if (state.directories) setDirectories(new Set(state.directories));
  }, []);


  return {
    // State
    files,
    activeFile,
    openTabs,
    readOnlyFiles,
    directories,
    // Actions
    getContent,
    setContent,
    createFile,
    deleteFile,
    renameFile,
    openFile,
    closeTab,
    snapshot,
    isReadOnly,
    updateMainContent,
    restoreState,
  };
}


import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FileMap = Record<string, string>; // path → content
export type ReadOnlyFiles = Set<string>; // paths that cannot be edited/deleted
export type Directories = Set<string>; // paths that are directories
export type Framework = "react" | "react-native";

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
}

// ─── Default scaffold ─────────────────────────────────────────────────────────

function getMainContent(framework: Framework): string {
  if (framework === "react-native") {
    return `import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function Main() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.h1}>Hello World (React Native)</Text>
        <Text style={styles.h2}>Tap to interact</Text>
        <Text style={styles.p}>
          This is a React Native component running in the integrated execution environment!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
  },
  h2: {
    fontSize: 24,
    color: '#94a3b8',
    margin: 0,
  },
  p: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 20,
  },
});
`;
  }

  // Default React content
  return `import React from 'react';

export default function Main() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }}>
      <h1 style={{ fontSize: '32px', margin: 0 }}>Hello World (32px)</h1>
      <h2 style={{ fontSize: '24px', margin: 0, color: '#94a3b8' }}>Hello World (24px)</h2>
      <h3 style={{ fontSize: '16px', margin: 0, color: '#64748b' }}>Hello World (16px)</h3>
      <p style={{ marginTop: '20px' }}>
        This is a standard React execution running perfectly in the integrated execution environment!
      </p>
    </div>
  );
}
`;
}

const DEFAULT_FILES: FileMap = {
  "main.tsx": getMainContent("react"),

  "App.tsx": `import React from 'react';
import Main from './main';

export default function App() {
  return <Main />;
}
`,

  "components/Button.tsx": `import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.base, variant === 'secondary' && styles.secondary]}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  secondary: {
    backgroundColor: '#1e293b',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
`,

  "utils/helpers.ts": `export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
`,
};

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
  };
}

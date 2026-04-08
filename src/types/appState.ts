import type { FileMap, Framework } from "../hooks/useFileSystem";

export interface AppState {
  files: FileMap;
  activeFile: string;
  openTabs: string[];
  directories: string[];
  framework: Framework;
  timestamp: number;
}

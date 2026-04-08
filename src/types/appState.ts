import type { FileMap, Framework } from "./framework";

export interface AppState {
  files: FileMap;
  activeFile: string;
  openTabs: string[];
  directories: string[];
  framework: Framework;
  timestamp: number;
}

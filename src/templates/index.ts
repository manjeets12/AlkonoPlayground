import type { Framework, FileMap } from "../types/framework";

import { reactMain } from "./react";
import { reactNativeMain } from "./react-native";
import { sharedFiles } from "./shared";

/**
 * Returns the main file content for a given framework.
 */
export function getMainContent(framework: Framework): string {
  switch (framework) {
    case "react-native":
      return reactNativeMain;
    case "react":
    default:
      return reactMain;
  }
}

/**
 * Generates the complete initial file structure (scaffold) for a new project.
 */
export function getScaffold(framework: Framework): FileMap {
  const mainContent = getMainContent(framework);

  return {
    "main.tsx": mainContent,
    ...sharedFiles,
  };
}

export * from "./react";
export * from "./react-native";
export * from "./shared";

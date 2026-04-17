import { createContext, useContext } from "react";
import type { FileMap, Framework } from "../types/framework";

interface ActionContextType {
  getFilesSnapshot: () => FileMap;
  framework: Framework;
}

export const ActionContext = createContext<ActionContextType | null>(null);

export function useActionContext() {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error("useActionContext must be used within an ActionProvider");
  }
  return context;
}

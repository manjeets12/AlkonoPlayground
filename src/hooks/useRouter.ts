import { useEffect, useRef } from "react";
import { useProblemStore } from "../store/useProblemStore";

export function useRouter() {
  const { 
    getProblems, 
    activeProblemId, 
    selectProblem, 
    isPortalOpen, 
    setPortalOpen 
  } = useProblemStore();
  
  const isInitialLoad = useRef(true);

  // ── Sync URL -> State (Initial & Back Button) ─────────────────────────────
  useEffect(() => {
    const syncStateFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get("p");
      
      // Use pathname or the redirect path from 404 hack
      const rawPath = redirectPath || window.location.pathname;
      const cleanPath = rawPath.replace(/^\/+/, "").replace(/\/+$/, "");

      // Handle nested /machine-coding/problem-id
      if (cleanPath === "machine-coding") {
        setPortalOpen(true);
      } else if (cleanPath.startsWith("machine-coding/")) {
        const problemId = cleanPath.split("/")[1];
        const problems = getProblems();
        const found = problems.find(p => p.id === problemId);
        if (found && found.id !== activeProblemId) {
          selectProblem(found.id);
        }
      } else if (cleanPath) {
        // Fallback for old FLAT URLs (legacy support)
        const problems = getProblems();
        const found = problems.find(p => p.id === cleanPath);
        if (found) {
          // Found an old URL, select it and we'll sync it to nested in the other effect
          selectProblem(found.id);
        }
      } else {
        // Root /
        if (isPortalOpen) setPortalOpen(false);
      }
    };

    if (isInitialLoad.current) {
      syncStateFromURL();
      isInitialLoad.current = false;
    }

    window.addEventListener("popstate", syncStateFromURL);
    return () => window.removeEventListener("popstate", syncStateFromURL);
  }, [getProblems, selectProblem, activeProblemId, setPortalOpen, isPortalOpen]);

  // ── Sync State -> URL (On Change) ──────────────────────────────────────────
  useEffect(() => {
    // Skip if we're in the middle of initial mount sync
    if (isInitialLoad.current) return;

    let targetPath = "/";
    if (isPortalOpen) {
      targetPath = "/machine-coding";
    } else if (activeProblemId) {
      targetPath = `/machine-coding/${activeProblemId}`;
    }

    if (window.location.pathname !== targetPath) {
      // Use pushState to allow "Back" button to work between problems.
      window.history.pushState(null, "", targetPath);
    }
  }, [activeProblemId, isPortalOpen]);
}

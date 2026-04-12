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
      const path = redirectPath || window.location.pathname;
      const slug = path.replace(/^\/+/, "").replace(/\/+$/, "");

      if (slug === "machine-coding") {
        setPortalOpen(true);
      } else if (slug) {
        const problems = getProblems();
        const found = problems.find(p => p.id === slug);
        if (found && found.id !== activeProblemId) {
          selectProblem(found.id);
        }
      }
    };

    if (isInitialLoad.current) {
      syncStateFromURL();
      isInitialLoad.current = false;
    }

    window.addEventListener("popstate", syncStateFromURL);
    return () => window.removeEventListener("popstate", syncStateFromURL);
  }, [getProblems, selectProblem, activeProblemId, setPortalOpen]);

  // ── Sync State -> URL (On Change) ──────────────────────────────────────────
  useEffect(() => {
    // Skip if we're in the middle of initial mount sync
    if (isInitialLoad.current) return;

    let targetPath = "/";
    if (isPortalOpen) {
      targetPath = "/machine-coding";
    } else if (activeProblemId) {
      targetPath = `/${activeProblemId}`;
    }

    if (window.location.pathname !== targetPath) {
      // Use replaceState to avoid cluttering history with every tiny change, 
      // but pushState when it's a meaningful navigation.
      // For now, let's use pushState to allow "Back" button to work between problems.
      window.history.pushState(null, "", targetPath);
    }
  }, [activeProblemId, isPortalOpen]);
}

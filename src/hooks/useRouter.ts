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
      
      const baseUrl = import.meta.env.BASE_URL;
      let rawPath = redirectPath || window.location.pathname;

      // Strip base URL from the start if it exists
      if (rawPath.startsWith(baseUrl)) {
        rawPath = rawPath.slice(baseUrl.length);
      } else if (baseUrl !== "/" && rawPath.startsWith("/")) {
        // Handle cases where the path might start with / but doesn't include the base (redundant safety)
        // Usually index.html handles this via redirect if using the 404 hack
      }

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
    if (isInitialLoad.current) return;

    const baseUrl = import.meta.env.BASE_URL; // e.g. "/AlkonoPlayground/" or "/"
    let targetPath = baseUrl;

    if (isPortalOpen) {
      targetPath = `${baseUrl}machine-coding`;
    } else if (activeProblemId) {
      targetPath = `${baseUrl}machine-coding/${activeProblemId}`;
    }

    // Direct string comparison of full pathnames
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  }, [activeProblemId, isPortalOpen]);
}

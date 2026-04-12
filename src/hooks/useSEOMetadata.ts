import { useEffect } from "react";
import { useProblemStore } from "../store/useProblemStore";

const DEFAULT_TITLE = "AlkonoPlayground — Free React & React Native Machine Coding Platform";
const DEFAULT_DESC = "A free, browser-based machine coding platform for React and React Native. Practice frontend interview challenges and build apps with zero setup.";

export function useSEOMetadata() {
  const activeProblemId = useProblemStore((state) => state.activeProblemId);
  const getProblems = useProblemStore((state) => state.getProblems);

  useEffect(() => {
    const activeProblem = getProblems().find(p => p.id === activeProblemId);
    
    if (activeProblem) {
      // Update Title
      document.title = `${activeProblem.title} | AlkonoPlayground`;

      // Update Meta Description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        // Use first 155 chars of problem description for SEO
        const descContent = activeProblem.description.length > 155
          ? activeProblem.description.substring(0, 152) + "..."
          : activeProblem.description;
        metaDesc.setAttribute("content", descContent);
      }
    } else {
      document.title = DEFAULT_TITLE;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", DEFAULT_DESC);
      }
    }
  }, [activeProblemId, getProblems]);
}

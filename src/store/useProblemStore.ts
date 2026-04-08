import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Problem } from "../types/problem";

interface ProblemState {
  problems: Problem[];
  activeProblemId: number;
  isPortalOpen: boolean;
  isDetailedViewOpen: boolean;
  timerStartedAt: number | null;
  isTimerActive: boolean;
  // Actions
  addProblem: (problem: Omit<Problem, "id">) => void;
  selectProblem: (id: number) => void;
  deleteProblem: (id: number) => void;
  setPortalOpen: (isOpen: boolean) => void;
  setDetailedViewOpen: (isOpen: boolean) => void;
  startSolving: () => void;
  resetTimer: () => void;
  getActiveProblem: () => Problem;
}


const DEFAULT_PROBLEM: Problem = {
  id: 1,
  title: "Memory Card Game",
  description: `Build a card-flip memory game.

Render a 4×4 grid of cards, all face-down. On tap, flip two cards:
• If they match → stay face-up (matched state)
• If not → flip back after 800ms

Requirements:
  – 8 unique emoji pairs (16 cards total)
  – Shuffle deck on mount
  – Track and display move counter
  – Show "You won!" when all pairs are matched
  – Restart button resets the board`,
  durationMinutes: 45,
  level: "medium",
  isDefault: true,
};

export const useProblemStore = create<ProblemState>()(
  persist(
    (set, get) => ({
      problems: [DEFAULT_PROBLEM],
      activeProblemId: DEFAULT_PROBLEM.id,
      isPortalOpen: false,
      isDetailedViewOpen: true,
      timerStartedAt: null,
      isTimerActive: false,

      addProblem: (problemData) => {
        const newProblem: Problem = {
          ...problemData,
          id: Date.now(),
        };
        set((state) => ({
          problems: [...state.problems, newProblem],
          activeProblemId: newProblem.id, // Auto-select new problem
          isPortalOpen: false,
          isTimerActive: false,
          timerStartedAt: null,
          isDetailedViewOpen: true,
        }));
      },

      selectProblem: (id) => {
        set({ 
          activeProblemId: id, 
          isPortalOpen: false, 
          isDetailedViewOpen: true,
          isTimerActive: false,
          timerStartedAt: null
        });
      },

      deleteProblem: (id) => {
        set((state) => {
          const newProblems = state.problems.filter((p) => p.id !== id);
          // If active problem is deleted, fallback to default
          const newActiveId =
            state.activeProblemId === id
              ? DEFAULT_PROBLEM.id
              : state.activeProblemId;
          return { problems: newProblems, activeProblemId: newActiveId };
        });
      },

      setPortalOpen: (isOpen) => set({ isPortalOpen: isOpen }),

      setDetailedViewOpen: (isOpen) => set({ isDetailedViewOpen: isOpen }),

      startSolving: () => {
        set({ 
          isDetailedViewOpen: false, 
          isTimerActive: true, 
          timerStartedAt: Date.now() 
        });
      },

      resetTimer: () => {
        set({ isTimerActive: false, timerStartedAt: null });
      },

      getActiveProblem: () => {
        const { problems, activeProblemId } = get();
        return (
          problems.find((p) => p.id === activeProblemId) || DEFAULT_PROBLEM
        );
      },
    }),

    {
      name: "alkono_problems_storage",
    },
  ),
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Problem } from "../types/problem";
import { DEFAULT_PROBLEMS } from "../data/defaultProblems";
import { formatTime } from "../utils/time";

export interface SolvedResult {
  timeTaken: string;
  isWithinTime: boolean;
  overshoot?: string;
  runHistory?: string[];
  timestamp: number;
}

interface ProblemState {
  userProblems: Problem[];
  solvedStatuses: Record<string, boolean>;
  solvedResults: Record<string, SolvedResult>;
  activeProblemId: string;
  recentSolvedId: string | null;
  currentRunTimestamps: number[];
  isPortalOpen: boolean;
  isDetailedViewOpen: boolean;
  timerStartedAt: number | null;
  isTimerActive: boolean;
  // Actions
  addProblem: (problem: Omit<Problem, "id">) => void;
  selectProblem: (id: string) => void;
  deleteProblem: (id: string) => void;
  setPortalOpen: (isOpen: boolean) => void;
  setDetailedViewOpen: (isOpen: boolean) => void;
  startSolving: () => void;
  markAsSolved: (id: string) => void;
  recordRunClick: () => void;
  clearRecentSolvedId: () => void;
  resetTimer: () => void;
  getActiveProblem: () => Problem;
  getProblems: () => Problem[];
}

export const useProblemStore = create<ProblemState>()(
  persist(
    (set, get) => ({
      userProblems: [],
      solvedStatuses: {},
      solvedResults: {},
      activeProblemId: DEFAULT_PROBLEMS[0].id,
      recentSolvedId: null,
      currentRunTimestamps: [],
      isPortalOpen: false,
      isDetailedViewOpen: true,
      timerStartedAt: null,
      isTimerActive: false,

      getProblems: () => {
        const { userProblems, solvedStatuses } = get();
        return [...DEFAULT_PROBLEMS, ...userProblems].map(p => ({
          ...p,
          isSolved: !!solvedStatuses[p.id]
        }));
      },

      addProblem: (problemData) => {
        const newProblem: Problem = {
          ...problemData,
          id: String(Date.now()),
        };
        set((state) => ({
          userProblems: [...state.userProblems, newProblem],
          activeProblemId: newProblem.id, 
          isPortalOpen: false,
          isTimerActive: false,
          timerStartedAt: null,
          isDetailedViewOpen: true,
          currentRunTimestamps: [],
        }));
      },

      selectProblem: (id) => {
        set({ 
          activeProblemId: id, 
          isPortalOpen: false, 
          isDetailedViewOpen: true,
          isTimerActive: false,
          timerStartedAt: null,
          currentRunTimestamps: [],
        });
      },

      deleteProblem: (id) => {
        set((state) => {
          const newUserProblems = state.userProblems.filter((p) => p.id !== id);
          const newActiveId =
            state.activeProblemId === id
              ? DEFAULT_PROBLEMS[0].id
              : state.activeProblemId;
          return { userProblems: newUserProblems, activeProblemId: newActiveId };
        });
      },

      setPortalOpen: (isOpen) => set({ isPortalOpen: isOpen }),

      setDetailedViewOpen: (isOpen) => set({ isDetailedViewOpen: isOpen }),

      startSolving: () => {
        set({ 
          isDetailedViewOpen: false, 
          isTimerActive: true, 
          timerStartedAt: Date.now(),
          currentRunTimestamps: [],
        });
      },

      resetTimer: () => {
        set({ isTimerActive: false, timerStartedAt: null, currentRunTimestamps: [] });
      },

      markAsSolved: (id) => {
        const { timerStartedAt, getActiveProblem, currentRunTimestamps } = get();
        const problem = getActiveProblem();
        
        let result: SolvedResult | null = null;
        
        if (timerStartedAt) {
          const elapsedMs = Date.now() - timerStartedAt;
          const elapsedSecs = Math.floor(elapsedMs / 1000);
          const totalSecs = problem.durationMinutes * 60;
          const isWithinTime = elapsedSecs <= totalSecs;
          const overshootSecs = Math.max(0, elapsedSecs - totalSecs);

          // Calculate run history relative to the start time
          const runHistory = currentRunTimestamps.map(ts => {
            const relSecs = Math.floor((ts - timerStartedAt) / 1000);
            return formatTime(Math.max(0, relSecs));
          });

          result = {
            timeTaken: formatTime(elapsedSecs),
            isWithinTime,
            overshoot: overshootSecs > 0 ? formatTime(overshootSecs) : undefined,
            runHistory,
            timestamp: Date.now()
          };
        }

        set((state) => ({
          solvedStatuses: { ...state.solvedStatuses, [id]: true },
          solvedResults: result ? { ...state.solvedResults, [id]: result } : state.solvedResults,
          recentSolvedId: id,
          isTimerActive: false,
          timerStartedAt: null,
          currentRunTimestamps: [],
        }));
      },

      recordRunClick: () => {
        const { isTimerActive } = get();
        if (isTimerActive) {
          set(state => ({
            currentRunTimestamps: [...state.currentRunTimestamps, Date.now()]
          }));
        }
      },

      clearRecentSolvedId: () => set({ recentSolvedId: null }),

      getActiveProblem: () => {
        const { userProblems, activeProblemId, solvedStatuses } = get();
        const problem = (
          DEFAULT_PROBLEMS.find((p) => p.id === activeProblemId) ||
          userProblems.find((p) => p.id === activeProblemId) || 
          DEFAULT_PROBLEMS[0]
        );
        return {
          ...problem,
          isSolved: !!solvedStatuses[problem.id]
        };
      },
    }),

    {
      name: "alkono_problems_storage",
      version: 4,
      migrate: (persistedState: any, version: number) => {
        let state = { ...persistedState };

        if (version === 0 && state.problems) {
          state.userProblems = state.problems.filter((p: any) => !p.isDefault);
          delete state.problems;
          version = 1;
        }

        if (version === 1) {
          state.solvedStatuses = (state.solvedProblemIds || []).reduce((acc: any, id: number) => {
            acc[id] = true;
            return acc;
          }, {});
          delete state.solvedProblemIds;
          version = 2;
        }

        if (version === 2) {
          if (state.problems) {
            const solved = state.solvedStatuses || {};
            state.problems.forEach((p: any) => {
              if (p.isSolved) solved[p.id] = true;
            });
            state.userProblems = state.problems.filter((p: any) => !p.isDefault);
            state.solvedStatuses = solved;
            delete state.problems;
          }
          version = 3;
        }

        if (version === 3) {
          // Version 3 to 4: Map numeric IDs to descriptive string IDs
          const ID_MAP: Record<number, string> = {
            1: 'memory-card-game',
            2: 'advanced-todos',
            3: 'hacker-news',
            4: 'tip-calculator',
            5: 'task-assigner',
            6: 'swipe-to-delete',
            7: 'bottom-sheet',
            8: 'chat-ui',
            9: 'pin-entry',
            10: 'progress-tracker',
            11: 'otp-input',
            12: 'stopwatch-laps',
            13: 'nested-comments',
            14: 'file-explorer',
            15: 'multi-step-form',
            16: 'image-carousel',
            17: 'counter-history',
            18: 'color-picker',
            19: 'character-counter',
            20: 'searchable-dropdown'
          };

          // Migrate solvedStatuses keys
          const newSolvedStatuses: Record<string, boolean> = {};
          if (state.solvedStatuses) {
            Object.keys(state.solvedStatuses).forEach(key => {
              const numericId = Number(key);
              const newId = ID_MAP[numericId] || key;
              newSolvedStatuses[newId] = state.solvedStatuses[key];
            });
          }
          state.solvedStatuses = newSolvedStatuses;

          // Migrate activeProblemId
          if (state.activeProblemId) {
            const numericActiveId = Number(state.activeProblemId);
            state.activeProblemId = ID_MAP[numericActiveId] || String(state.activeProblemId);
          }

          // Migrate userProblems IDs (just stringify them)
          if (state.userProblems) {
            state.userProblems = state.userProblems.map((p: any) => ({
              ...p,
              id: String(p.id)
            }));
          }
        }

        return state;
      }
    },
  ),
);

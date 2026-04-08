import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Problem } from "../types/problem";

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

const TODO_PROBLEM: Problem = {
  id: 2,
  title: "Advanced TODOs with Tasks",
  description: `Build a multi-screen TODO application.
  
Features:
• Main screen: List, add, delete and update TODO items.
• Detail screen: Clicking a TODO opens its task list. Screen title matches the TODO title. Add tasks here.
• Task logic: Mark tasks as completed with a checkbox on the left.
• Interaction: Use a BottomSheet for creating TODOs/Tasks. Include one text input and a button (disabled if empty).

Bonus: Add a filter for TODOs with completed tasks.`,
  durationMinutes: 120,
  level: "medium",
  isDefault: true,
};

const HACKER_NEWS_PROBLEM: Problem = {
  id: 3,
  title: "Hacker News Top Stories",
  description: `Build a Hacker News Top Stories reader.

Requirements:
• List: Display top stories using the HN API (https://github.com/HackerNews/API).
• Pagination: Support proper scrolling pagination.
• Refresh: Option to forcefully refresh the list.
• Links: Mention the HN platform/API in the UI.`,
  durationMinutes: 90,
  level: "hard",
  isDefault: true,
};

const TIP_CALCULATOR_PROBLEM: Problem = {
  id: 4,
  title: "Premium Tip Calculator",
  description: `Build a comprehensive Tip Calculation App.

Features:
• Input: Bill amount (up to 2 decimal places).
• Tip Selection: Presets for 10%, 15%, 20%, 25% + custom tip %.
• Splitting: Split the bill among friends.
• Rounding: Option to round up the total bill (switch).
• Result: Show per-person bill share if more than 1 person.`,
  durationMinutes: 90,
  level: "easy",
  isDefault: true,
};

const TASK_ASSIGNER_PROBLEM: Problem = {
  id: 5,
  title: "Task Assigner (React Native)",
  description: `Build a React Native app called Task Assigner.

Initial Render:
• App title: Task Assigner
• Filter input at top.
• FlatList of tasks using the following data:

\`\`\`js
const TASKS = [
  { id: '1', title: 'Design UI', description: 'Create wireframes for the app', assignee: 'Alice' },
  { id: '2', title: 'Write Tests', description: 'Add unit tests for all modules', assignee: 'Bob' },
  { id: '3', title: 'Fix Bugs', description: 'Resolve open issues on GitHub', assignee: 'Alice' },
  { id: '4', title: 'Deploy App', description: 'Push latest build to production', assignee: 'Charlie' },
  { id: '5', title: 'Code Review', description: 'Review PRs from the team', assignee: '' },
];
\`\`\`

Features:
• Filter: Real-time case-insensitive filtering by assignee name.
• Remove: "Remove Assignee" button clears the assignee.
• Add: For unassigned tasks, show an inline text input + "Assign" button.

Criteria:
• Use FlatList for rendering.
• Tasks with no assignee show "Unassigned".
• State must stay in memory (no backend).`,
  durationMinutes: 45,
  level: "medium",
  isDefault: true,
};

export const DEFAULT_PROBLEMS = [
  DEFAULT_PROBLEM,
  TODO_PROBLEM,
  HACKER_NEWS_PROBLEM,
  TIP_CALCULATOR_PROBLEM,
  TASK_ASSIGNER_PROBLEM
];

interface ProblemState {
  userProblems: Problem[];
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
  getProblems: () => Problem[];
}

export const useProblemStore = create<ProblemState>()(
  persist(
    (set, get) => ({
      userProblems: [],
      activeProblemId: DEFAULT_PROBLEM.id,
      isPortalOpen: false,
      isDetailedViewOpen: true,
      timerStartedAt: null,
      isTimerActive: false,

      getProblems: () => {
        return [...DEFAULT_PROBLEMS, ...get().userProblems];
      },

      addProblem: (problemData) => {
        const newProblem: Problem = {
          ...problemData,
          id: Date.now(),
        };
        set((state) => ({
          userProblems: [...state.userProblems, newProblem],
          activeProblemId: newProblem.id, 
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
          const newUserProblems = state.userProblems.filter((p) => p.id !== id);
          const newActiveId =
            state.activeProblemId === id
              ? DEFAULT_PROBLEM.id
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
          timerStartedAt: Date.now() 
        });
      },

      resetTimer: () => {
        set({ isTimerActive: false, timerStartedAt: null });
      },

      getActiveProblem: () => {
        const { userProblems, activeProblemId } = get();
        return (
          DEFAULT_PROBLEMS.find((p) => p.id === activeProblemId) ||
          userProblems.find((p) => p.id === activeProblemId) || 
          DEFAULT_PROBLEM
        );
      },
    }),

    {
      name: "alkono_problems_storage",
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0 && persistedState.problems) {
          return {
            ...persistedState,
            userProblems: persistedState.problems.filter((p: any) => !p.isDefault),
            problems: undefined
          };
        }
        return persistedState;
      }
    },
  ),
);

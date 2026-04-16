export const EVALUATION_THRESHOLDS = {
  TIME: {
    EXCELLENT: 0.8,
    GOOD: 1.0,
    FAIR: 1.2,
    POOR: 1.5,
  },
  ITERATION: {
    MIN_OPTIMAL: 3,
    MAX_OPTIMAL: 10,
    MAX_FAIR: 20,
    IMPULSIVE: 2,
  },
  PLANNING: {
    MIN_RATIO: 0.2,
    MAX_RATIO: 0.5,
    IMPULSIVE_RATIO: 0.15,
    OVERTHINKING_RATIO: 0.6,
  },
};

export const EVALUATION_SCORES = {
  TIME: {
    EXCELLENT: 4,
    GOOD: 3,
    FAIR: 2,
    POOR: 1,
  },
  ITERATION: {
    OPTIMAL: 3,
    TRIAL_ERROR: 2,
    SUSPICIOUS: 1.5,
    HEAVY_TRIAL: 1,
  },
  PLANNING: {
    BALANCED: 3,
    UNBALANCED: 1.5,
  },
  MAX_TOTAL: 10,
};

export const VERDICTS = {
  EXCELLENT: {
    MIN_SCORE: 9,
    LABEL: "Strong Hire – Efficient and structured execution",
    SUMMARY: "A top-tier performance showing strong technical and procedural skills.",
  },
  GOOD: {
    MIN_SCORE: 7,
    LABEL: "Hire (L2) – Ready for mid-level roles with minor improvements",
    SUMMARY: "Broadly successful, with minor areas to refine in your workflow.",
  },
  FAIR: {
    MIN_SCORE: 5,
    LABEL: "Fair - Keep Practicing",
    SUMMARY: "Acceptable outcome, but focus on balancing speed and accuracy.",
  },
  POOR: {
    MIN_SCORE: 0,
    LABEL: "Borderline – Needs coordination or logic refinement",
    SUMMARY: "The solution was completed, but there is significant room for improvement.",
  },
};

export const FEEDBACK_TEMPLATES = {
  STRENGTHS: {
    TIME: "Efficient use of allotted time",
    ACCURACY: "High direct implementation accuracy",
    TESTING: "Systematic debugging & testing",
    PLANNING: "Well-balanced planning phase",
  },
  WEAKNESSES: {
    TIME: "Time management could be improved",
    TRIAL_ERROR: "High iteration count suggests trial-and-error",
    PLANNING: "Insufficient initial planning",
    LATE_START: "Late start on implementation",
  },
  ADVANCED_WEAKNESSES: [
    "Optimize memoization (useMemo/useCallback) for performance",
    "Add more comprehensive error boundary handling",
    "Structure state more flatly to avoid deep nesting issues",
    "Include unit tests for core utility functions",
    "Refine component boundaries for better reusability",
  ],
  ZERO_RUNS: {
    VERDICT: "Borderline – Lacks validation during development",
    BEHAVIOR: "No execution runs recorded. Solution was not validated during development, which is high risk in real interviews.",
    WEAKNESSES: ["No validation via execution", "High risk of untested edge cases"],
  },
  BEHAVIOR: {
    BALANCED: "A balanced and methodical approach.",
    TRIAL_ERROR: "Heavy reliance on trial and error. Try to reason about logic before running.",
    IMPULSIVE: "Impulsive coding pattern. Consider more upfront state planning.",
    OVERTHINKING: "Potential overthinking. Good precision, but watch the clock.",
  },
  TIPS: {
    STATE: "Sketch the state shape before writing React components.",
    LOGGING: "Use console.logs to trace state changes before making quick fixes.",
    TIMEBOXING: "Timebox smaller features to stay within duration.",
  },
};

export const SCORE_TRANSPARENCY_NOTE = "Note: Score is based on behavioral signals (time usage, iteration patterns, and workflow), not code correctness.";

const AI_RULES = `
IMPORTANT RULES:
* ALWAYS provide at least 2 weaknesses
* DO NOT say 'no major issues'
* Even for strong solutions, suggest realistic improvements
* Focus on production-readiness gaps
`;

export const AI_INSTRUCTION_REACT = `You are a strict senior React interviewer.

Evaluate this solution on:
1. Code quality and structure
2. State management approach
3. Performance (re-renders, memoization)
4. Edge cases (race conditions)
5. Scalability

${AI_RULES}

Also comment on whether this would pass a real 45-minute interview round.`;

export const AI_INSTRUCTION_REACT_NATIVE = `You are a strict senior React Native interviewer.

Evaluate this solution on:
1. Code quality and structure
2. State management (Context/Zustand)
3. UI Performance (FlashList, memoization)
4. Edge cases (rapid taps, race conditions)
5. Mobile-specific scalability

${AI_RULES}

Also comment on whether this would pass a real 45-minute interview round.`;

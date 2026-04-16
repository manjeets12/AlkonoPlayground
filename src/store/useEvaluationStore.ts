import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EvaluationReport } from "../types/evaluation";

interface EvaluationState {
  reports: Record<string, EvaluationReport[]>;
  selfRatings: Record<string, number>; // problemId -> last self rating
  // Actions
  addReport: (problemId: string, report: EvaluationReport) => void;
  getReports: (problemId: string) => EvaluationReport[];
  getLatestReport: (problemId: string) => EvaluationReport | null;
  setSelfRating: (problemId: string, rating: number) => void;
  getSelfRating: (problemId: string) => number;
}

export const useEvaluationStore = create<EvaluationState>()(
  persist(
    (set, get) => ({
      reports: {},
      selfRatings: {},

      addReport: (problemId, report) => {
        set((state) => ({
          reports: {
            ...state.reports,
            [problemId]: [report, ...(state.reports[problemId] || [])],
          },
        }));
      },

      getReports: (problemId) => {
        return get().reports[problemId] || [];
      },

      getLatestReport: (problemId) => {
        const problemReports = get().reports[problemId];
        return problemReports && problemReports.length > 0 ? problemReports[0] : null;
      },

      setSelfRating: (problemId, rating) => {
        set((state) => ({
          selfRatings: {
            ...state.selfRatings,
            [problemId]: rating,
          },
        }));
      },

      getSelfRating: (problemId) => {
        return get().selfRatings[problemId] || 0;
      },
    }),
    {
      name: "alkono_evaluations_storage",
    }
  )
);

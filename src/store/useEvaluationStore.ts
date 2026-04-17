import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EvaluationReport } from "../types/evaluation";

interface EvaluationState {
  reports: Record<string, EvaluationReport[]>;
  selfRatings: Record<string, number>; // problemId -> last self rating
  isHistoryModalOpen: boolean;
  viewingReportAddress: { problemId: string; timestamp: number } | null;
  // Actions
  addReport: (problemId: string, report: EvaluationReport) => void;
  getReports: (problemId: string) => EvaluationReport[];
  getLatestReport: (problemId: string) => EvaluationReport | null;
  setSelfRating: (problemId: string, rating: number) => void;
  getSelfRating: (problemId: string) => number;
  setHistoryModalOpen: (isOpen: boolean) => void;
  setViewingReport: (address: { problemId: string; timestamp: number } | null) => void;
  clearAllData: () => void;
}

export const useEvaluationStore = create<EvaluationState>()(
  persist(
    (set, get) => ({
      reports: {},
      selfRatings: {},
      isHistoryModalOpen: false,
      viewingReportAddress: null,

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

      setHistoryModalOpen: (isOpen) => {
        set({ isHistoryModalOpen: isOpen });
      },

      setViewingReport: (address) => {
        set({ viewingReportAddress: address });
      },

      clearAllData: () => {
        set({ reports: {}, selfRatings: {}, viewingReportAddress: null });
      },
    }),
    {
      name: "alkono_evaluations_storage",
      partialize: (state) => ({ reports: state.reports, selfRatings: state.selfRatings }), // Don't persist UI state
    }
  )
);

import type { Problem } from "./problem";
import type { FileMap } from "./framework";

export interface CodeSignals {
  fileStructure: "Single file" | "Basic modular" | "Modular";
  reusability: "High" | "Medium" | "Low";
  utilities: "Present" | "Absent";
  componentBreakdown: "Minimal" | "Moderate" | "Well structured";
}

export interface FileSignal {
  filePath: string;
  signals: {
    modularity: "High" | "Medium" | "Low";
    readability: "High" | "Medium" | "Low";
    reusability: "High" | "Medium" | "Low";
    complexity: "High" | "Medium" | "Low";
  };
}

export interface EvaluationReport {
  score: number;
  verdict: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  behaviorAnalysis: string;
  improvementTips: string[];
  codeSignals: CodeSignals;
  fileSignals?: FileSignal[];
  scoreTransparencyNote: string;
  confidenceGap?: string;
  stats: {
    timeTaken: string;
    allottedTime: string;
    runCount: number;
    planningTime: string;
    planningRatio: number;
  };
  framework: string;
  isHighRisk?: boolean;
  timestamp: number;
}

export interface EvaluationParams {
  problem: Problem;
  timeTakenMs: number;
  runCount: number;
  firstRunTimeMs: number | null;
  files: FileMap;
  framework: string;
}

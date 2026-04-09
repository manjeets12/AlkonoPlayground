export type ProblemLevel = "easy" | "medium" | "hard";

export interface Problem {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  level: ProblemLevel;
  isDefault?: boolean;
  isSolved?: boolean;
  images?: string[];
}

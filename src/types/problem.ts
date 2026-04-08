export type ProblemLevel = "easy" | "medium" | "hard";

export interface Problem {
  id: number; // timestamp
  title: string;
  description: string;
  durationMinutes: number;
  level: ProblemLevel;
  isDefault?: boolean;
}

import type { Problem } from "../types/problem";
import type { EvaluationReport, EvaluationParams, CodeSignals, FileSignal } from "../types/evaluation";
import type { FileMap } from "../types/framework";
import { 
  EVALUATION_THRESHOLDS, 
  EVALUATION_SCORES, 
  VERDICTS, 
  FEEDBACK_TEMPLATES, 
  AI_INSTRUCTION_REACT,
  AI_INSTRUCTION_REACT_NATIVE,
  SCORE_TRANSPARENCY_NOTE
} from "./evaluationConfigs";

export function extractCodeSignals(files: FileMap): CodeSignals {
  const fileList = Object.keys(files).filter(f => !f.endsWith('.gitkeep'));
  const fileCount = fileList.length;

  // 1. File Structure
  let fileStructure: CodeSignals['fileStructure'] = "Single file";
  if (fileCount > 3) fileStructure = "Modular";
  else if (fileCount > 1) fileStructure = "Basic modular";

  // 2. Reusability
  const hasReusable = fileList.some(path => 
    path.toLowerCase().includes('component') || 
    path.toLowerCase().includes('util') || 
    path.toLowerCase().includes('helper')
  );
  const reusability: CodeSignals['reusability'] = hasReusable ? "Medium" : "Low";

  // 3. Utilities
  const hasUtils = fileList.some(path => path.toLowerCase().includes('utils'));
  const utilities: CodeSignals['utilities'] = hasUtils ? "Present" : "Absent";

  // 4. Component Breakdown
  const componentFiles = fileList.filter(path => path.endsWith('.tsx'));
  const componentsCount = componentFiles.length;
  let componentBreakdown: CodeSignals['componentBreakdown'] = "Minimal";
  if (componentsCount > 3) componentBreakdown = "Well structured";
  else if (componentsCount > 1) componentBreakdown = "Moderate";

  return {
    fileStructure,
    reusability,
    utilities,
    componentBreakdown
  };
}

export function extractFileSignals(files: FileMap): FileSignal[] {
  const fileList = Object.keys(files).filter(f => !f.endsWith('.gitkeep'));
  
  // Find interesting files: favor App.tsx, index.js, or largest ones by checking content length
  const interestingFiles = fileList
    .map(path => ({ path, content: files[path], length: files[path].length }))
    .sort((a, b) => b.length - a.length)
    .slice(0, 2);

  return interestingFiles.map(({ path, content }) => {
    const lines = content.split('\n');
    const loc = lines.length;

    // Modularity heuristic: count exports and functions
    const exportCount = (content.match(/export /g) || []).length;
    const functionCount = (content.match(/function /g) || []).length + (content.match(/=>/g) || []).length;
    let modularity: "High" | "Medium" | "Low" = "Low";
    if (exportCount > 2 || functionCount > 3) modularity = "High";
    else if (exportCount > 0 || functionCount > 1) modularity = "Medium";

    // Readability heuristic: average line length, and comment lines
    const commentCount = (content.match(/\/\//g) || []).length + (content.match(/\/\*/g) || []).length;
    let readability: "High" | "Medium" | "Low" = "Medium";
    if (loc > 0 && commentCount / loc > 0.1) readability = "High";
    else if (loc > 150 && commentCount < 2) readability = "Low";

    // Reusability heuristic: generic typings, props, hooks
    const hasProps = content.includes('interface ') || content.includes('type ') || content.includes('Props');
    const hasHooks = content.includes('use') && content.includes('memo');
    let reusability: "High" | "Medium" | "Low" = "Low";
    if (hasProps && hasHooks) reusability = "High";
    else if (hasProps || hasHooks) reusability = "Medium";

    // Complexity heuristic: high lines of code without enough functions means complex block
    let complexity: "High" | "Medium" | "Low" = "Medium";
    if (loc > 200 && functionCount < 3) complexity = "High";
    else if (loc < 50) complexity = "Low";

    return {
      filePath: path,
      signals: {
        modularity,
        readability,
        reusability,
        complexity
      }
    };
  });
}

export function evaluateSolution({
  problem,
  timeTakenMs,
  runCount,
  firstRunTimeMs,
  files,
  framework,
}: EvaluationParams): EvaluationReport {
  const allottedTimeMs = problem.durationMinutes * 60 * 1000;
  
  // 1. Time Score (4 pts)
  let timeScore = 0;
  const timeRatio = timeTakenMs / allottedTimeMs;
  if (timeRatio <= EVALUATION_THRESHOLDS.TIME.EXCELLENT) timeScore = EVALUATION_SCORES.TIME.EXCELLENT;
  else if (timeRatio <= EVALUATION_THRESHOLDS.TIME.GOOD) timeScore = EVALUATION_SCORES.TIME.GOOD;
  else if (timeRatio <= EVALUATION_THRESHOLDS.TIME.FAIR) timeScore = EVALUATION_SCORES.TIME.FAIR;
  else if (timeRatio <= EVALUATION_THRESHOLDS.TIME.POOR) timeScore = EVALUATION_SCORES.TIME.POOR;

  // 2. Iteration Score (3 pts)
  let iterationScore = 0;
  const { ITERATION } = EVALUATION_THRESHOLDS;
  if (runCount >= ITERATION.MIN_OPTIMAL && runCount <= ITERATION.MAX_OPTIMAL) {
    iterationScore = EVALUATION_SCORES.ITERATION.OPTIMAL;
  } else if (runCount > ITERATION.MAX_OPTIMAL && runCount <= ITERATION.MAX_FAIR) {
    iterationScore = EVALUATION_SCORES.ITERATION.TRIAL_ERROR;
  } else if (runCount === 0) {
    iterationScore = 0; // Special case handled below
  } else if (runCount < ITERATION.MIN_OPTIMAL) {
    iterationScore = EVALUATION_SCORES.ITERATION.SUSPICIOUS;
  } else {
    iterationScore = EVALUATION_SCORES.ITERATION.HEAVY_TRIAL;
  }

  // 3. Planning Score (3 pts)
  let planningScore = 0;
  const actualFirstRun = firstRunTimeMs || timeTakenMs;
  const planningRatio = actualFirstRun / timeTakenMs;
  const { PLANNING } = EVALUATION_THRESHOLDS;
  
  if (planningRatio >= PLANNING.MIN_RATIO && planningRatio <= PLANNING.MAX_RATIO) {
    planningScore = EVALUATION_SCORES.PLANNING.BALANCED;
  } else {
    planningScore = EVALUATION_SCORES.PLANNING.UNBALANCED;
  }

  let totalScore = timeScore + iterationScore + planningScore;
  
  // Score Guardrails
  if (totalScore >= 9.8) totalScore = 10.0; // Near perfect case
  else if (totalScore >= 9.0) totalScore = Math.min(totalScore, 9.5); // Most experts capped at 9.5
  
  totalScore = Math.min(EVALUATION_SCORES.MAX_TOTAL, totalScore);

  // Stats
  const planningPercent = Math.round(planningRatio * 100);
  const actualFirstRunTime = actualFirstRun;

  // Feedback Generation
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvementTips: string[] = [];

  // Behavior Insight
  let behaviorAnalysis = "";
  if (runCount === 0) {
    behaviorAnalysis = FEEDBACK_TEMPLATES.ZERO_RUNS.BEHAVIOR;
  } else {
    const efficiencyTrait = runCount <= 10 ? "efficient" : "high-iteration";
    const planningTrait = planningRatio >= 0.2 ? "strong planning" : "impulsive start";
    behaviorAnalysis = `Spent ~${planningPercent}% time in planning before first run, followed by ${efficiencyTrait} execution (${runCount} runs total). Indicates ${planningTrait}.`;
  }

  // Verdict Handling
  let verdict = "";
  let summary = "";
  let isHighRisk = false;

  const isExtremeSpeed = timeRatio < 0.10 && runCount < 5;
  const isSuspiciousSpeed = timeRatio < 0.33 && runCount < 3;

  if (isExtremeSpeed || isSuspiciousSpeed || runCount === 0) {
    totalScore = Math.min(totalScore, 3.0);
    verdict = FEEDBACK_TEMPLATES.HIGH_RISK.VERDICT;
    summary = FEEDBACK_TEMPLATES.HIGH_RISK.SUMMARY;
    behaviorAnalysis = FEEDBACK_TEMPLATES.HIGH_RISK.BEHAVIOR;
    weaknesses.push(...FEEDBACK_TEMPLATES.HIGH_RISK.WEAKNESSES);
    isHighRisk = true;
  } else {
    if (totalScore >= VERDICTS.EXCELLENT.MIN_SCORE) {
      verdict = VERDICTS.EXCELLENT.LABEL;
      summary = VERDICTS.EXCELLENT.SUMMARY;
    } else if (totalScore >= VERDICTS.GOOD.MIN_SCORE) {
      verdict = VERDICTS.GOOD.LABEL;
      summary = VERDICTS.GOOD.SUMMARY;
    } else if (totalScore >= VERDICTS.FAIR.MIN_SCORE) {
      verdict = VERDICTS.FAIR.LABEL;
      summary = VERDICTS.FAIR.SUMMARY;
    } else {
      verdict = VERDICTS.POOR.LABEL;
      summary = VERDICTS.POOR.SUMMARY;
    }
  }

  // Fill default strengths
  if (timeScore >= EVALUATION_SCORES.TIME.GOOD) strengths.push(FEEDBACK_TEMPLATES.STRENGTHS.TIME);
  if (iterationScore >= EVALUATION_SCORES.ITERATION.OPTIMAL) strengths.push(FEEDBACK_TEMPLATES.STRENGTHS.TESTING);
  if (planningScore === EVALUATION_SCORES.PLANNING.BALANCED) strengths.push(FEEDBACK_TEMPLATES.STRENGTHS.PLANNING);

  // Fill weaknesses from templates
  if (timeScore < EVALUATION_SCORES.TIME.GOOD) weaknesses.push(FEEDBACK_TEMPLATES.WEAKNESSES.TIME);
  if (runCount > EVALUATION_THRESHOLDS.ITERATION.MAX_OPTIMAL) weaknesses.push(FEEDBACK_TEMPLATES.WEAKNESSES.TRIAL_ERROR);
  if (planningRatio < EVALUATION_THRESHOLDS.PLANNING.MIN_RATIO) weaknesses.push(FEEDBACK_TEMPLATES.WEAKNESSES.PLANNING);

  // ⚠️ FORCE AT LEAST 2 WEAKNESSES
  const advancedWeaknesses = [...FEEDBACK_TEMPLATES.ADVANCED_WEAKNESSES];
  while (weaknesses.length < 2 && advancedWeaknesses.length > 0) {
    const randomIndex = Math.floor(Math.random() * advancedWeaknesses.length);
    const item = advancedWeaknesses.splice(randomIndex, 1)[0];
    if (!weaknesses.includes(item)) {
      weaknesses.push(item);
    }
  }

  // Tips
  improvementTips.push(FEEDBACK_TEMPLATES.TIPS.STATE);
  if (runCount > 15) improvementTips.push(FEEDBACK_TEMPLATES.TIPS.LOGGING);

  return {
    score: totalScore,
    verdict,
    summary,
    strengths,
    weaknesses: weaknesses.slice(0, 3), // Keep it compact
    behaviorAnalysis,
    improvementTips,
    codeSignals: extractCodeSignals(files),
    fileSignals: extractFileSignals(files),
    scoreTransparencyNote: SCORE_TRANSPARENCY_NOTE,
    stats: {
      timeTaken: formatDuration(timeTakenMs),
      allottedTime: `${problem.durationMinutes}m`,
      runCount,
      planningTime: formatDuration(actualFirstRunTime),
      planningRatio,
    },
    framework,
    isHighRisk,
    timestamp: Date.now(),
  };
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatReportForAI(
  problem: Problem,
  report: EvaluationReport,
  codeSnapshots: Record<string, string>,
  runHistory: string[]
): string {
  const codeSection = Object.entries(codeSnapshots)
    .filter(([path]) => !path.endsWith('.gitkeep'))
    .map(([path, content]) => `--- File: ${path} ---\n${content}`)
    .join('\n\n');

  const framework = report.framework || "react";
  const instruction = framework === "react-native" 
    ? AI_INSTRUCTION_REACT_NATIVE 
    : AI_INSTRUCTION_REACT;

  return `Problem: ${problem.title}
Difficulty: ${problem.level}
Framework: ${framework}
Problem Description:
${problem.description}

--- RECRUITER STATS ---
- Time Spent: ${report.stats.timeTaken} (Allotted: ${report.stats.allottedTime})
- Iterations: ${report.stats.runCount}
- Planning Phase: ${Math.round(report.stats.planningRatio * 100)}% of total time

--- RUN HISTORY (TIMESTAMPS) ---
${runHistory.length > 0 ? runHistory.map((h, i) => `Run #${i + 1}: ${h}`).join('\n') : 'No runs recorded.'}

--- EVALUATION REPORT ---
Score: ${report.score}/10
Verdict: ${report.verdict}
Summary: ${report.summary}

Behavior Analysis: 
${report.behaviorAnalysis}

--- CODE SIGNALS ---
- File Structure: ${report.codeSignals.fileStructure}
- Reusability: ${report.codeSignals.reusability}
- Utilities: ${report.codeSignals.utilities}
- Component Breakdown: ${report.codeSignals.componentBreakdown}

Strengths:
${report.strengths.map(s => `- ${s}`).join('\n')}

Weaknesses:
${report.weaknesses.map(w => `- ${w}`).join('\n')}

${report.scoreTransparencyNote}

--- CODE ---
${codeSection}

--- INSTRUCTION ---
"${instruction}"
`;
}

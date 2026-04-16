import { useState, useEffect } from "react";
import { useProblemStore } from "../../store/useProblemStore";
import { useEvaluationStore } from "../../store/useEvaluationStore";
import { useFileSystem } from "../../hooks/useFileSystem";
import { formatReportForAI } from "../../services/evaluationService";
import styles from "./SolvedSuccessModal.module.css";
import { trackEvent } from "../../services/analytics";

export default function SolvedSuccessModal() {
  const { recentSolvedId, solvedResults, getActiveProblem, clearRecentSolvedId, startSolving } = useProblemStore();
  const { getLatestReport, setSelfRating, getSelfRating } = useEvaluationStore();
  const { snapshot } = useFileSystem();
  
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [selfRating, setLocalSelfRating] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);

  useEffect(() => {
    if (recentSolvedId) {
      setLocalSelfRating(getSelfRating(recentSolvedId));
      
      // Auto-select editable files initially
      const files = snapshot();
      const editableFiles = Object.keys(files).filter(path => !path.endsWith('.gitkeep'));
      setSelectedFiles(editableFiles);
    }
  }, [recentSolvedId, getSelfRating, snapshot]);

  if (!recentSolvedId) return null;

  const problem = getActiveProblem();
  const result = solvedResults[recentSolvedId];
  const report = getLatestReport(recentSolvedId);

  if (!result || !report) return null;

  const handleClose = () => {
    clearRecentSolvedId();
    setCopiedType(null);
    trackEvent("solved_modal_dismissed");
  };

  const handleCopy = (type: "report" | "code" | "combined") => {
    let text = "";
    const files = snapshot();
    const selectedSnapshots = selectedFiles.reduce((acc, path) => {
      acc[path] = files[path] || "";
      return acc;
    }, {} as Record<string, string>);

    if (type === "report") {
      text = `Verdict: ${report.verdict}\nScore: ${report.score}/10\n\n${report.summary}\n\nBehavior: ${report.behaviorAnalysis}`;
    } else if (type === "code") {
      text = Object.entries(selectedSnapshots)
        .map(([path, content]) => `--- File: ${path} ---\n${content}`)
        .join("\n\n");
    } else if (type === "combined") {
      text = formatReportForAI(problem, report, selectedSnapshots, result.runHistory || []);
    }

    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
    trackEvent(`solved_modal_copy_${type}_clicked`);
  };

  const handleRatingChange = (val: number) => {
    setLocalSelfRating(val);
    setSelfRating(recentSolvedId, val);
  };

  const handleSolveAgain = () => {
    clearRecentSolvedId();
    startSolving();
    trackEvent("solved_modal_solve_again_clicked");
  };

  const planningPercent = Math.round(report.stats.planningRatio * 100);

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* ── HEADER ROW ────────────────────────────────────────────────── */}
        <div className={styles.headerRow}>
          <div className={styles.celebrationEmoji}>🎉</div>
          <div className={styles.titleGroup}>
            <h2 className={styles.problemName}>{problem.title}</h2>
            <span className={styles.problemLevel}>({problem.level})</span>
          </div>
        </div>

        {/* ── ROW 1: SCORE & VERDICT ────────────────────────────────────── */}
        <div className={styles.topEvaluationRow}>
          <div className={styles.scoreCard}>
            <span className={styles.scoreValue}>{report.score.toFixed(1)}</span>
            <span className={styles.scoreMax}>/ 10</span>
          </div>
          <div className={`${styles.verdictCard} ${report.isHighRisk ? styles.highRiskVerdict : ""}`}>
            <div className={styles.verdictHeader}>
              <div className={styles.verdictLabel}>{report.verdict}</div>
              {report.isHighRisk && <span className={styles.highRiskBadge}>HIGH RISK</span>}
            </div>
            <div className={styles.summaryText}>{report.summary}</div>
          </div>
        </div>

        {/* ── ROW 2: INLINE STATS ────────────────────────────────────────── */}
        <div className={styles.inlineStats}>
          <div className={styles.statItem}>
            <span>⏱ Time:</span> <span className={styles.statValue}>{result.timeTaken}</span>
          </div>
          <div className={styles.statItem}>
            <span>🔁 Runs:</span> <span className={`${styles.statValue} ${report.stats.runCount === 0 ? styles.dangerText : ""}`}>
              {report.stats.runCount === 0 && "⚠️ "}{report.stats.runCount}
            </span>
          </div>
          <div className={styles.statItem}>
            <span>🧠 Planning:</span> <span className={styles.statValue}>{planningPercent}%</span>
          </div>
        </div>

        {/* ── ROW 3: BEHAVIOR INSIGHT ────────────────────────────────────── */}
        <div className={styles.behaviorRow}>
          <div className={styles.behaviorText}>{report.behaviorAnalysis}</div>
        </div>

        {/* ── ROW 4: MERGED FEEDBACK ─────────────────────────────────────── */}
        <div className={styles.feedbackMergedRow}>
          <div className={styles.feedbackCol}>
            <div className={styles.feedbackTitle}>Strengths</div>
            <div className={styles.feedbackList}>
              {report.strengths.map((s, i) => (
                <div key={i} className={styles.feedbackItem}>
                  <span className={styles.strength}>✓</span> {s}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.feedbackCol}>
            <div className={styles.feedbackTitle}>Improvements</div>
            <div className={styles.feedbackList}>
              {report.weaknesses.map((w, i) => (
                <div key={i} className={styles.feedbackItem}>
                  <span className={styles.weakness}>⚠</span> {w}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 5: CODE SIGNALS (INLINE) ───────────────────────────────── */}
        <div className={styles.signalsSection}>
          <div className={styles.signalsSubtitle}>Code Architecture Signals</div>
          <div className={styles.signalsInline}>
            <div className={styles.signalItem}>Structure: <span>{report.codeSignals.fileStructure}</span></div>
            <div className={styles.signalItem}>Reuse: <span>{report.codeSignals.reusability}</span></div>
            <div className={styles.signalItem}>Utils: <span>{report.codeSignals.utilities}</span></div>
            <div className={styles.signalItem}>Components: <span>{report.codeSignals.componentBreakdown}</span></div>
          </div>
        </div>

        {/* ── ROW 6: ACTIONS & SHARE ─────────────────────────────────────── */}
        <div className={styles.bottomActionsRow}>
          <div className={styles.selfEvalInline}>
            <span className={styles.evalText}>Self Rating: {selfRating}/10</span>
            <div className={styles.sliderContainer}>
              <input 
                type="range" min="1" max="10" 
                value={selfRating} 
                onChange={(e) => handleRatingChange(parseInt(e.target.value))}
                className={styles.slider}
                style={{ "--value": `${(selfRating - 1) * 11.11}%` } as React.CSSProperties}
              />
              {selfRating > 0 && (
                <div className={styles.confidenceLabel}>
                  {(() => {
                    const diff = Math.abs(selfRating - report.score);
                    if (diff <= 1) return <span className={styles.success}>✓ Accurate self-assessment</span>;
                    if (diff <= 3) return <span className={styles.warning}>⚠ Slight mismatch</span>;
                    return <span className={styles.danger}>❌ Large gap in performance perception</span>;
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className={styles.transparencyNote}>{report.scoreTransparencyNote}</div>

          {showFilePicker && (
            <div className={styles.filePicker}>
              {Object.keys(snapshot()).filter(p => !p.endsWith('.gitkeep')).map(path => (
                <label key={path} className={styles.fileLabel}>
                  <input 
                    type="checkbox" 
                    checked={selectedFiles.includes(path)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedFiles([...selectedFiles, path]);
                      else setSelectedFiles(selectedFiles.filter(p => p !== path));
                    }}
                  />
                  <span>{path}</span>
                </label>
              ))}
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button className={styles.copyBtn} onClick={() => handleCopy("report")}>{copiedType === "report" ? "Copied Report" : "Report"}</button>
            <button className={styles.copyBtn} onClick={() => handleCopy("code")}>{copiedType === "code" ? "Copied Code" : "Code"}</button>
            <button className={styles.primaryBtn} onClick={() => handleCopy("combined")}>
              {copiedType === "combined" ? "Copied! Post to ChatGPT" : "Copy Recruiter Report"}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className={styles.closeBtn} onClick={handleClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

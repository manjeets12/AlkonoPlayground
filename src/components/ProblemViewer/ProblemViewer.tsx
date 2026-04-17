import { useProblemStore } from "../../store/useProblemStore";
import ProblemDescription from "../ProblemDescription";
import { trackEvent } from "../../services/analytics";
import { useActionContext } from "../../context/ActionContext";
import { useEvaluationStore } from "../../store/useEvaluationStore";
import { evaluateSolution } from "../../services/evaluationService";
import styles from "./ProblemViewer.module.css";
import { useState } from "react";

export default function ProblemViewer() {
  const { getActiveProblem, setPortalOpen, setDetailedViewOpen, isTimerActive, markAsSolved, timerStartedAt, currentRunTimestamps } = useProblemStore();
  const { getFilesSnapshot, framework } = useActionContext();
  const { addReport } = useEvaluationStore();
  const activeProblem = getActiveProblem();
  const [showOverride, setShowOverride] = useState(false);

  return (
    <div className={styles.container}>
      {/* ── Problem Header ────────────────────────────────────────────── */}
      <div className={styles.problemHeader}>
        <div className={styles.titleRow}>
          <h3 className={styles.problemTitle}>{activeProblem.title}</h3>
          <div className={styles.actions}>
            <button 
              className={styles.changeBtn}
              onClick={() => {
                setPortalOpen(true);
                trackEvent("change_problem_clicked");
              }}
              title="Select different problem"
            >
              Change
            </button>
          </div>
        </div>
        
        <div className={styles.problemMeta}>
          <div className={styles.metaLeft}>
            <span className={`${styles.levelBadge} ${styles[activeProblem.level]}`}>
              {activeProblem.level}
            </span>
            <span className={styles.duration}>⏱ {activeProblem.durationMinutes}m</span>
            {activeProblem.isSolved && (
              <span className={styles.solvedBadge} title="Solved">✓</span>
            )}
          </div>
          <button 
            className={styles.viewDetailsBtn} 
            onClick={() => {
              setDetailedViewOpen(true);
              trackEvent("view_requirements_clicked");
            }}
            title="View full requirement"
          >
            View Details
          </button>
        </div>
      </div>

      {/* ── Summary Content ─────────────────────────────────────────── */}
      <div className={styles.content}>
        <ProblemDescription 
          description={activeProblem.description} 
          variant="preview" 
        />
      </div>

      {/* ── Solve Action ────────────────────────────────────────────── */}
      {isTimerActive && (
        <div className={styles.solvedActionRow}>
          {currentRunTimestamps.length === 0 && !showOverride ? (
            <div className={styles.zeroRunsWarning}>
              <p className={styles.warningText}>Run your code at least once before submitting</p>
              <div className={styles.warningActions}>
                <button 
                  className={styles.overrideBtn}
                  onClick={() => setShowOverride(true)}
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          ) : (
            <button 
              className={styles.markSolvedBtn}
              onClick={() => {
                const activeId = activeProblem.id;
                
                // 1. Get snapshot from context
                const files = getFilesSnapshot();
                
                // 2. Perform evaluation if timer is active
                if (timerStartedAt) {
                  const elapsedMs = Date.now() - timerStartedAt;
                  const firstRunTs = currentRunTimestamps.length > 0 ? currentRunTimestamps[0] : null;

                  const report = evaluateSolution({
                    problem: activeProblem,
                    timeTakenMs: elapsedMs,
                    runCount: currentRunTimestamps.length,
                    firstRunTimeMs: firstRunTs ? firstRunTs - timerStartedAt : null,
                    files,
                    framework
                  });

                  // 3. Save report against problem ID
                  addReport(activeId, report);
                }

                // 4. Mark as solved in store
                markAsSolved(activeId);
                trackEvent("solved_clicked");
              }}
            >
              Mark as Solved
            </button>
          )}
        </div>
      )}
    </div>
  );
}


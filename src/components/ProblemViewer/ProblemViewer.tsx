import { useProblemStore } from "../../store/useProblemStore";
import ProblemDescription from "../ProblemDescription";
import { trackEvent } from "../../services/analytics";
import styles from "./ProblemViewer.module.css";

export default function ProblemViewer() {
  const { getActiveProblem, setPortalOpen, setDetailedViewOpen, isTimerActive, markAsSolved } = useProblemStore();
  const activeProblem = getActiveProblem();

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

      {/* ── Solve Action ────────────────────────────────────────────── */}
      {isTimerActive && (
        <div className={styles.solvedActionRow}>
          <button 
            className={styles.markSolvedBtn}
            onClick={() => {
              markAsSolved(activeProblem.id);
              trackEvent("solved_clicked");
            }}
          >
            Mark as Solved
          </button>
        </div>
      )}

      {/* ── Summary Content ─────────────────────────────────────────── */}
      <div className={styles.content}>
        <ProblemDescription 
          description={activeProblem.description} 
          variant="preview" 
        />
      </div>
    </div>
  );
}


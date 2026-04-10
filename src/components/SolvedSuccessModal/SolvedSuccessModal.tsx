import { useState } from "react";
import { useProblemStore } from "../../store/useProblemStore";
import styles from "./SolvedSuccessModal.module.css";
import { trackEvent } from "../../services/analytics";

export default function SolvedSuccessModal() {
  const { recentSolvedId, solvedResults, getActiveProblem, clearRecentSolvedId } = useProblemStore();
  const [copied, setCopied] = useState(false);

  if (!recentSolvedId) return null;

  const problem = getActiveProblem();
  const result = solvedResults[recentSolvedId];

  if (!result) return null;

  const handleClose = () => {
    clearRecentSolvedId();
    setCopied(false);
    trackEvent("solved_modal_dismissed");
  };

  const handleCopyJSON = () => {
    const stats = {
      problem: {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        level: problem.level,
        allottedTimeMinutes: problem.durationMinutes,
      },
      result: {
        timeTaken: result.timeTaken,
        isWithinTime: result.isWithinTime,
        overshoot: result.overshoot || null,
        timestamp: new Date(result.timestamp).toISOString(),
      },
      runHistory: result.runHistory || [],
    };

    navigator.clipboard.writeText(JSON.stringify(stats, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackEvent("solved_modal_copy_json_clicked");
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.celebration}>🎉</div>
        <h2 className={styles.title}>Challenge Completed!</h2>
        <p className={styles.subtitle}>{problem.title}</p>

        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Time Taken</span>
            <span className={styles.statValue}>{result.timeTaken}</span>
          </div>
          
          <div className={`${styles.statItem} ${result.isWithinTime ? styles.success : styles.warning}`}>
            <span className={styles.statLabel}>Status</span>
            <span className={styles.statValue}>
              {result.isWithinTime ? "Within Time" : "Time Overshot"}
            </span>
          </div>

          {result.overshoot && (
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Overshoot</span>
              <span className={`${styles.statValue} ${styles.warning}`}>{result.overshoot}</span>
            </div>
          )}
        </div>

        {result.runHistory && result.runHistory.length > 0 && (
          <div className={styles.historySection}>
            <div className={styles.historyHeader}>Run History</div>
            <div className={styles.historyList}>
              {result.runHistory.map((time, idx) => (
                <div key={idx} className={styles.historyItem}>
                  <span className={styles.historyIndex}>Run #{idx + 1}</span>
                  <span className={styles.historyTime}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button className={styles.copyBtn} onClick={handleCopyJSON}>
            {copied ? "Copied!" : "Copy Details as JSON"}
          </button>
          <button className={styles.closeBtn} onClick={handleClose}>
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}

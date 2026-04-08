import { useState } from "react";
import { useProblemStore } from "../../store/useProblemStore";
import styles from "./ProblemViewer.module.css";

export default function ProblemViewer() {
  const [problemOpen, setProblemOpen] = useState(true);
  const { getActiveProblem, setPortalOpen, setDetailedViewOpen } = useProblemStore();
  const activeProblem = getActiveProblem();

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        {problemOpen && (
          <button 
            className={styles.changeBtn}
            onClick={() => setPortalOpen(true)}
          >
            Change
          </button>
        )}
        <button
          onClick={() => setProblemOpen((v) => !v)}
          aria-expanded={problemOpen}
          className={styles.sectionButton}
        >
          <span className={styles.sectionLabel}>Problem</span>
          <span
            className={styles.sectionChevron}
            style={{
              transform: problemOpen ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            ▶
          </span>
        </button>
      </div>

      {problemOpen && (
        <div className={styles.sectionContent}>
          <div className={styles.problemHeader}>
            <div className={styles.titleRow}>
              <h3 className={styles.problemTitle}>{activeProblem.title}</h3>
              <button 
                className={styles.expandBtn} 
                onClick={() => setDetailedViewOpen(true)}
                title="View in Detail"
              >
                📄
              </button>
            </div>
            <div className={styles.problemMeta}>
              <span className={`${styles.levelBadge} ${styles[activeProblem.level]}`}>
                {activeProblem.level}
              </span>
              <span className={styles.duration}>⏱ {activeProblem.durationMinutes}m</span>
            </div>
          </div>
          <pre className={styles.problemText}>
            {activeProblem.description}
          </pre>
        </div>
      )}
    </div>
  );
}


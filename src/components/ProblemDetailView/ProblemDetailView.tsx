import { useProblemStore } from "../../store/useProblemStore";
import styles from "./ProblemDetailView.module.css";

export default function ProblemDetailView() {
  const { getActiveProblem, setDetailedViewOpen, startSolving, isTimerActive } = useProblemStore();
  const problem = getActiveProblem();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button 
          className={styles.backBtn}
          onClick={() => setDetailedViewOpen(false)}
        >
          ← Back to Code
        </button>
        <div className={styles.meta}>
          <span className={`${styles.levelBadge} ${styles[problem.level]}`}>
            {problem.level}
          </span>
          <span className={styles.duration}>⏱ {problem.durationMinutes} minutes</span>
        </div>
      </header>

      <main className={styles.content}>
        <h1 className={styles.title}>{problem.title}</h1>
        <div className={styles.divider} />
        <pre className={styles.description}>
          {problem.description}
        </pre>

        <div className={styles.footerAction}>
          <button 
            className={styles.startBtn}
            onClick={() => startSolving()}
            disabled={isTimerActive}
          >
            {isTimerActive ? "Solving in Progress..." : "Start Solving"}
          </button>
        </div>
      </main>
    </div>
  );
}

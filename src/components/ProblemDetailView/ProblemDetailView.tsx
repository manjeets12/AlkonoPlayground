import { useProblemStore } from "../../store/useProblemStore";
import ProblemDescription from "../ProblemDescription";
import styles from "./ProblemDetailView.module.css";

export default function ProblemDetailView() {
  const { getActiveProblem, setDetailedViewOpen, startSolving, isTimerActive, markAsSolved } = useProblemStore();
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
          {problem.isSolved && (
            <span className={styles.solvedBadge}>✓ Solved</span>
          )}
          <span className={`${styles.levelBadge} ${styles[problem.level]}`}>
            {problem.level}
          </span>
          <span className={styles.duration}>⏱ {problem.durationMinutes} minutes</span>
        </div>
      </header>

      <main className={styles.content}>
        <h1 className={styles.title}>{problem.title}</h1>
        <ProblemDescription 
          description={problem.description} 
          variant="detailed" 
        />

        {problem.images && problem.images.length > 0 && (
          <div className={styles.imagesContainer}>
            <p className={styles.imagesTitle}>Sample Implementation:</p>
            <div className={styles.imagesList}>
              {problem.images.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`${problem.title} Sample ${idx + 1}`} 
                  className={styles.imageItem}
                  onClick={() => window.open(img, '_blank')}
                />
              ))}
            </div>
          </div>
        )}

        <div className={styles.footerAction}>
          {!problem.isSolved && (
            <button 
              className={styles.startBtn}
              onClick={() => startSolving()}
              disabled={isTimerActive}
            >
              {isTimerActive ? "Solving in Progress..." : "Start Solving"}
            </button>
          )}
          
          {isTimerActive && (
            <button 
              className={styles.solvedBtn}
              onClick={() => markAsSolved(problem.id)}
            >
              Mark as Solved
            </button>
          )}

          {problem.isSolved && !isTimerActive && (
            <button 
              className={styles.startBtn}
              onClick={() => startSolving()}
            >
              Solve Again
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

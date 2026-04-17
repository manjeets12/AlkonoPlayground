import { useEvaluationStore } from "../../store/useEvaluationStore";
import { useProblemStore } from "../../store/useProblemStore";
import styles from "./MyReportsModal.module.css";
import { trackEvent } from "../../services/analytics";

export default function MyReportsModal() {
  const { isHistoryModalOpen, setHistoryModalOpen, reports, setViewingReport } = useEvaluationStore();
  const { getProblems } = useProblemStore();

  if (!isHistoryModalOpen) return null;

  // Flatten reports from Record<string, EvaluationReport[]> into a sorted array
  const allReports = Object.entries(reports || {}).flatMap(([problemId, problemReports]) => {
    if (!Array.isArray(problemReports)) return [];
    
    // Call getProblems() to get both default and user problems
    const allProblemsList = getProblems();
    const problem = allProblemsList.find(p => p.id === problemId);

    return problemReports.map(report => ({
      problemId,
      problemTitle: problem?.title || "Unknown Problem",
      problemLevel: problem?.level || "Medium",
      report
    }));
  }).sort((a, b) => (b.report?.timestamp || 0) - (a.report?.timestamp || 0));

  const handleClose = () => {
    setHistoryModalOpen(false);
    trackEvent("profile_history_closed");
  };

  const handleViewReport = (problemId: string, timestamp: number) => {
    setViewingReport({ problemId, timestamp });
    trackEvent("profile_report_view_clicked");
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>My Evaluation History</h2>
          <button className={styles.closeIcon} onClick={handleClose}>✕</button>
        </div>

        <div className={styles.content}>
          {allReports.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📂</span>
              <p>No reports yet. Start solving challenges to build your profile!</p>
            </div>
          ) : (
            <div className={styles.list}>
              {allReports.map(({ problemId, problemTitle, problemLevel, report }) => {
                const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
                const formattedDate = report.timestamp ? new Date(report.timestamp).toLocaleString(undefined, dateOpts) : 'N/A';
                
                // Get top 2 signals safely
                const topSignals = report.fileSignals?.[0]?.signals || { modularity: "N/A", readability: "N/A" };
                
                return (
                  <div 
                    key={`${problemId}-${report.timestamp}`}
                    className={styles.reportRow}
                    onClick={() => handleViewReport(problemId, report.timestamp)}
                  >
                    <div className={styles.mainInfo}>
                      <div className={styles.reportHeader}>
                        <span className={styles.problemName}>{problemTitle}</span>
                        <span className={styles.problemLevel}>{problemLevel}</span>
                        <span className={styles.bullet}>•</span>
                        <span className={styles.timestamp}>{formattedDate}</span>
                        <span className={styles.bullet}>•</span>
                        <span className={styles.allottedTime}>{report.stats.allottedTime}</span>
                      </div>
                      <div className={styles.verdictBadge}>{report.verdict}</div>
                      
                      {report.fileSignals && report.fileSignals.length > 0 && (
                        <div className={styles.miniPills}>
                          <div className={styles.pill}>
                            <span className={styles.pillLabel}>MOD:</span>
                            <span className={`${styles.pillValue} ${styles[topSignals.modularity.toLowerCase()] || ''}`}>{topSignals.modularity}</span>
                          </div>
                          <div className={styles.pill}>
                            <span className={styles.pillLabel}>READ:</span>
                            <span className={`${styles.pillValue} ${styles[topSignals.readability.toLowerCase()] || ''}`}>{topSignals.readability}</span>
                          </div>
                        </div>
                      )}
                    </div>

                  <div className={styles.statsArea}>
                    <div className={styles.scoreContainer}>
                      <span className={styles.scoreValue}>{report.score.toFixed(1)}</span>
                      <span className={styles.scoreLabel}>/ 10</span>
                    </div>
                    <button className={styles.viewBtn}>View Report</button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

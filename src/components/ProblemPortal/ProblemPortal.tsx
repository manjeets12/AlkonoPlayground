import React, { useState } from "react";
import { useProblemStore } from "../../store/useProblemStore";
import type { ProblemLevel } from "../../types/problem";
import { trackEvent } from "../../services/analytics";
import styles from "./ProblemPortal.module.css";

export default function ProblemPortal() {
  const { 
    getProblems, 
    activeProblemId, 
    setPortalOpen, 
    addProblem, 
    selectProblem, 
    deleteProblem 
  } = useProblemStore();

  const problems = getProblems();

  const [isCreating, setIsCreating] = useState(false);
  const [levelFilter, setLevelFilter] = useState<ProblemLevel | "all">("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationMinutes: 30,
    level: "medium" as ProblemLevel,
    imageUrl: "",
  });

  const filteredProblems = problems.filter(p => levelFilter === "all" || p.level === levelFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description) {
      const { imageUrl, ...rest } = formData;
      addProblem({
        ...rest,
        images: imageUrl ? [imageUrl] : [],
      });
      setIsCreating(false);
      setFormData({ 
        title: "", 
        description: "", 
        durationMinutes: 30, 
        level: "medium", 
        imageUrl: "" 
      });
      trackEvent("new_problem_submission_clicked");
    }
  };

  return (
    <div className={styles.overlay} onClick={() => setPortalOpen(false)}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isCreating ? "New Challenge" : "Select Problem"}</h2>
          <button className={styles.closeBtn} onClick={() => setPortalOpen(false)} aria-label="Close portal">✕</button>
        </div>

        <div className={styles.content}>
          {!isCreating ? (
            <>
              <div className={styles.filterRow}>
                {(["all", "easy", "medium", "hard"] as const).map(lvl => (
                  <button 
                    key={lvl}
                    className={`${styles.filterTab} ${levelFilter === lvl ? styles.activeTab : ""}`}
                    onClick={() => setLevelFilter(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              <div className={styles.list}>
                {filteredProblems.map((p) => (
                  <div 
                    key={p.id} 
                    className={`${styles.item} ${p.id === activeProblemId ? styles.active : ""}`}
                    onClick={() => selectProblem(p.id)}
                  >
                    <div className={styles.itemHeader}>
                      <div className={styles.titleGroup}>
                        {p.isSolved && <span className={styles.solvedTag} title="Solved">✓</span>}
                        <span className={styles.itemTitle}>{p.title}</span>
                      </div>
                      <span className={`${styles.levelBadge} ${styles[p.level]}`}>{p.level}</span>
                    </div>
                    <div className={styles.itemMeta}>
                      <span>⏱ {p.durationMinutes}m</span>
                      {!p.isDefault && (
                        <button 
                          className={styles.deleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProblem(p.id);
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button 
                className={styles.createBtn} 
                onClick={() => {
                  setIsCreating(true);
                  trackEvent("create_new_challenge_clicked");
                }}
              >
                + Create New Challenge
              </button>

              <div className={styles.seoFooter}>
                <h4>About AlkonoPlayground</h4>
                <p>
                  AlkonoPlayground is a free, browser-based machine coding platform designed specifically for 
                  frontend developers preparing for React and React Native technical interviews. 
                  Practice real-world coding challenges, master mobile UI patterns, and refine your 
                  problem-solving skills in an environment that simulates professional machine coding rounds.
                </p>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>Title</label>
                <input 
                  autoFocus
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Memory Game"
                  required
                />
              </div>
              
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label>Duration (min)</label>
                  <input 
                    type="number"
                    value={formData.durationMinutes}
                    onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value) || 0})}
                    min="1"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Level</label>
                  <select 
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value as ProblemLevel})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label>Description</label>
                <textarea 
                  rows={8}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the challenge..."
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Sample Image URL (Optional)</label>
                <input 
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.png"
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={() => setIsCreating(false)}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Save & Start</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

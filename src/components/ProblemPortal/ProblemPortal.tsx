import React, { useState } from "react";
import { useProblemStore } from "../../store/useProblemStore";
import type { ProblemLevel } from "../../types/problem";
import styles from "./ProblemPortal.module.css";

export default function ProblemPortal() {
  const { 
    problems, 
    activeProblemId, 
    isPortalOpen, 
    setPortalOpen, 
    addProblem, 
    selectProblem, 
    deleteProblem 
  } = useProblemStore();

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationMinutes: 30,
    level: "medium" as ProblemLevel,
  });

  if (!isPortalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description) {
      addProblem(formData);
      setIsCreating(false);
      setFormData({ title: "", description: "", durationMinutes: 30, level: "medium" });
    }
  };

  return (
    <div className={styles.overlay} onClick={() => setPortalOpen(false)}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{isCreating ? "New Challenge" : "Select Problem"}</h2>
          <button className={styles.closeBtn} onClick={() => setPortalOpen(false)}>✕</button>
        </div>

        <div className={styles.content}>
          {!isCreating ? (
            <>
              <div className={styles.list}>
                {problems.map((p) => (
                  <div 
                    key={p.id} 
                    className={`${styles.item} ${p.id === activeProblemId ? styles.active : ""}`}
                    onClick={() => selectProblem(p.id)}
                  >
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>{p.title}</span>
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
              <button className={styles.createBtn} onClick={() => setIsCreating(true)}>
                + Create New Challenge
              </button>
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

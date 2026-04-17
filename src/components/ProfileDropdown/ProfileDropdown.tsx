import { useState, useRef, useEffect } from "react";
import { useEvaluationStore } from "../../store/useEvaluationStore";
import styles from "./ProfileDropdown.module.css";
import { trackEvent } from "../../services/analytics";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { setHistoryModalOpen, clearAllData } = useEvaluationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) trackEvent("profile_dropdown_opened");
  };

  const handleMyReports = () => {
    setHistoryModalOpen(true);
    setIsOpen(false);
    trackEvent("profile_my_reports_clicked");
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all your evaluation history? This cannot be undone.")) {
      clearAllData();
      setIsOpen(false);
      trackEvent("profile_clear_data_clicked");
    }
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button 
        className={styles.profileBtn} 
        onClick={handleToggle}
        aria-label="Profile"
      >
        <span className={styles.icon}>👤</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <button className={styles.menuItem} onClick={handleMyReports}>
             My Reports
          </button>
          <div className={styles.divider} />
          <button className={styles.menuItemDanger} onClick={handleClear}>
             Clear All Data
          </button>
          <div className={styles.divider} />
          <div className={styles.menuInfo}>
            <span className={styles.futureFlag}>GitHub login coming soon</span>
          </div>
        </div>
      )}
    </div>
  );
}

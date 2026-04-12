import { useState } from "react";
import styles from "./FooterBar.module.css";
import { useProblemTimer } from "../../hooks/useProblemTimer";
import { THEMES } from "../../utils/editorThemes";
import type { ThemeId } from "../../utils/editorThemes";
import type { DifficultyMode } from "../../types/settings";

export type Framework = "react" | "react-native";

interface FooterBarProps {
  framework: Framework;
  onChange: (fw: Framework) => void;
  onFormat: () => void;
  onToggleFullscreen: () => void;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  onSave: () => void;
  isSaving?: boolean;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  difficultyMode: DifficultyMode;
  onDifficultyChange: (mode: DifficultyMode) => void;
}

export default function FooterBar({
  framework,
  onChange,
  onFormat,
  onToggleFullscreen,
  isLeftPanelOpen,
  isRightPanelOpen,
  onToggleLeftPanel,
  onToggleRightPanel,
  onSave,
  isSaving,
  theme,
  onThemeChange,
  difficultyMode,
  onDifficultyChange,
}: FooterBarProps) {
  const { formattedTime, isOver, isTimerActive, formattedOvershoot } = useProblemTimer();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);

  const handleThemeSelect = (newTheme: ThemeId) => {
    onThemeChange(newTheme);
    setIsSettingsOpen(false);
  };

  const handleModeSelect = (newMode: DifficultyMode) => {
    onDifficultyChange(newMode);
    setIsModeMenuOpen(false);
  };

  const modeDescriptions: Record<DifficultyMode, string> = {
    easy: "Colors + Linting",
    medium: "Colors only",
    hard: "Plain text",
  };

  return (
    <footer className={styles.root}>
      <div className={styles.left}>
        <button
          onClick={onToggleLeftPanel}
          className={styles.toggleButton}
          title={isLeftPanelOpen ? "Hide left panel" : "Show left panel"}
          aria-label={isLeftPanelOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isLeftPanelOpen ? "◀ Sidebar" : "▶ Sidebar"}
        </button>
        <div className={styles.divider} />
        <span className={styles.statusLabel}>✓ No errors</span>
        {isSaving && (
          <span className={styles.savedMessage}>
            <span className={styles.savedDot} />
            Saved!
          </span>
        )}
      </div>

      <div className={styles.center}>
        <div className={styles.selectWrapper}>
          <span className={styles.label}>Language:</span>
          <select
            value={framework}
            onChange={(e) => onChange(e.target.value as Framework)}
            className={styles.select}
          >
            <option value="react-native">React Native</option>
            <option value="react">React</option>
          </select>
          <span className={styles.chevron}>▼</span>
        </div>

        <div className={styles.divider} />

        <button
          className={styles.button}
          onClick={onFormat}
          title="Format code with Prettier"
          aria-label="Format code using Prettier"
        >
          <span className={styles.icon}>✨</span>
          PRETTIER
        </button>

        <div className={styles.divider} />

        <button
          className={styles.saveButton}
          onClick={onSave}
          title="Save project (Cmd/Ctrl + S)"
          aria-label="Save current project to local storage"
        >
          <span className={styles.icon}>💾</span>
          SAVE
        </button>

        <div className={styles.divider} />

        <button
          className={styles.button}
          onClick={onToggleFullscreen}
          title="Toggle fullscreen editor"
          aria-label="Toggle fullscreen mode"
        >
          <span className={styles.icon}>⛶</span>
          FULLSCREEN
        </button>

        <div className={styles.divider} />

        <div className={styles.modeWrapper}>
          <span className={styles.label}>Mode:</span>
          <button
            className={`${styles.activeModeBtn} ${isModeMenuOpen ? styles.activeModeBtnOpen : ''} ${styles[`mode_${difficultyMode}`]}`}
            onClick={() => {
              setIsModeMenuOpen(!isModeMenuOpen);
              setIsSettingsOpen(false);
            }}
            aria-label={`Select difficulty mode (current: ${difficultyMode})`}
            aria-expanded={isModeMenuOpen}
          >
            {difficultyMode.toUpperCase()}
            <span className={styles.chevronSmall}>▼</span>
          </button>

          {isModeMenuOpen && (
            <div className={styles.modeMenu}>
              <div className={styles.menuHeader}>SELECT DIFFICULTY</div>
              {(['easy', 'medium', 'hard'] as const).map((m) => (
                <button
                  key={m}
                  className={`${styles.menuItem} ${difficultyMode === m ? styles.menuItemActive : ''}`}
                  onClick={() => handleModeSelect(m)}
                >
                  <div className={styles.menuItemContent}>
                    <span className={`${styles.modeDot} ${styles[`dot_${m}`]}`} />
                    <div className={styles.modeTextWrapper}>
                      <span className={styles.modeLabel}>{m.toUpperCase()}</span>
                      <span className={styles.modeDesc}>{modeDescriptions[m]}</span>
                    </div>
                  </div>
                  {difficultyMode === m && <span className={styles.activeDot} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>


      <div className={styles.right}>
        {isTimerActive && (
          <div className={`${styles.timerContainer} ${isOver ? styles.timerOver : ''}`}>
            {isOver && (
              <span className={styles.toast}>
                Time's up! {formattedOvershoot && `(+${formattedOvershoot})`}
              </span>
            )}
            <span className={styles.time}>{formattedTime}</span>
          </div>
        )}
        <div className={styles.divider} />
        
        {/* ── Settings / Theme Switcher ──────────────────────────────── */}
        <div className={styles.settingsWrapper}>
          <svg
            className={`${styles.settingsIcon} ${isSettingsOpen ? styles.settingsIconActive : ''}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <title>Editor Settings</title>
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            <title>Editor Settings</title>
            <desc>Editor Settings and Theme Selector</desc>
          </svg>

          {isSettingsOpen && (
            <div className={styles.settingsMenu}>
              <div className={styles.menuHeader}>SELECT THEME</div>
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  className={`${styles.menuItem} ${theme === t.id ? styles.menuItemActive : ''}`}
                  onClick={() => handleThemeSelect(t.id)}
                >
                  {t.name.toUpperCase()}
                  {theme === t.id && <span className={styles.activeDot} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.divider} />
        <button
          onClick={onToggleRightPanel}
          className={styles.toggleButton}
          title={isRightPanelOpen ? "Hide right panel" : "Show right panel"}
          aria-label={isRightPanelOpen ? "Close preview" : "Open preview"}
        >
          {isRightPanelOpen ? "PREVIEW ▶" : "PREVIEW ◀"}
        </button>
      </div>
    </footer>
  );
}


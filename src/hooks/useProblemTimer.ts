import { useState, useEffect } from 'react';
import { useProblemStore } from '../store/useProblemStore';

export function useProblemTimer() {
  const { timerStartedAt, isTimerActive, getActiveProblem } = useProblemStore();
  const problem = getActiveProblem();
  
  // Single ticker for UI re-renders
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isTimerActive || !timerStartedAt) return;

    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isTimerActive, timerStartedAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Derived State (Current - End) ──────────────────────────────────────────
  if (!isTimerActive || !timerStartedAt) {
    return {
      timeLeft: null,
      isOver: false,
      formattedTime: null,
      overshootSeconds: 0,
      formattedOvershoot: null,
      isTimerActive: false
    };
  }

  const durationMs = problem.durationMinutes * 60 * 1000;
  const endTimestamp = timerStartedAt + durationMs;
  
  const isOverValue = now >= endTimestamp;
  
  // Direct diffs as per user suggestion
  const remainingSeconds = Math.max(0, Math.floor((endTimestamp - now) / 1000));
  const overshootSeconds = Math.max(0, Math.floor((now - endTimestamp) / 1000));

  return {
    timeLeft: remainingSeconds,
    isOver: isOverValue,
    formattedTime: formatTime(remainingSeconds),
    overshootSeconds,
    formattedOvershoot: overshootSeconds > 0 ? formatTime(overshootSeconds) : null,
    isTimerActive
  };
}

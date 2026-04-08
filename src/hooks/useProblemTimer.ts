import { useState, useEffect } from 'react';
import { useProblemStore } from '../store/useProblemStore';

export function useProblemTimer() {
  const { timerStartedAt, isTimerActive, getActiveProblem } = useProblemStore();
  const problem = getActiveProblem();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    if (!isTimerActive || !timerStartedAt) {
      setTimeLeft(null);
      setIsOver(false);
      return;
    }

    const durationSeconds = problem.durationMinutes * 60;
    
    const tick = () => {
      const elapsedSeconds = Math.floor((Date.now() - timerStartedAt) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsedSeconds);
      
      setTimeLeft(remaining);
      setIsOver(remaining <= 0);
    };

    tick(); // initial call
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, timerStartedAt, problem.durationMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isOver,
    formattedTime: timeLeft !== null ? formatTime(timeLeft) : null,
    isTimerActive
  };
}

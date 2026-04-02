import { useWorkTrackerStore } from '../store/useWorkTrackerStore';

export function useWorkTrackerActions() {
  const startDay = useWorkTrackerStore((state) => state.startDay);
  const takeBreak = useWorkTrackerStore((state) => state.takeBreak);
  const resumeWork = useWorkTrackerStore((state) => state.resumeWork);
  const endDay = useWorkTrackerStore((state) => state.endDay);
  const syncDayBoundary = useWorkTrackerStore((state) => state.syncDayBoundary);
  const toggleTheme = useWorkTrackerStore((state) => state.toggleTheme);
  const markAlertTriggered = useWorkTrackerStore((state) => state.markAlertTriggered);
  const resetAlertFlags = useWorkTrackerStore((state) => state.resetAlertFlags);

  return {
    endDay,
    markAlertTriggered,
    resetAlertFlags,
    resumeWork,
    startDay,
    syncDayBoundary,
    takeBreak,
    toggleTheme,
  };
}

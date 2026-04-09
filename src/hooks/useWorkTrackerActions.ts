import { useWorkTrackerStore } from '../store/useWorkTrackerStore';

export function useWorkTrackerActions() {
  const startDay = useWorkTrackerStore((state) => state.startDay);
  const takeBreak = useWorkTrackerStore((state) => state.takeBreak);
  const resumeWork = useWorkTrackerStore((state) => state.resumeWork);
  const endDay = useWorkTrackerStore((state) => state.endDay);
  const addManualSession = useWorkTrackerStore((state) => state.addManualSession);
  const completeActiveSession = useWorkTrackerStore((state) => state.completeActiveSession);
  const updateSession = useWorkTrackerStore((state) => state.updateSession);
  const syncDayBoundary = useWorkTrackerStore((state) => state.syncDayBoundary);
  const markAlertTriggered = useWorkTrackerStore((state) => state.markAlertTriggered);
  const resetAlertFlags = useWorkTrackerStore((state) => state.resetAlertFlags);

  return {
    addManualSession,
    completeActiveSession,
    endDay,
    markAlertTriggered,
    resetAlertFlags,
    resumeWork,
    startDay,
    syncDayBoundary,
    takeBreak,
    updateSession,
  };
}

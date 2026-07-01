import { useEffect } from 'react';
import { ActionButtons } from './components/ActionButtons';
import { CalendarScheduleCard } from './components/CalendarScheduleCard';
import { DashboardHeader } from './components/DashboardHeader';
import { LiveTimerCard } from './components/LiveTimerCard';
import { ManualEntryCard } from './components/ManualEntryCard';
import { PushNotificationPanel } from './components/PushNotificationPanel';
import { SessionTable } from './components/SessionTable';
import { StatsCard } from './components/StatsCard';
import { useDarkMode } from './hooks/useDarkMode';
import { useNotificationPermission } from './hooks/useNotificationPermission';
import { useWorkAlerts } from './hooks/useWorkAlerts';
import { useWorkTrackerActions } from './hooks/useWorkTrackerActions';
import { useWorkTrackerMetrics } from './hooks/useWorkTrackerMetrics';
import { formatMinutesAsClock, formatTime } from './utils/time';

function App() {
  useDarkMode();
  const permission = useNotificationPermission();
  const { syncDayBoundary } = useWorkTrackerActions();
  const {
    activeSession,
    currentDateLabel,
    expectedLeaveTime,
    isOvertime,
    overtimeMinutes,
    remainingMinutes,
    sessionRows,
    totalWorkedMinutes,
  } = useWorkTrackerMetrics();

  useEffect(() => {
    syncDayBoundary();
  }, [syncDayBoundary]);

  useWorkAlerts();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-slate-100 transition-colors duration-300">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:px-8">
        <DashboardHeader currentDate={currentDateLabel} notificationPermission={permission} />

        <main className="mt-6 flex-1 space-y-5 sm:mt-8 sm:space-y-6">
          <section className="grid gap-3 sm:gap-4 md:grid-cols-3">
            <StatsCard
              label="Total Worked Time"
              value={formatMinutesAsClock(totalWorkedMinutes)}
              tone={isOvertime ? 'success' : 'default'}
              helper={
                isOvertime
                  ? `${formatMinutesAsClock(overtimeMinutes)} overtime`
                  : activeSession
                    ? 'Live session included'
                    : 'Across all sessions today'
              }
            />
            <StatsCard
              label={isOvertime ? 'Overtime' : 'Remaining Time'}
              value={formatMinutesAsClock(Math.abs(remainingMinutes))}
              tone={isOvertime ? 'success' : remainingMinutes <= 30 ? 'warning' : 'default'}
              helper={isOvertime ? 'Target exceeded' : 'Target is 08:15'}
            />
            <StatsCard
              label="Expected Leave Time"
              value={isOvertime ? 'Completed' : formatTime(expectedLeaveTime)}
              tone={isOvertime ? 'success' : 'default'}
              helper={
                isOvertime
                  ? `${formatMinutesAsClock(overtimeMinutes)} beyond target`
                  : 'Based on current progress'
              }
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr] xl:items-start xl:gap-6">
            <div className="order-2 space-y-5 xl:order-1 xl:space-y-6">
              <ActionButtons />
              <PushNotificationPanel />
              <CalendarScheduleCard />
              <ManualEntryCard />
              <SessionTable rows={sessionRows} />
            </div>
            <div className="order-1 xl:order-2 xl:sticky xl:top-8">
              <LiveTimerCard activeSession={activeSession} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;

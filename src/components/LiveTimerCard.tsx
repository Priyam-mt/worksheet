import type { Session } from '../types/work-session';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { formatDurationHms, formatTime, getSessionDurationSeconds } from '../utils/time';

interface LiveTimerCardProps {
  activeSession?: Session;
}

export function LiveTimerCard({ activeSession }: LiveTimerCardProps) {
  const now = useCurrentTime();
  const elapsedSeconds = activeSession ? getSessionDurationSeconds(activeSession, now) : 0;

  return (
    <aside className="rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 sm:p-6">
      <div className="space-y-5 sm:space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">
            Live Session
          </p>
          <h2 className="mt-2 font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-2xl font-semibold text-slate-950 dark:text-white">
            {activeSession ? 'Currently tracking' : 'No active session'}
          </h2>
        </div>

        <div className="rounded-[24px] border border-slate-200/70 bg-slate-950 px-4 py-7 text-center shadow-inner dark:border-white/10 dark:bg-slate-950 sm:px-6 sm:py-8">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-300">
            Elapsed
          </p>
          <p className="mt-4 font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            {formatDurationHms(elapsedSeconds)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-800/80">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Started At</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {activeSession ? formatTime(activeSession.start) : '--'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-800/80">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Live Clock</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
              {formatTime(now)}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

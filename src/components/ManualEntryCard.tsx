import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useWorkTrackerActions } from '../hooks/useWorkTrackerActions';
import { useWorkTrackerStore } from '../store/useWorkTrackerStore';
import { formatDate } from '../utils/time';

function getDefaultRange() {
  const end = dayjs().startOf('minute');
  const start = end.subtract(1, 'hour');

  return {
    start: start.format('HH:mm'),
    end: end.format('HH:mm'),
  };
}

export function ManualEntryCard() {
  const defaults = useMemo(() => getDefaultRange(), []);
  const [startTime, setStartTime] = useState(defaults.start);
  const [endTime, setEndTime] = useState(defaults.end);
  const [isOpenSession, setIsOpenSession] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'error' | 'success'>('success');
  const { addManualSession } = useWorkTrackerActions();
  const trackingDate = useWorkTrackerStore((state) => state.trackingDate);
  const sessions = useWorkTrackerStore((state) => state.sessions);
  const hasActiveSession = sessions.some((session) => !session.end);
  const baseDate = trackingDate ?? dayjs().format('YYYY-MM-DD');
  const displayDate = formatDate(baseDate);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const start = dayjs(`${baseDate}T${startTime}`);
    const end = dayjs(`${baseDate}T${endTime}`);
    const result = addManualSession(
      start.toISOString(),
      isOpenSession ? undefined : end.toISOString(),
    );

    if (!result.success) {
      setFeedbackTone('error');
      setFeedback(result.error ?? 'Could not save the manual session.');
      return;
    }

    setFeedbackTone('success');
    setFeedback(
      isOpenSession
        ? 'Active manual session started from the selected time.'
        : "Manual entry added to today's timeline.",
    );
  };

  return (
    <section className="rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 sm:p-6">
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-xl font-semibold text-slate-950 dark:text-white">
            Manual Entry
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Missed the buttons? Add a completed session or start an active one from an earlier time.
          </p>
        </div>

        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Start time</span>
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              disabled={hasActiveSession}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-800 dark:text-white"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">End time</span>
            <input
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              disabled={hasActiveSession || isOpenSession}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-800 dark:text-white"
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={hasActiveSession}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300 dark:disabled:bg-emerald-900/60 md:w-auto"
            >
              {isOpenSession ? 'Start From Time' : 'Add Entry'}
            </button>
          </div>
        </form>

        <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 sm:items-center">
          <input
            type="checkbox"
            checked={isOpenSession}
            onChange={(event) => setIsOpenSession(event.target.checked)}
            disabled={hasActiveSession}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-white/20 dark:bg-slate-800 sm:mt-0"
          />
          Keep this session active and resume from the selected start time
        </label>

        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500 dark:text-slate-300">
            Date:{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-100">{displayDate}</span>
          </p>
          {hasActiveSession ? (
            <p className="text-amber-600 dark:text-amber-300">
              Finish the current live session before adding another manual one.
            </p>
          ) : isOpenSession ? (
            <p className="text-sky-600 dark:text-sky-300">
              The session will stay open and continue running from that start time.
            </p>
          ) : null}
        </div>

        {feedback ? (
          <p
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
              feedbackTone === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            {feedback}
          </p>
        ) : null}
      </div>
    </section>
  );
}

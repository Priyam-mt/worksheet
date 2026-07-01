import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useWorkTrackerStore } from '../store/useWorkTrackerStore';
import { formatMinutesAsClock, getSessionDurationMinutes } from '../utils/time';

interface ScheduleBlock {
  id: string;
  date: string;
  endTime: string;
  startTime: string;
  title: string;
}

const STORAGE_KEY = 'work-tracker-schedule-blocks';

function loadScheduleBlocks(): ScheduleBlock[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ScheduleBlock[]) : [];
  } catch {
    return [];
  }
}

function saveScheduleBlocks(blocks: ScheduleBlock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

export function CalendarScheduleCard() {
  const sessions = useWorkTrackerStore((state) => state.sessions);
  const targetMinutes = useWorkTrackerStore((state) => state.targetMinutes);
  const [weekStart, setWeekStart] = useState(() => dayjs().startOf('week').add(1, 'day'));
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(loadScheduleBlocks);
  const [title, setTitle] = useState('Focused work');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('18:00');
  const [feedback, setFeedback] = useState<string | null>(null);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => weekStart.add(index, 'day')),
    [weekStart],
  );

  const sessionTotalsByDate = useMemo(() => {
    const totals = new Map<string, number>();

    sessions.forEach((session) => {
      const key = dayjs(session.start).format('YYYY-MM-DD');
      totals.set(key, (totals.get(key) ?? 0) + getSessionDurationMinutes(session));
    });

    return totals;
  }, [sessions]);

  const blocksByDate = useMemo(() => {
    const grouped = new Map<string, ScheduleBlock[]>();

    blocks.forEach((block) => {
      const dayBlocks = grouped.get(block.date) ?? [];
      dayBlocks.push(block);
      grouped.set(
        block.date,
        dayBlocks.sort((left, right) => left.startTime.localeCompare(right.startTime)),
      );
    });

    return grouped;
  }, [blocks]);

  const updateBlocks = (nextBlocks: ScheduleBlock[]) => {
    setBlocks(nextBlocks);
    saveScheduleBlocks(nextBlocks);
  };

  const addBlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!dayjs(date).isValid() || endTime <= startTime) {
      setFeedback('Choose a valid date and an end time after the start time.');
      return;
    }

    updateBlocks([
      ...blocks,
      {
        date,
        endTime,
        id: crypto.randomUUID(),
        startTime,
        title: title.trim() || 'Scheduled work',
      },
    ]);
    setFeedback('Schedule block added.');
  };

  const deleteBlock = (id: string) => {
    updateBlocks(blocks.filter((block) => block.id !== id));
  };

  return (
    <section className="rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-xl font-semibold text-slate-950 dark:text-white">
              Scheduling Calendar
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Plan work blocks and compare them with tracked sessions.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWeekStart((current) => current.subtract(1, 'week'))}
              className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(dayjs().startOf('week').add(1, 'day'))}
              className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((current) => current.add(1, 'week'))}
              className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-7">
          {weekDays.map((day) => {
            const key = day.format('YYYY-MM-DD');
            const dayBlocks = blocksByDate.get(key) ?? [];
            const workedMinutes = sessionTotalsByDate.get(key) ?? 0;

            return (
              <article
                key={key}
                className="min-h-44 rounded-[22px] border border-slate-200/80 bg-white/90 p-3 dark:border-white/10 dark:bg-slate-900/90"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                      {day.format('ddd')}
                    </p>
                    <p className="font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-lg font-semibold text-slate-900 dark:text-white">
                      {day.format('D MMM')}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {formatMinutesAsClock(workedMinutes)}
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, (workedMinutes / targetMinutes) * 100)}%` }}
                  />
                </div>

                <div className="mt-3 space-y-2">
                  {dayBlocks.length > 0 ? (
                    dayBlocks.map((block) => (
                      <div
                        key={block.id}
                        className="rounded-2xl bg-sky-50 px-3 py-2 text-sm text-slate-700 dark:bg-sky-500/10 dark:text-slate-100"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{block.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-300">
                              {block.startTime} - {block.endTime}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteBlock(block.id)}
                            className="rounded-lg px-2 text-xs font-semibold text-slate-500 transition hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-slate-200 px-3 py-5 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
                      No blocks
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <form className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]" onSubmit={addBlock}>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-800 dark:text-white"
            aria-label="Schedule title"
          />
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-800 dark:text-white"
            aria-label="Schedule date"
          />
          <input
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-800 dark:text-white"
            aria-label="Schedule start time"
          />
          <input
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-800 dark:text-white"
            aria-label="Schedule end time"
          />
          <button
            type="submit"
            className="cursor-pointer rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Add
          </button>
        </form>

        {feedback ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {feedback}
          </p>
        ) : null}
      </div>
    </section>
  );
}

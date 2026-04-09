import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useWorkTrackerActions } from '../hooks/useWorkTrackerActions';
import { useWorkTrackerStore } from '../store/useWorkTrackerStore';
import { formatMinutesAsClock, getSessionDurationMinutes } from '../utils/time';

interface SessionRow {
  id: string;
  start: string;
  end: string;
  duration: string;
  isActive: boolean;
}

interface SessionTableProps {
  rows: SessionRow[];
}

interface EditState {
  id: string;
  startTime: string;
  endTime: string;
}

export function SessionTable({ rows }: SessionTableProps) {
  const [editState, setEditState] = useState<EditState | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'error' | 'success'>('success');
  const sessions = useWorkTrackerStore((state) => state.sessions);
  const trackingDate = useWorkTrackerStore((state) => state.trackingDate);
  const { updateSession } = useWorkTrackerActions();

  const sessionsById = useMemo(
    () => new Map(sessions.map((session) => [session.id, session])),
    [sessions],
  );

  const baseDate = trackingDate ?? dayjs().format('YYYY-MM-DD');

  const startEditing = (id: string) => {
    const session = sessionsById.get(id);

    if (!session) {
      return;
    }

    setEditState({
      id,
      startTime: dayjs(session.start).format('HH:mm'),
      endTime: session.end ? dayjs(session.end).format('HH:mm') : '',
    });
    setFeedback(null);
  };

  const cancelEditing = () => {
    setEditState(null);
    setFeedback(null);
  };

  const saveEditing = () => {
    if (!editState) {
      return;
    }

    const result = updateSession(
      editState.id,
      dayjs(`${baseDate}T${editState.startTime}`).toISOString(),
      editState.endTime ? dayjs(`${baseDate}T${editState.endTime}`).toISOString() : undefined,
    );

    if (!result.success) {
      setFeedbackTone('error');
      setFeedback(result.error ?? 'Could not update the session.');
      return;
    }

    setFeedbackTone('success');
    setFeedback('Session updated.');
    setEditState(null);
  };

  const getLiveDuration = (id: string, fallbackDuration: string) => {
    const session = sessionsById.get(id);

    if (!session) {
      return fallbackDuration;
    }

    return formatMinutesAsClock(getSessionDurationMinutes(session, dayjs()));
  };

  return (
    <section className="rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-xl font-semibold text-slate-950 dark:text-white">
            Session History
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Edit any saved in or out time to keep your day accurate.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
          {rows.length} session{rows.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mt-6 space-y-3 sm:hidden">
        {rows.length > 0 ? (
          rows.map((row) => {
            const isEditing = editState?.id === row.id;

            return (
              <article
                key={row.id}
                className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 dark:border-white/10 dark:bg-slate-900/90"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                      Duration
                    </p>
                    <p className="mt-1 font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-2xl font-semibold text-slate-900 dark:text-white">
                      {row.isActive ? getLiveDuration(row.id, row.duration) : row.duration}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      row.isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {row.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <label className="block space-y-2">
                      <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                        Start
                      </span>
                      <input
                        type="time"
                        value={editState.startTime}
                        onChange={(event) =>
                          setEditState((current) =>
                            current && current.id === row.id
                              ? { ...current, startTime: event.target.value }
                              : current,
                          )
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                        End
                      </span>
                      <input
                        type="time"
                        value={editState.endTime}
                        onChange={(event) =>
                          setEditState((current) =>
                            current && current.id === row.id
                              ? { ...current, endTime: event.target.value }
                              : current,
                          )
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveEditing}
                        className="cursor-pointer rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="cursor-pointer rounded-2xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-800/80">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                          Start
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                          {row.start}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-800/80">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                          End
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                          {row.end}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEditing(row.id)}
                      className="mt-4 cursor-pointer rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
                    >
                      Edit Session
                    </button>
                  </>
                )}
              </article>
            );
          })
        ) : (
          <div className="rounded-[22px] border border-dashed border-slate-300/80 px-4 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-300">
            No sessions yet. Start the day to begin tracking.
          </div>
        )}
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-[22px] border border-slate-200/80 dark:border-white/10 sm:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/80 text-left dark:divide-white/10">
            <thead className="bg-slate-50/90 dark:bg-slate-800/90">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                  Start
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                  End
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                  Duration
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 bg-white/90 dark:divide-white/10 dark:bg-slate-900/90">
              {rows.length > 0 ? (
                rows.map((row) => {
                  const isEditing = editState?.id === row.id;

                  return (
                    <tr key={row.id}>
                      <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                        {isEditing ? (
                          <input
                            type="time"
                            value={editState.startTime}
                            onChange={(event) =>
                              setEditState((current) =>
                                current && current.id === row.id
                                  ? { ...current, startTime: event.target.value }
                                  : current,
                              )
                            }
                            className="w-full min-w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                          />
                        ) : (
                          row.start
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                        {isEditing ? (
                          <input
                            type="time"
                            value={editState.endTime}
                            onChange={(event) =>
                              setEditState((current) =>
                                current && current.id === row.id
                                  ? { ...current, endTime: event.target.value }
                                  : current,
                              )
                            }
                            className="w-full min-w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-800 dark:text-white"
                          />
                        ) : (
                          row.end
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                        {row.isActive ? getLiveDuration(row.id, row.duration) : row.duration}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            row.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {row.isActive ? 'Active' : 'Closed'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={saveEditing}
                                className="cursor-pointer rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="cursor-pointer rounded-xl bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEditing(row.id)}
                              className="cursor-pointer rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-500"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-300"
                  >
                    No sessions yet. Start the day to begin tracking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editState ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">
          Leave the end time empty only if you want that session to stay active.
        </p>
      ) : null}

      {feedback ? (
        <p
          className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
            feedbackTone === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          {feedback}
        </p>
      ) : null}
    </section>
  );
}

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

export function SessionTable({ rows }: SessionTableProps) {
  return (
    <section className="rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-xl font-semibold text-slate-950 dark:text-white">
            Session History
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Every work block is stored locally for the current day.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
          {rows.length} session{rows.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mt-6 space-y-3 sm:hidden">
        {rows.length > 0 ? (
          rows.map((row) => (
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
                    {row.duration}
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
            </article>
          ))
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 bg-white/90 dark:divide-white/10 dark:bg-slate-900/90">
              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                      {row.start}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                      {row.end}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                      {row.duration}
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
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
    </section>
  );
}

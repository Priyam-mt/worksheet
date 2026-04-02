import { useWorkTrackerActions } from '../hooks/useWorkTrackerActions';
import { useWorkTrackerStore } from '../store/useWorkTrackerStore';

interface ActionButtonProps {
  disabled: boolean;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

function ActionButton({
  disabled,
  label,
  onClick,
  variant = 'secondary',
}: ActionButtonProps) {
  const classes = {
    danger:
      'bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-300 dark:disabled:bg-rose-900/60',
    primary:
      'bg-sky-600 text-white hover:bg-sky-500 disabled:bg-sky-300 dark:disabled:bg-sky-900/60',
    secondary:
      'bg-slate-900 text-white hover:bg-slate-700 disabled:bg-slate-300 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white dark:disabled:bg-slate-700 dark:disabled:text-slate-400',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed ${classes[variant]}`}
    >
      {label}
    </button>
  );
}

export function ActionButtons() {
  const { endDay, resumeWork, startDay, takeBreak } = useWorkTrackerActions();
  const sessions = useWorkTrackerStore((state) => state.sessions);
  const dayStatus = useWorkTrackerStore((state) => state.dayStatus);
  const hasActiveSession = sessions.some((session) => !session.end);
  const hasSessions = sessions.length > 0;

  return (
    <section className="rounded-[28px] border border-white/60 bg-white/75 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-xl font-semibold text-slate-950 dark:text-white">
            Actions
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Control the workday lifecycle without losing your session history.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ActionButton
            label="Start Day"
            onClick={startDay}
            disabled={hasActiveSession || (hasSessions && dayStatus !== 'ended' && dayStatus !== 'idle')}
            variant="primary"
          />
          <ActionButton
            label="Take Break"
            onClick={takeBreak}
            disabled={!hasActiveSession || dayStatus !== 'working'}
          />
          <ActionButton
            label="Resume"
            onClick={resumeWork}
            disabled={dayStatus !== 'break'}
          />
          <ActionButton
            label="End Day"
            onClick={endDay}
            disabled={!hasActiveSession}
            variant="danger"
          />
        </div>
      </div>
    </section>
  );
}

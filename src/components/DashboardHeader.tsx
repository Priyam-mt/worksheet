interface DashboardHeaderProps {
  currentDate: string;
  notificationPermission: NotificationPermission | 'unsupported';
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function getPermissionLabel(permission: DashboardHeaderProps['notificationPermission']): string {
  switch (permission) {
    case 'granted':
      return 'Notifications enabled';
    case 'denied':
      return 'Notifications blocked';
    case 'default':
      return 'Notifications pending';
    default:
      return 'Notifications unsupported';
  }
}

export function DashboardHeader({
  currentDate,
  notificationPermission,
  theme,
  onToggleTheme,
}: DashboardHeaderProps) {
  return (
    <header className="rounded-[28px] border border-white/60 bg-white/75 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-600 dark:text-sky-300">
            Work Time Tracker Dashboard
          </p>
          <div className="space-y-1">
            <h1 className="font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Work Tracker
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              {currentDate}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-full border border-slate-200/70 bg-slate-50/80 px-4 py-2 text-sm font-medium text-slate-600 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200">
            {getPermissionLabel(notificationPermission)}
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-sky-400 dark:hover:text-sky-200"
          >
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
      </div>
    </header>
  );
}

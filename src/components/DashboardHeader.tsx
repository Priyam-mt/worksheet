interface DashboardHeaderProps {
  currentDate: string;
  notificationPermission: NotificationPermission | 'unsupported';
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
}: DashboardHeaderProps) {
  return (
    <header className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">
            Work Time Tracker Dashboard
          </p>
          <div className="space-y-1">
            <h1 className="font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Work Tracker
            </h1>
            <p className="text-sm text-slate-300 sm:text-base">{currentDate}</p>
          </div>
        </div>

        <div className="inline-flex max-w-full items-center rounded-full border border-white/10 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-200 sm:text-sm">
          {getPermissionLabel(notificationPermission)}
        </div>
      </div>
    </header>
  );
}

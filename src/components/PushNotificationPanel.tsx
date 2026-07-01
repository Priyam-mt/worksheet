import { usePushNotifications } from '../hooks/usePushNotifications';

function getStatusText(status: ReturnType<typeof usePushNotifications>['status']) {
  switch (status) {
    case 'subscribed':
      return 'Push subscribed';
    case 'missing-vapid-key':
      return 'VAPID key needed';
    case 'blocked':
      return 'Notifications blocked';
    case 'unsupported':
      return 'Push unsupported';
    case 'error':
      return 'Push error';
    case 'permission-needed':
      return 'Permission needed';
    default:
      return 'Ready to enable';
  }
}

export function PushNotificationPanel() {
  const {
    error,
    isBusy,
    sendTestNotification,
    status,
    subscribe,
    subscription,
    unsubscribe,
  } = usePushNotifications();
  const endpointHost = subscription?.endpoint ? new URL(subscription.endpoint).host : null;
  const isSubscribed = status === 'subscribed';

  return (
    <section className="rounded-[28px] border border-white/60 bg-white/75 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-['Space_Grotesk',_'Segoe_UI',_sans-serif] text-xl font-semibold text-slate-950 dark:text-white">
              Notifications
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Browser push subscription for workday reminders.
            </p>
          </div>
          <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200">
            {getStatusText(status)}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={subscribe}
            disabled={isBusy || isSubscribed || status === 'unsupported'}
            className="cursor-pointer rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
          >
            Enable Push
          </button>
          <button
            type="button"
            onClick={sendTestNotification}
            disabled={isBusy || !isSubscribed}
            className="cursor-pointer rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
          >
            Send Test
          </button>
          <button
            type="button"
            onClick={unsubscribe}
            disabled={isBusy || !isSubscribed}
            className="cursor-pointer rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
          >
            Unsubscribe
          </button>
        </div>

        {endpointHost ? (
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Endpoint: <span className="font-semibold text-slate-700 dark:text-slate-100">{endpointHost}</span>
          </p>
        ) : null}

        {error ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

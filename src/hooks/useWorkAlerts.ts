import { useEffect, useEffectEvent } from 'react';
import { useWorkTrackerActions } from './useWorkTrackerActions';
import { useWorkTrackerMetrics } from './useWorkTrackerMetrics';
import { useWorkTrackerStore } from '../store/useWorkTrackerStore';
import { ALERT_THRESHOLDS } from '../utils/time';

export function useWorkAlerts() {
  const { markAlertTriggered } = useWorkTrackerActions();
  const { remainingMinutes, activeSession } = useWorkTrackerMetrics();
  const alertFlags = useWorkTrackerStore((state) => state.alertFlags);

  const checkAlerts = useEffectEvent(() => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      Notification.permission !== 'granted' ||
      !activeSession
    ) {
      return;
    }

    ALERT_THRESHOLDS.forEach((threshold) => {
      const alreadyTriggered = alertFlags[threshold];
      const shouldTrigger =
        !alreadyTriggered &&
        remainingMinutes <= threshold &&
        remainingMinutes > 0;

      if (!shouldTrigger) {
        return;
      }

      new Notification(`Only ${threshold} minute${threshold === 1 ? '' : 's'} left in your workday.`);
      markAlertTriggered(threshold);
    });
  });

  useEffect(() => {
    checkAlerts();

    const timer = window.setInterval(() => {
      checkAlerts();
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);
}

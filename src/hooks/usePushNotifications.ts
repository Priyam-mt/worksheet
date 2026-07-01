import { useCallback, useEffect, useState } from 'react';

type PushStatus =
  | 'unsupported'
  | 'idle'
  | 'permission-needed'
  | 'missing-vapid-key'
  | 'subscribed'
  | 'blocked'
  | 'error';

interface PushNotificationState {
  error: string | null;
  isBusy: boolean;
  permission: NotificationPermission | 'unsupported';
  status: PushStatus;
  subscription: PushSubscriptionJSON | null;
}

const SUBSCRIPTION_STORAGE_KEY = 'work-tracker-push-subscription';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function getInitialPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  return Notification.permission;
}

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray.buffer;
}

function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    error: null,
    isBusy: false,
    permission: getInitialPermission(),
    status: isPushSupported() ? 'idle' : 'unsupported',
    subscription: null,
  });

  const refreshSubscription = useCallback(async () => {
    if (!isPushSupported()) {
      setState((current) => ({ ...current, status: 'unsupported' }));
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    const permission = Notification.permission;

    if (subscription) {
      const serialized = subscription.toJSON();
      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(serialized));
      setState((current) => ({
        ...current,
        error: null,
        permission,
        status: 'subscribed',
        subscription: serialized,
      }));
      return;
    }

    localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
    setState((current) => ({
      ...current,
      permission,
      status: permission === 'denied' ? 'blocked' : 'permission-needed',
      subscription: null,
    }));
  }, []);

  useEffect(() => {
    void refreshSubscription().catch((error: unknown) => {
      setState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'Unable to read push subscription.',
        status: 'error',
      }));
    });
  }, [refreshSubscription]);

  const subscribe = useCallback(async () => {
    if (!isPushSupported()) {
      setState((current) => ({ ...current, status: 'unsupported' }));
      return;
    }

    setState((current) => ({ ...current, error: null, isBusy: true }));

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'denied') {
        setState((current) => ({
          ...current,
          isBusy: false,
          permission,
          status: 'blocked',
        }));
        return;
      }

      if (!VAPID_PUBLIC_KEY) {
        setState((current) => ({
          ...current,
          error: 'Set VITE_VAPID_PUBLIC_KEY to create a real browser push subscription.',
          isBusy: false,
          permission,
          status: 'missing-vapid-key',
        }));
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      const subscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          applicationServerKey: urlBase64ToArrayBuffer(VAPID_PUBLIC_KEY),
          userVisibleOnly: true,
        }));
      const serialized = subscription.toJSON();

      localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(serialized));
      setState({
        error: null,
        isBusy: false,
        permission,
        status: 'subscribed',
        subscription: serialized,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'Unable to subscribe to push notifications.',
        isBusy: false,
        status: 'error',
      }));
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!isPushSupported()) {
      return;
    }

    setState((current) => ({ ...current, error: null, isBusy: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      await subscription?.unsubscribe();
      localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);

      setState((current) => ({
        ...current,
        isBusy: false,
        permission: Notification.permission,
        status: Notification.permission === 'denied' ? 'blocked' : 'permission-needed',
        subscription: null,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'Unable to unsubscribe from push notifications.',
        isBusy: false,
        status: 'error',
      }));
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    if (!isPushSupported() || Notification.permission !== 'granted') {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('Work tracker reminder', {
      badge: '/favicon.svg',
      body: 'Push notifications are connected for workday alerts.',
      icon: '/pwa-icon.svg',
      tag: 'work-tracker-test',
    });
  }, []);

  return {
    ...state,
    sendTestNotification,
    subscribe,
    unsubscribe,
  };
}

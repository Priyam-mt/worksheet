import { useEffect, useState } from 'react';

export function useNotificationPermission(): NotificationPermission | 'unsupported' {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }

    return Notification.permission;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission !== 'default') {
      return;
    }

    void Notification.requestPermission().then(setPermission);
  }, []);

  return permission;
}

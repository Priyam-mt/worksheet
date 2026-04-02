import { useEffect, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';

export function useCurrentTime(intervalMs = 1000): Dayjs {
  const [now, setNow] = useState(() => dayjs());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(dayjs());
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs]);

  return now;
}

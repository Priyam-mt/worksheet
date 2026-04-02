import { useMemo } from 'react';
import { useCurrentTime } from './useCurrentTime';
import { useWorkTrackerStore } from '../store/useWorkTrackerStore';
import {
  calculateWorkedMinutes,
  formatDate,
  formatDateTime,
  formatMinutesAsClock,
  getExpectedLeaveTime,
  getRemainingMinutes,
  getSessionDurationMinutes,
  getSessionDurationSeconds,
} from '../utils/time';

export function useWorkTrackerMetrics() {
  const now = useCurrentTime();
  const sessions = useWorkTrackerStore((state) => state.sessions);
  const targetMinutes = useWorkTrackerStore((state) => state.targetMinutes);
  const dayStatus = useWorkTrackerStore((state) => state.dayStatus);

  return useMemo(() => {
    const totalWorkedFloat = calculateWorkedMinutes(sessions, now);
    const totalWorkedMinutes = Math.max(0, Math.floor(totalWorkedFloat));
    const remainingMinutes = getRemainingMinutes(totalWorkedFloat, targetMinutes);
    const expectedLeaveTime = getExpectedLeaveTime(remainingMinutes, now);
    const activeSession = sessions.findLast((session) => !session.end);
    const liveSessionSeconds = activeSession
      ? getSessionDurationSeconds(activeSession, now)
      : 0;
    const isOvertime = remainingMinutes < 0;
    const overtimeMinutes = isOvertime ? Math.abs(remainingMinutes) : 0;

    const sessionRows = sessions.map((session) => {
      const durationMinutes = getSessionDurationMinutes(session, now);

      return {
        id: session.id,
        duration: formatMinutesAsClock(durationMinutes),
        end: formatDateTime(session.end),
        isActive: !session.end,
        start: formatDateTime(session.start),
      };
    });

    return {
      activeSession,
      currentDateLabel: formatDate(now),
      dayStatus,
      expectedLeaveTime: expectedLeaveTime.toDate(),
      isOvertime,
      liveSessionSeconds,
      overtimeMinutes,
      remainingMinutes,
      sessionRows,
      totalWorkedMinutes,
    };
  }, [dayStatus, now, sessions, targetMinutes]);
}

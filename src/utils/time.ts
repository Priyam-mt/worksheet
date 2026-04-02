import dayjs, { type ConfigType, type Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import type { Session } from '../types/work-session';

dayjs.extend(duration);
dayjs.extend(localizedFormat);

export const TARGET_MINUTES = 8 * 60 + 15;
export const ALERT_THRESHOLDS = [30, 15, 5, 1] as const;

export function calculateWorkedMinutes(
  sessions: Session[],
  referenceTime: Dayjs = dayjs(),
): number {
  return sessions.reduce((total, session) => {
    const start = dayjs(session.start);
    const end = session.end ? dayjs(session.end) : referenceTime;

    if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
      return total;
    }

    return total + end.diff(start, 'minute', true);
  }, 0);
}

export function getRemainingMinutes(worked: number, target: number): number {
  return Math.ceil(target - worked);
}

export function getExpectedLeaveTime(
  remaining: number,
  referenceTime: Dayjs = dayjs(),
): Dayjs {
  return remaining <= 0 ? referenceTime : referenceTime.add(remaining, 'minute');
}

export function formatTime(value: ConfigType): string {
  const date = dayjs(value);
  return date.isValid() ? date.format('hh:mm A') : '--';
}

export function formatDate(value: ConfigType): string {
  const date = dayjs(value);
  return date.isValid() ? date.format('dddd, DD MMMM YYYY') : '--';
}

export function formatDateTime(value?: ConfigType): string {
  if (!value) {
    return '--';
  }

  const date = dayjs(value);
  return date.isValid() ? date.format('DD MMM YYYY, hh:mm:ss A') : '--';
}

export function formatMinutesAsClock(totalMinutes: number): string {
  const safeMinutes = Math.max(0, totalMinutes);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function formatDurationHms(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

export function getSessionDurationMinutes(
  session: Session,
  referenceTime: Dayjs = dayjs(),
): number {
  const start = dayjs(session.start);
  const end = session.end ? dayjs(session.end) : referenceTime;

  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return 0;
  }

  return Math.ceil(end.diff(start, 'minute', true));
}

export function getSessionDurationSeconds(
  session: Session,
  referenceTime: Dayjs = dayjs(),
): number {
  const start = dayjs(session.start);
  const end = session.end ? dayjs(session.end) : referenceTime;

  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return 0;
  }

  return Math.floor(end.diff(start, 'second', true));
}

export function getTodayKey(referenceTime: Dayjs = dayjs()): string {
  return referenceTime.format('YYYY-MM-DD');
}

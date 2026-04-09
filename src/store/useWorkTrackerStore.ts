import dayjs from 'dayjs';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DayStatus, Session } from '../types/work-session';
import { TARGET_MINUTES, getTodayKey } from '../utils/time';

interface WorkTrackerState {
  sessions: Session[];
  targetMinutes: number;
  alertFlags: Record<number, boolean>;
  dayStatus: DayStatus;
  trackingDate: string | null;
  startDay: () => void;
  takeBreak: () => void;
  resumeWork: () => void;
  endDay: () => void;
  addManualSession: (start: string, end?: string) => { success: boolean; error?: string };
  completeActiveSession: (end: string) => { success: boolean; error?: string };
  updateSession: (id: string, start: string, end?: string) => { success: boolean; error?: string };
  markAlertTriggered: (minutes: number) => void;
  resetAlertFlags: () => void;
  syncDayBoundary: () => void;
}

const createSession = (): Session => ({
  id: crypto.randomUUID(),
  start: dayjs().toISOString(),
});

const closeActiveSession = (sessions: Session[]): Session[] => {
  const activeIndex = sessions.findLastIndex((session) => !session.end);

  if (activeIndex === -1) {
    return sessions;
  }

  const updatedSessions = [...sessions];
  updatedSessions[activeIndex] = {
    ...updatedSessions[activeIndex],
    end: dayjs().toISOString(),
  };

  return updatedSessions;
};

const initialAlertFlags = (): Record<number, boolean> => ({});

const sortSessionsByStart = (sessions: Session[]): Session[] =>
  [...sessions].sort((left, right) => dayjs(left.start).valueOf() - dayjs(right.start).valueOf());

const getDayStatusForSessions = (
  previousDayStatus: DayStatus,
  sessions: Session[],
): DayStatus => {
  if (sessions.some((session) => !session.end)) {
    return 'working';
  }

  if (sessions.length === 0) {
    return previousDayStatus === 'ended' ? 'ended' : 'idle';
  }

  return previousDayStatus === 'ended' ? 'ended' : 'break';
};

const ensureCurrentDayState = (
  state: Pick<WorkTrackerState, 'trackingDate'>,
): Pick<WorkTrackerState, 'sessions' | 'alertFlags' | 'dayStatus' | 'trackingDate'> => {
  const todayKey = getTodayKey();

  if (state.trackingDate && state.trackingDate === todayKey) {
    return {
      sessions: [],
      alertFlags: initialAlertFlags(),
      dayStatus: 'idle',
      trackingDate: state.trackingDate,
    };
  }

  return {
    sessions: [],
    alertFlags: initialAlertFlags(),
    dayStatus: 'idle',
    trackingDate: todayKey,
  };
};

export const useWorkTrackerStore = create<WorkTrackerState>()(
  persist(
    (set, get) => ({
      sessions: [],
      targetMinutes: TARGET_MINUTES,
      alertFlags: initialAlertFlags(),
      dayStatus: 'idle',
      trackingDate: null,
      startDay: () => {
        const todayKey = getTodayKey();
        const { trackingDate, dayStatus } = get();
        const shouldReset = !trackingDate || trackingDate !== todayKey || dayStatus === 'ended';

        set((state) => ({
          sessions: shouldReset ? [createSession()] : state.sessions,
          alertFlags: shouldReset ? initialAlertFlags() : state.alertFlags,
          dayStatus: shouldReset ? 'working' : state.dayStatus,
          trackingDate: todayKey,
        }));

        if (!shouldReset && get().sessions.length === 0) {
          set({
            sessions: [createSession()],
            alertFlags: initialAlertFlags(),
            dayStatus: 'working',
            trackingDate: todayKey,
          });
        }
      },
      takeBreak: () => {
        set((state) => {
          const nextSessions = closeActiveSession(state.sessions);
          const hadActiveSession = state.sessions.some((session) => !session.end);

          return {
            sessions: nextSessions,
            dayStatus: hadActiveSession ? 'break' : state.dayStatus,
          };
        });
      },
      resumeWork: () => {
        const todayKey = getTodayKey();
        set((state) => {
          if (state.dayStatus !== 'break') {
            return state;
          }

          return {
            sessions: [...state.sessions, createSession()],
            dayStatus: 'working',
            trackingDate: todayKey,
          };
        });
      },
      endDay: () => {
        set((state) => ({
          sessions: closeActiveSession(state.sessions),
          dayStatus: 'ended',
        }));
      },
      addManualSession: (start, end) => {
        const startTime = dayjs(start);

        if (!startTime.isValid()) {
          return { success: false, error: 'Please enter a valid start time.' };
        }

        const endTime = end ? dayjs(end) : null;

        if (endTime && !endTime.isValid()) {
          return { success: false, error: 'Please enter a valid end time.' };
        }

        if (endTime && !endTime.isAfter(startTime)) {
          return { success: false, error: 'End time must be after start time.' };
        }

        const { sessions, trackingDate, dayStatus } = get();

        if (!endTime && sessions.some((session) => !session.end)) {
          return {
            success: false,
            error: 'Pause or end the current active session before creating another active entry.',
          };
        }

        const comparisonEnd = endTime ?? dayjs();

        const overlapsExisting = sessions.some((session) => {
          const sessionStart = dayjs(session.start);
          const sessionEnd = session.end ? dayjs(session.end) : dayjs();

          return startTime.isBefore(sessionEnd) && comparisonEnd.isAfter(sessionStart);
        });

        if (overlapsExisting) {
          return {
            success: false,
            error: 'This manual entry overlaps an existing session.',
          };
        }

        const todayKey = getTodayKey();
        const nextSessions = sortSessionsByStart([
          ...sessions,
          {
            id: crypto.randomUUID(),
            start: startTime.toISOString(),
            end: endTime?.toISOString(),
          },
        ]);

        set({
          sessions: nextSessions,
          dayStatus: endTime ? (dayStatus === 'ended' ? 'ended' : 'break') : 'working',
          trackingDate: trackingDate ?? todayKey,
        });

        return { success: true };
      },
      completeActiveSession: (end) => {
        const endTime = dayjs(end);

        if (!endTime.isValid()) {
          return { success: false, error: 'Please enter a valid end time.' };
        }

        const { sessions, dayStatus, trackingDate } = get();
        const activeIndex = sessions.findLastIndex((session) => !session.end);

        if (activeIndex === -1) {
          return { success: false, error: 'There is no active session to close.' };
        }

        const activeSession = sessions[activeIndex];
        const activeStart = dayjs(activeSession.start);

        if (!endTime.isAfter(activeStart)) {
          return { success: false, error: 'End time must be after the active start time.' };
        }

        const overlapsFollowingSession = sessions.some((session, index) => {
          if (index === activeIndex) {
            return false;
          }

          const sessionStart = dayjs(session.start);
          const sessionEnd = session.end ? dayjs(session.end) : dayjs();

          return activeStart.isBefore(sessionEnd) && endTime.isAfter(sessionStart);
        });

        if (overlapsFollowingSession) {
          return {
            success: false,
            error: 'This end time overlaps another session. Please choose an earlier out time.',
          };
        }

        const nextSessions = [...sessions];
        nextSessions[activeIndex] = {
          ...activeSession,
          end: endTime.toISOString(),
        };

        set({
          sessions: sortSessionsByStart(nextSessions),
          dayStatus: dayStatus === 'ended' ? 'ended' : 'break',
          trackingDate: trackingDate ?? getTodayKey(),
        });

        return { success: true };
      },
      updateSession: (id, start, end) => {
        const startTime = dayjs(start);

        if (!startTime.isValid()) {
          return { success: false, error: 'Please enter a valid start time.' };
        }

        const endTime = end ? dayjs(end) : null;

        if (endTime && !endTime.isValid()) {
          return { success: false, error: 'Please enter a valid end time.' };
        }

        if (endTime && !endTime.isAfter(startTime)) {
          return { success: false, error: 'End time must be after start time.' };
        }

        const { sessions, dayStatus, trackingDate } = get();
        const sessionIndex = sessions.findIndex((session) => session.id === id);

        if (sessionIndex === -1) {
          return { success: false, error: 'Session not found.' };
        }

        if (!endTime && sessions.some((session) => session.id !== id && !session.end)) {
          return {
            success: false,
            error: 'Only one active session can stay open at a time.',
          };
        }

        const comparisonEnd = endTime ?? dayjs();

        const overlapsExisting = sessions.some((session) => {
          if (session.id === id) {
            return false;
          }

          const sessionStart = dayjs(session.start);
          const sessionEnd = session.end ? dayjs(session.end) : dayjs();

          return startTime.isBefore(sessionEnd) && comparisonEnd.isAfter(sessionStart);
        });

        if (overlapsExisting) {
          return {
            success: false,
            error: 'This change overlaps another session. Please adjust the times.',
          };
        }

        const nextSessions = [...sessions];
        nextSessions[sessionIndex] = {
          ...nextSessions[sessionIndex],
          start: startTime.toISOString(),
          end: endTime?.toISOString(),
        };

        const sortedSessions = sortSessionsByStart(nextSessions);

        set({
          sessions: sortedSessions,
          dayStatus: getDayStatusForSessions(dayStatus, sortedSessions),
          trackingDate: trackingDate ?? getTodayKey(),
        });`  `

        return { success: true };
      },
      markAlertTriggered: (minutes) => {
        set((state) => ({
          alertFlags: {
            ...state.alertFlags,
            [minutes]: true,
          },
        }));
      },
      resetAlertFlags: () => {
        set({ alertFlags: initialAlertFlags() });
      },
      syncDayBoundary: () => {
        const todayKey = getTodayKey();
        const { trackingDate } = get();

        if (!trackingDate) {
          set({ trackingDate: todayKey });
          return;
        }

        if (trackingDate !== todayKey) {
          set(ensureCurrentDayState({ trackingDate }));
        }
      },
    }),
    {
      name: 'work-tracker-dashboard',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        targetMinutes: state.targetMinutes,
        alertFlags: state.alertFlags,
        dayStatus: state.dayStatus,
        trackingDate: state.trackingDate,
      }),
    },
  ),
);

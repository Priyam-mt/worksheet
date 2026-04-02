import dayjs from 'dayjs';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DayStatus, Session, ThemeMode } from '../types/work-session';
import { TARGET_MINUTES, getTodayKey } from '../utils/time';

interface WorkTrackerState {
  sessions: Session[];
  targetMinutes: number;
  alertFlags: Record<number, boolean>;
  dayStatus: DayStatus;
  theme: ThemeMode;
  trackingDate: string | null;
  startDay: () => void;
  takeBreak: () => void;
  resumeWork: () => void;
  endDay: () => void;
  markAlertTriggered: (minutes: number) => void;
  resetAlertFlags: () => void;
  syncDayBoundary: () => void;
  toggleTheme: () => void;
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
      theme: 'light',
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
        set((state) => ({
          sessions: closeActiveSession(state.sessions),
          dayStatus: state.sessions.some((session) => !session.end) ? 'break' : state.dayStatus,
        }));
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
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }));
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
        theme: state.theme,
        trackingDate: state.trackingDate,
      }),
    },
  ),
);

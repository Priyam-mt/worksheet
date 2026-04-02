export interface Session {
  id: string;
  start: string;
  end?: string;
}

export type DayStatus = 'idle' | 'working' | 'break' | 'ended';

export type ThemeMode = 'light' | 'dark';

import { useEffect } from 'react';
import { useWorkTrackerActions } from './useWorkTrackerActions';
import { useWorkTrackerStore } from '../store/useWorkTrackerStore';

export function useDarkMode() {
  const theme = useWorkTrackerStore((state) => state.theme);
  const { toggleTheme } = useWorkTrackerActions();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return { theme, toggleTheme };
}

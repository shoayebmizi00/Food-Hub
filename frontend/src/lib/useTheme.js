// Theme hook placeholder.
import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('foodhub-theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('foodhub-theme', theme);
  }, [theme]);

  const toggleTheme = () => setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  const setTheme = (t) => setThemeState(t);

  return { theme, toggleTheme, setTheme };
}
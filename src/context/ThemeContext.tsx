'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cvnet-theme');
    if (saved === 'dark') setIsDark(true);
  }, []);

  useEffect(() => {
    // Apply background color to :root / body to prevent flash or white overscroll
    if (isDark) {
      document.documentElement.style.backgroundColor = '#020617'; // slate-950
      document.body.style.backgroundColor = '#020617';
    } else {
      document.documentElement.style.backgroundColor = '#f8fafc'; // slate-50
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('cvnet-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyDomTheme(theme: Theme) {
  const root = document.documentElement;
  const body = document.body;

  if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    body?.classList.add('light');
    body?.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    body?.classList.add('dark');
    body?.classList.remove('light');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const saved = localStorage.getItem('netra_theme');
    if (saved === 'dark' || saved === 'light') {
      setThemeState(saved);
      applyDomTheme(saved);
    } else {
      applyDomTheme('light');
    }
  }, []);

  useEffect(() => {
    applyDomTheme(theme);
  }, [theme]);

  const persist = (next: Theme) => {
    localStorage.setItem('netra_theme', next);
    setThemeState(next);
  };

  const toggleTheme = () => {
    persist(theme === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    persist(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}

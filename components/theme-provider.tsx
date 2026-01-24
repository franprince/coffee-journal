'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'neon' | 'nordic' | 'midnight' | 'matcha' | 'cortado';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('neon');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('coffee-journal-theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Default
      document.documentElement.setAttribute('data-theme', 'neon');
    }
    setIsMounted(true);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('coffee-journal-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {!isMounted ? (
        <div style={{ visibility: 'hidden' }}>{children}</div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

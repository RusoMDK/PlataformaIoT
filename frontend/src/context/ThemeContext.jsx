// src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'system', setTheme: () => {}, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('system');

  // aplica la clase .dark al <html>
  const applyTheme = (value) => {
    const isSystemDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
    const enableDark = value === 'dark' || (value === 'system' && isSystemDark);
    document.documentElement.classList.toggle('dark', !!enableDark);
  };

  // inicializa desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'system';
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  // reacciona a cambios del sistema si estás en “system”
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq?.addEventListener?.('change', handler);
    return () => mq?.removeEventListener?.('change', handler);
  }, [theme]);

  const setTheme = (value) => {
    setThemeState(value);
    localStorage.setItem('theme', value);
    applyTheme(value);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

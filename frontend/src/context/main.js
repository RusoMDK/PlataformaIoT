// src/context/main.js

import { ThemeProvider } from './ThemeContext';
import { NotificacionesProvider } from './NotificacionesContext';
import { AuthProvider } from './AuthContext';

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <NotificacionesProvider>
        <AuthProvider>{children}</AuthProvider>
      </NotificacionesProvider>
    </ThemeProvider>
  );
}

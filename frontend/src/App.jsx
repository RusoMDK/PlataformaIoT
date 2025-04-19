import './i18n';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificacionesProvider } from './context/NotificacionesContext';
import { ToastProvider } from './components/ui/Toast';
import AppLayout from './layouts/AppLayout'; // ✅ correcto

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <NotificacionesProvider>
          <ToastProvider>
            <AppLayout />
          </ToastProvider>
        </NotificacionesProvider>
      </ThemeProvider>
    </Router>
  );
}

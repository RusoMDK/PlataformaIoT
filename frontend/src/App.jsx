import './i18n';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificacionesProvider } from './context/NotificacionesContext';
import { ToastProvider } from './components/ui/Toast';
import AppLayout from './layouts/AppLayout';
import DeviceConfigLayout from './layouts/DeviceConfigLayout';

function AppRouterWrapper() {
  const location = useLocation();
  const isDeviceConfig = location.pathname.startsWith('/configurar-dispositivo');

  return isDeviceConfig ? <DeviceConfigLayout /> : <AppLayout />;
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <NotificacionesProvider>
          <ToastProvider>
            <AppRouterWrapper />
          </ToastProvider>
        </NotificacionesProvider>
      </ThemeProvider>
    </Router>
  );
}

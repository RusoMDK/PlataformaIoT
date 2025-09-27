import './i18n';
import './styles/index.css';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificacionesProvider } from './context/NotificacionesContext';
import ToastProvider from './components/ui/Toast';
import router from './routes/router';

// 🔥 Hook actualizado
import useSyncTokenWithAgent from './hooks/useSyncTokenWithAgent';

export default function App() {
  useSyncTokenWithAgent(); // 👈 se invoca dentro del componente raíz

  return (
    <ThemeProvider>
      <NotificacionesProvider>
        <ToastProvider />
        <RouterProvider router={router} />
      </NotificacionesProvider>
    </ThemeProvider>
  );
}

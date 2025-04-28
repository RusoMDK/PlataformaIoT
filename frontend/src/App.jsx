// src/App.jsx
import './i18n';
import './styles/index.css';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificacionesProvider } from './context/NotificacionesContext';
import ToastProvider from './components/ui/Toast'; // default export
import router from './routes/router';

export default function App() {
  return (
    <ThemeProvider>
      <NotificacionesProvider>
        <ToastProvider />
        <RouterProvider router={router} />
      </NotificacionesProvider>
    </ThemeProvider>
  );
}

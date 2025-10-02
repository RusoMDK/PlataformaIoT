// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

import { ThemeProvider } from './context/ThemeContext';
import { ConfirmDialogProvider } from './providers/ConfirmDialogProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfirmDialogProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ConfirmDialogProvider>
  </React.StrictMode>
);

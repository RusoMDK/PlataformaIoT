// src/components/ui/Toast.jsx
import React from 'react';
import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      richColors
      position="top-right" // sigue en la esquina derecha
      gutter={8} // espacio vertical entre toasts
      containerStyle={{
        top: 64, // 64px para quedar bajo tu navbar
        right: 16, // margen derecho
      }}
      toastOptions={{
        // opcional: limita ancho y estilos base
        className: 'max-w-xs',
      }}
    />
  );
}

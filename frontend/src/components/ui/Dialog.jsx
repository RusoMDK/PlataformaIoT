// src/components/ui/Dialog.jsx
import { useEffect, useState } from 'react';

export function Dialog({ open, onClose, children }) {
  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 animate-fade-in-down"
      >
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className = '' }) {
  return <div className={`p-4 space-y-4 ${className}`}>{children}</div>;
}

// 🔥 Ahora sí añadimos el DialogTrigger (el botoncito para abrir modales)
export function DialogTrigger({ children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

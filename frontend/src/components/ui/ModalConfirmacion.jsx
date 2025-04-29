// src/components/ui/ModalConfirmacion.jsx
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export default function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-md w-full animate-fadeInScale">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-6">{description}</p>

        {/* Footer */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

// src/components/ui/FullscreenModal.jsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export default function FullscreenModal({ open, onClose, children, title = 'Vista expandida' }) {
  // Si no está abierto, no renderizamos nada
  if (!open) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Overlay con fondo oscuro y blur */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity" />

        {/* Contenido principal del modal */}
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in-90 slide-in-from-top-8">
          <div className="relative w-full max-w-6xl h-[90vh] bg-light-surface dark:bg-dark-surface text-light-text dark:text-white rounded-2xl shadow-2xl border border-light-border dark:border-dark-border flex flex-col overflow-hidden transition-colors">
            {/* Encabezado */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg">
              <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
              <Dialog.Close
                aria-label="Cerrar"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            {/* Contenido interno */}
            <div className="flex-1 p-6 overflow-auto bg-light-bg dark:bg-dark-bg">{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

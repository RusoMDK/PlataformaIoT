// src/components/ui/FullscreenModal.jsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export default function FullscreenModal({ open, onClose, children, title = 'Vista expandida' }) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Fondo oscurecido con blur y transición */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity data-[state=open]:opacity-100 data-[state=closed]:opacity-0" />

        {/* Contenedor del modal con animación */}
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4
          data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-top-8
          data-[state=closed]:animate-out data-[state=closed]:fade-out-90 data-[state=closed]:slide-out-to-top-8"
        >
          <div className="relative w-full max-w-6xl h-[90vh] bg-white dark:bg-dark-bg text-light-text dark:text-dark-text rounded-2xl shadow-2xl border border-light-border dark:border-dark-border flex flex-col overflow-hidden transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
              <Dialog.Title className="text-lg font-semibold text-light-text dark:text-white">
                {title}
              </Dialog.Title>
              <Dialog.Close
                aria-label="Cerrar"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            {/* Contenido */}
            <div className="flex-1 p-6 overflow-auto bg-light-bg dark:bg-dark-bg">{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

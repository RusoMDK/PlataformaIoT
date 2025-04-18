// components/ui/FullscreenModal.jsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export default function FullscreenModal({ open, onClose, children, title = 'Vista expandida' }) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Fondo con animación de opacidad */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        
        {/* Modal centrado con animación suave de entrada */}
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4 
          data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-top-8
          data-[state=closed]:animate-out data-[state=closed]:fade-out-90 data-[state=closed]:slide-out-to-top-8"
        >
          <div className="relative w-full max-w-6xl h-[90vh] bg-white dark:bg-darkSurface rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Dialog.Title className="text-lg font-semibold text-gray-800 dark:text-white">
                {title}
              </Dialog.Title>
              <Dialog.Close
                aria-label="Cerrar"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            {/* Contenido scrollable */}
            <div className="flex-1 p-4 overflow-auto">{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
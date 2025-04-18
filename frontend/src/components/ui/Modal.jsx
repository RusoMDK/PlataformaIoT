// src/components/ui/Modal.jsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Modal({ open, onOpenChange, title, children, className }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-all animate-in fade-in" />
        <Dialog.Content
          className={cn(
            'fixed z-50 top-1/2 left-1/2 max-w-lg w-[90%] sm:w-full sm:max-w-xl -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-gray-200 bg-white p-6 shadow-xl focus:outline-none',
            'dark:border-gray-700 dark:bg-darkSurface dark:text-white',
            'animate-in fade-in zoom-in-95',
            className
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </Dialog.Title>
            <Dialog.Close className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>
          <div className="space-y-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

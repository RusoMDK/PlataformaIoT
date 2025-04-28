import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

function Modal({ open, onOpenChange, title, children, className }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md transition-all animate-in fade-in" />
        <Dialog.Content
          className={cn(
            'fixed z-50 top-1/2 left-1/2 w-[90%] sm:max-w-lg -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-light-border dark:border-dark-border',
            'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text',
            'p-6 shadow-2xl focus:outline-none animate-in fade-in zoom-in-95',
            className
          )}
        >
          <div className="flex items-center justify-between mb-6">
            {title && (
              <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </Dialog.Title>
            )}
            <Dialog.Close className="text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary-dark transition">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>
          <div className="space-y-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Modal; // <-- export default como antes

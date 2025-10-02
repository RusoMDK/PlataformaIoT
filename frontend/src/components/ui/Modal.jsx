import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const SIZE_MAP = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-2xl',
  full: 'sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl',
};

function Modal({
  open,
  onOpenChange,
  title,
  children,
  className,
  contentClassName,
  size = 'lg',
  footer = null,
  preventOutsideClose = false,
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* overlay con z alto (por encima de Sonner) */}
        <Dialog.Overlay
          className="fixed inset-0 z-[12000] bg-black/45 backdrop-blur-md animate-in fade-in"
        />
        <Dialog.Content
          onEscapeKeyDown={(e) => {
            if (preventOutsideClose) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (preventOutsideClose) e.preventDefault();
          }}
          className={cn(
            // posicionamiento
            'fixed z-[12001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            // ancho
            'w-[92%]',
            SIZE_MAP[size] || SIZE_MAP.lg,
            // skin
            'rounded-2xl border border-light-border dark:border-dark-border',
            'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text',
            'shadow-2xl focus:outline-none animate-in fade-in zoom-in-95',
            className
          )}
        >
          {/* header */}
          <div className={cn(
            'flex items-center justify-between px-6 py-4',
            'border-b border-light-border dark:border-dark-border'
          )}>
            {title && (
              <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </Dialog.Title>
            )}
            <Dialog.Close
              className="text-light-muted dark:text-dark-muted hover:text-primary dark:hover:text-primary-dark transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* body scrollable */}
          <div className={cn('px-6 py-4 max-h-[70vh] overflow-y-auto space-y-4', contentClassName)}>
            {children}
          </div>

          {/* footer opcional */}
          {footer && (
            <div className="px-6 py-4 border-t border-light-border dark:border-dark-border">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Modal;

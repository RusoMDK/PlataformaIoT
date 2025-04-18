import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ToastProvider = ToastPrimitives.Provider;

export const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-xs sm:max-w-sm',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = 'ToastViewport';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-xl transition-all data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
  {
    variants: {
      variant: {
        default:
          'bg-white dark:bg-darkSurface border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white',
        destructive:
          'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100',
        success:
          'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), 'animate-in fade-in slide-in-from-top', className)}
      {...props}
    />
  );
});
Toast.displayName = 'Toast';

export const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold leading-snug', className)}
    {...props}
  />
));
ToastTitle.displayName = 'ToastTitle';

export const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm text-gray-600 dark:text-gray-300 leading-snug', className)}
    {...props}
  />
));
ToastDescription.displayName = 'ToastDescription';

export const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400',
      className
    )}
    {...props}
  >
    <X className="w-4 h-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = 'ToastClose';

export const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium transition-colors hover:bg-gray-100 dark:bg-darkSurface dark:border-gray-600 dark:hover:bg-darkMuted dark:text-white',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = 'ToastAction';

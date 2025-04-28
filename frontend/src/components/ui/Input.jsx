// src/components/ui/Input.jsx
import * as React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, type = 'text', size = 'md', ...props }, ref) => {
  const sizes = {
    sm: 'h-9 px-3 py-1.5 text-sm',
    md: 'h-10 px-3 py-2 text-sm',
    lg: 'h-12 px-4 py-2 text-base',
  };

  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'block w-full rounded-xl border transition-all duration-200 outline-none',
        'bg-light-surface border-light-border text-light-text placeholder-muted focus:ring-2 focus:ring-primary focus:border-primary',
        'dark:bg-dark-bg dark:text-white dark:border-dark-border dark:placeholder-dark-muted dark:focus:ring-primary-dark dark:focus:border-primary-dark',
        'placeholder-gray-400 dark:placeholder-gray-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;

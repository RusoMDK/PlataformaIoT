// src/components/ui/Input.jsx
import * as React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ className, type = 'text', size = 'md', ...props }, ref) => {
  const sizes = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base',
  };

  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'block w-full rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 placeholder-gray-400',
        'dark:bg-darkBg dark:text-white dark:border-gray-600 dark:placeholder-gray-500 dark:focus:border-darkAccent dark:focus:ring-darkAccent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input }; // 👈 permite usar: import { Input } from ...
export default Input; // 👈 permite usar: import Input from ...

// src/components/ui/Button.jsx
import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primaryHover focus:ring-primary',
        secondary:
          'bg-secondary text-gray-800 hover:bg-secondaryHover focus:ring-secondary dark:bg-darkSurface dark:text-white dark:hover:bg-darkAccent/20',
        success: 'bg-success text-white hover:bg-successHover focus:ring-success',
        danger: 'bg-danger text-white hover:bg-dangerHover focus:ring-danger',
        outline:
          'border border-gray-300 text-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-darkSurface',
        ghost:
          'bg-transparent hover:bg-gray-100 text-gray-800 dark:text-white dark:hover:bg-darkSurface',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-3 text-base',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, fullWidth, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
export default Button; // ✅ ahora también exporta por default

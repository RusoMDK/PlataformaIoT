// src/components/ui/Button.jsx
import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
        secondary:
          'bg-light-surface text-light-text hover:bg-light-muted/10 dark:bg-dark-surface dark:text-white dark:hover:bg-dark-muted/20 focus:ring-secondary',
        accent: 'bg-accent text-black hover:bg-accent/80 focus:ring-accent',
        success: 'bg-success text-white hover:bg-success-hover focus:ring-success',
        danger: 'bg-danger text-white hover:bg-danger-hover focus:ring-danger',
        outline:
          'border border-light-border text-light-text hover:bg-light-muted/10 dark:border-dark-border dark:text-white dark:hover:bg-dark-muted/10 focus:ring-primary',
        ghost:
          'bg-transparent text-light-text hover:bg-light-muted/10 dark:text-white dark:hover:bg-dark-muted/10',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
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
export default Button;

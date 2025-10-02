// src/components/ui/Switch.jsx
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

function Switch({ checked, onChange, disabled, className, ...props }) {
  const toggle = useCallback(() => !disabled && onChange?.(!checked), [checked, disabled, onChange]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition',
        checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white transition',
          checked ? 'translate-x-5' : 'translate-x-1'
        )}
      />
    </button>
  );
}

export default Switch;
export { Switch }; // ✅ ahora también soporta import nombrado

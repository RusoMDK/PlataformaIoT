// components/ui/Badge.jsx
import React from 'react';
import { cn } from '../../lib/utils';

export default function Badge({ children, variant = 'default', outline = false, className = '' }) {
  const base =
    'inline-block px-2.5 py-0.5 text-xs font-medium rounded-full transition-colors duration-200 shadow-sm whitespace-nowrap';

  const variants = {
    default: outline
      ? 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    success: outline
      ? 'border border-green-400 text-green-700 dark:border-green-600 dark:text-green-300'
      : 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100',
    danger: outline
      ? 'border border-red-400 text-red-700 dark:border-red-600 dark:text-red-300'
      : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100',
    warning: outline
      ? 'border border-yellow-400 text-yellow-700 dark:border-yellow-600 dark:text-yellow-300'
      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100',
    info: outline
      ? 'border border-blue-400 text-blue-700 dark:border-blue-600 dark:text-blue-300'
      : 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100',
  };

  return (
    <span role="status" className={cn(base, variants[variant], className)}>
      {children}
    </span>
  );
}

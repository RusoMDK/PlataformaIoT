// src/components/ui/Spinner.jsx
import React from 'react';
import { cn } from '../../lib/utils';

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export default function Spinner({ size = 'md', className = '', label = 'Cargando...' }) {
  const dimension = sizeMap[size] || size; // Acepta también strings como "w-10 h-10"

  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-t-transparent',
        'border-muted dark:border-dark-muted',
        dimension,
        className
      )}
    />
  );
}

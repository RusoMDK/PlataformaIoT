// components/ui/Tooltip.jsx
import React from 'react';
import { cn } from '../../lib/utils';

export default function Tooltip({ children, text, position = 'top' }) {
  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative group inline-flex">
      {children}
      <div
        className={cn(
          'pointer-events-none absolute z-50 hidden group-hover:block px-3 py-1.5 rounded text-xs text-white dark:text-gray-100 bg-gray-900 dark:bg-gray-800 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100',
          positionClasses[position]
        )}
      >
        {text}
      </div>
    </div>
  );
}

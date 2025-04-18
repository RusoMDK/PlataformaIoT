// src/components/ui/Card.jsx
import React from 'react';
import { cn } from '../../lib/utils';

function Card({ title, icon, actions, children, className }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-darkSurface border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-5 transition-colors duration-300',
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon && <span className="text-primary dark:text-darkAccent">{icon}</span>}
            {title && (
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}

      <div className="text-sm text-gray-700 dark:text-gray-200">{children}</div>
    </div>
  );
}

function CardContent({ children, className }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

// ✅ Permite ambas formas de importación:
export { Card, CardContent };
export default Card;

// src/components/ui/Card.jsx
import React from 'react';
import { cn } from '../../lib/utils';

function Card({ title, icon, actions, children, className }) {
  return (
    <div
      className={cn(
        'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-sm p-5 transition-colors duration-300',
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon && <span className="text-primary dark:text-primary-dark">{icon}</span>}
            {title && (
              <h3 className="text-lg font-semibold text-light-text dark:text-white">{title}</h3>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}

      <div className="text-sm text-light-text dark:text-dark-text">{children}</div>
    </div>
  );
}

function CardContent({ children, className }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

export { Card, CardContent };
export default Card;

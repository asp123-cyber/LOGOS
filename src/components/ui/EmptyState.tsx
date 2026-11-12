import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 rounded-xl border border-dashed border-ink-200 dark:border-ink-700 bg-paper-100/50 dark:bg-ink-800/40 ${className}`}>
      {icon && <div className="mx-auto flex justify-center text-ink-300 dark:text-ink-400 mb-3">{icon}</div>}
      <h3 className="font-serif text-lg font-semibold text-ink-800 dark:text-paper-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-ink-400 dark:text-ink-300 max-w-sm mx-auto mb-4 font-sans">
          {description}
        </p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn-primary text-xs py-2 px-4">
          {action.label}
        </button>
      )}
    </div>
  );
}

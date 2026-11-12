import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  message,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`} role="status">
      <div
        className={`${sizeClasses[size]} rounded-full border-cobalt-200 border-t-cobalt-600 animate-spin`}
      />
      {message && (
        <p className="mt-3 text-sm text-ink-400 dark:text-ink-300 font-sans">{message}</p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

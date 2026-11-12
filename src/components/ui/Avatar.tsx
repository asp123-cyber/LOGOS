import React from 'react';
import { getInitials } from '../../lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover border border-ink-200 dark:border-ink-700 ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-cobalt-600 text-white font-medium flex items-center justify-center select-none shadow-inner ${className}`}
      aria-label={name}
      title={name}
    >
      {getInitials(name || 'User')}
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <span className="font-serif text-8xl font-bold text-ink-200 dark:text-ink-800 select-none">
        404
      </span>
      <h1 className="font-serif text-3xl font-bold text-ink-900 dark:text-paper-100 -mt-6 mb-3">
        Page Lost in the Archives
      </h1>
      <p className="text-sm text-ink-500 dark:text-ink-300 max-w-md mx-auto mb-8 font-sans">
        The inquiry or essay you are seeking either does not exist, has been revised, or was
        relocated. Let us return to established premises.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/" className="btn-primary text-xs py-2 px-4 flex items-center gap-2">
          <Home className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <Link to="/explore" className="btn-secondary text-xs py-2 px-4 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5" />
          Explore Essays
        </Link>
      </div>
    </div>
  );
}

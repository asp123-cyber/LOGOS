import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto border-t border-ink-100 dark:border-ink-800 bg-paper-100/50 dark:bg-ink-900/50 py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 font-serif text-xl font-bold text-ink-900 dark:text-paper-100">
            <span className="w-5 h-5 rounded bg-cobalt-600 text-white flex items-center justify-center font-serif text-xs font-bold">
              L
            </span>
            LOGOS
          </div>
          <p className="mt-1 text-xs text-ink-400 dark:text-ink-400 font-sans italic">
            Think clearly. Write honestly. Disagree thoughtfully.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-xs text-ink-500 dark:text-ink-300 font-sans">
          <Link to="/about" className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors">
            About
          </Link>
          <Link
            to="/guidelines"
            className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors"
          >
            Guidelines
          </Link>
          <Link
            to="/explore"
            className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors"
          >
            Explore
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink-900 dark:hover:text-paper-100 transition-colors"
          >
            GitHub
          </a>
        </nav>

        <p className="text-[11px] text-ink-400 dark:text-ink-400 font-sans">
          &copy; {currentYear} LOGOS. An independent intellectual community.
        </p>
      </div>
    </footer>
  );
}

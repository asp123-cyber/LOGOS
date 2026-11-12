import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ErrorBoundary from '../ui/ErrorBoundary';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-paper-50 dark:bg-ink-900 text-ink-700 dark:text-ink-100 transition-colors selection:bg-cobalt-200/50 selection:text-ink-900 dark:selection:bg-cobalt-500/30 dark:selection:text-paper-100">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Sparkles, Feather } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <header className="mb-12 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink-900 dark:text-paper-100 tracking-tight mb-4">
          The LOGOS Manifesto
        </h1>
        <p className="font-serif text-xl italic text-cobalt-600 dark:text-cobalt-400">
          Think clearly. Write honestly. Disagree thoughtfully.
        </p>
      </header>

      <div className="prose prose-logos dark:prose-logos-dark mx-auto space-y-8 font-sans text-ink-700 dark:text-ink-200 leading-relaxed">
        <section>
          <h2 className="font-serif text-2xl font-bold text-ink-900 dark:text-paper-100">
            Why LOGOS Exists
          </h2>
          <p>
            The internet was promised to us as the great universal library and forum: an open space
            where humanity’s curiosity could converge in dialogue. In practice, modern platforms
            incentivize speed over depth, hot takes over rigorous deduction, and factional loyalty
            over intellectual honesty.
          </p>
          <p>
            <strong>LOGOS</strong> is built on a different premise. It is a quiet, deliberate
            intellectual sanctuary designed for students, researchers, thinkers, and curious minds
            who wish to wrestle with substantial ideas in philosophy, science, ethics, and culture.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 gap-6 my-10 not-prose">
          <div className="card p-6 border-cobalt-100 dark:border-ink-700">
            <Feather className="w-6 h-6 text-cobalt-600 dark:text-cobalt-400 mb-3" />
            <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-paper-100 mb-1.5">
              Refined Long-Form Essays
            </h3>
            <p className="text-xs text-ink-500 dark:text-ink-300 leading-relaxed font-sans">
              Carefully researched and reasoned prose with ample whitespace, clean typography, and
              uncluttered reading environments.
            </p>
          </div>

          <div className="card p-6 border-cobalt-100 dark:border-ink-700">
            <Sparkles className="w-6 h-6 text-cobalt-600 dark:text-cobalt-400 mb-3" />
            <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-paper-100 mb-1.5">
              Intellectual Self-Defense
            </h3>
            <p className="text-xs text-ink-500 dark:text-ink-300 leading-relaxed font-sans">
              We uphold logic, clear definitions, evidence, and valid inferential structure over
              sophistry and emotional manipulation.
            </p>
          </div>

          <div className="card p-6 border-cobalt-100 dark:border-ink-700">
            <ShieldCheck className="w-6 h-6 text-cobalt-600 dark:text-cobalt-400 mb-3" />
            <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-paper-100 mb-1.5">
              Invite-Only Community
            </h3>
            <p className="text-xs text-ink-500 dark:text-ink-300 leading-relaxed font-sans">
              Starting as a trusted circle of colleagues and peers to preserve culture, high-signal
              criticism, and respectful disagreement.
            </p>
          </div>

          <div className="card p-6 border-cobalt-100 dark:border-ink-700">
            <BookOpen className="w-6 h-6 text-cobalt-600 dark:text-cobalt-400 mb-3" />
            <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-paper-100 mb-1.5">
              Open to the World
            </h3>
            <p className="text-xs text-ink-500 dark:text-ink-300 leading-relaxed font-sans">
              While publishing is curated and invite-only initially, all published essays are freely
              readable to any seeking student across the globe.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-2xl font-bold text-ink-900 dark:text-paper-100">
            Our Architecture & Commitment
          </h2>
          <p>
            LOGOS runs on an open, transparent stack: static deployment on GitHub Pages coupled with
            Supabase Row Level Security and PostgreSQL. We do not sell user data, run intrusive
            tracking scripts, or host attention-hijacking ads.
          </p>
        </section>

        <div className="pt-6 border-t border-ink-100 dark:border-ink-800 text-center not-prose">
          <Link to="/explore" className="btn-primary text-sm py-2.5 px-6">
            Begin Exploring Essays
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

export default function Guidelines() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <header className="mb-10 text-center">
        <div className="w-12 h-12 rounded-full bg-cobalt-50 dark:bg-cobalt-950/50 text-cobalt-600 dark:text-cobalt-400 mx-auto flex items-center justify-center mb-3">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 dark:text-paper-100 mb-2">
          Community & Discourse Guidelines
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 font-sans">
          Standards for respectful disagreement, critical inquiry, and mutual intellectual growth.
        </p>
      </header>

      <div className="space-y-8 font-sans">
        {/* Core Principles */}
        <section className="card p-6 border-cobalt-200 dark:border-ink-700 bg-white dark:bg-ink-800">
          <h2 className="font-serif text-xl font-bold text-ink-900 dark:text-paper-100 mb-4">
            The Three Pillars of LOGOS
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-paper-100 dark:bg-ink-900/60">
              <span className="font-bold text-cobalt-600 dark:text-cobalt-400 block mb-1">
                1. Principle of Charity
              </span>
              Always interpret your interlocutor’s argument in its strongest, most plausible form
              (steelmanning) before offering critique.
            </div>
            <div className="p-3 rounded-lg bg-paper-100 dark:bg-ink-900/60">
              <span className="font-bold text-cobalt-600 dark:text-cobalt-400 block mb-1">
                2. Structure Over Rhetoric
              </span>
              Separate the logical validity of premises from emotional style or oratorical flair.
              Rely on evidence and sound deductions.
            </div>
            <div className="p-3 rounded-lg bg-paper-100 dark:bg-ink-900/60">
              <span className="font-bold text-cobalt-600 dark:text-cobalt-400 block mb-1">
                3. Epistemic Humility
              </span>
              Be ready to revise your beliefs when presented with superior counterarguments or
              verified counterexamples.
            </div>
          </div>
        </section>

        {/* What We Encourage */}
        <section className="card p-6 bg-white dark:bg-ink-800 border-ink-100 dark:border-ink-700">
          <h2 className="font-serif text-lg font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            What We Encourage
          </h2>
          <ul className="space-y-3 text-sm text-ink-600 dark:text-ink-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                <strong>Precise Definitions:</strong> Clearly explain key terminology at the outset
                to avoid equivocation.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                <strong>Constructive Counterarguments:</strong> Attack the premises or the inference,
                not the person presenting them.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                <strong>Explicit Citations:</strong> Provide primary sources, peer-reviewed
                literature, or explicit historical references for factual assertions.
              </span>
            </li>
          </ul>
        </section>

        {/* Prohibited Behavior */}
        <section className="card p-6 bg-white dark:bg-ink-800 border-ink-100 dark:border-ink-700">
          <h2 className="font-serif text-lg font-bold text-red-800 dark:text-red-400 flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            Zero Tolerance Policy
          </h2>
          <ul className="space-y-3 text-sm text-ink-600 dark:text-ink-300">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                <strong>Ad Hominem & Harassment:</strong> Insults, derogatory slurs, doxxing, or
                mocking another author's background or character.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                <strong>Plagiarism:</strong> Passing off someone else's work, synthetic text, or
                unattributed translations as your own.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>
                <strong>Bad-faith Trolling & Badges:</strong> Purposeful derailment of discussions
                with flame-wars, spam, or promotional material.
              </span>
            </li>
          </ul>
        </section>

        {/* Reporting */}
        <div className="p-4 rounded-lg bg-ink-50 dark:bg-ink-800/60 text-xs text-ink-500 dark:text-ink-400">
          <p>
            If you encounter any publication or comment that breaches these guidelines, please use
            the <strong>Report</strong> flag on the item. Community administrators review flagged
            items in the moderation queue and take prompt corrective action.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, AlertOctagon } from 'lucide-react';
import { useSocial } from '../../hooks/useSocial';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'article' | 'comment' | 'profile';
  targetId: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
}: ReportModalProps) {
  const { submitReport } = useSocial();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('Please provide at least 5 characters detailing your concern.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await submitReport(targetType, targetId, reason.trim());
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setReason('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-ink-800 rounded-xl shadow-xl border border-ink-100 dark:border-ink-700 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-paper-100">
              Report {targetType}
            </h3>
            <p className="text-xs text-ink-400 dark:text-ink-300">
              Help maintain a thoughtful, rigorous community.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-6 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Thank you. Your report has been submitted for editorial review.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reason"
                className="block text-xs font-semibold uppercase tracking-wider text-ink-600 dark:text-ink-300 mb-1.5"
              >
                Reason for report
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={2000}
                required
                placeholder="Explain why this content violates community guidelines..."
                className="input-field text-sm resize-none"
              />
              <span className="block text-right text-[11px] text-ink-400 mt-1">
                {reason.length}/2000
              </span>
            </div>

            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100 dark:border-ink-700">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="btn-secondary text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-xs px-4 py-2 bg-red-600 hover:bg-red-700"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

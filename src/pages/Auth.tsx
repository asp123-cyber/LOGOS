import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, Mail, User, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword, loading: authLoading } = useAuth();

  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const inviteFromUrl = searchParams.get('invite') || '';

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteToken, setInviteToken] = useState(inviteFromUrl);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect home
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw new Error(error);
        navigate('/');
      } else if (mode === 'signup') {
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        const { error } = await signUp(email, password, displayName, inviteToken);
        if (error) throw new Error(error);
        setSuccessMsg(
          'Registration submitted. Please check your email inbox to confirm your account.'
        );
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) throw new Error(error);
        setSuccessMsg('A password recovery email has been dispatched to your address.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An authentication error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner message="Checking authentication status..." />;
  }

  return (
    <div className="max-w-md mx-auto my-8 p-8 card bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700/80 shadow-md">
      <div className="text-center mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-serif text-3xl font-bold tracking-tight text-ink-900 dark:text-paper-100 mb-2"
        >
          <span className="w-8 h-8 rounded bg-cobalt-600 text-white flex items-center justify-center font-serif text-lg font-bold">
            L
          </span>
          LOGOS
        </Link>
        <p className="text-xs text-ink-500 dark:text-ink-400 font-sans italic">
          Think clearly. Write honestly. Disagree thoughtfully.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-100 dark:border-ink-700 mb-6 text-sm">
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setError(null);
          }}
          className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors ${
            mode === 'signin'
              ? 'border-cobalt-600 text-cobalt-600 dark:text-cobalt-400 font-semibold'
              : 'border-transparent text-ink-400 hover:text-ink-700'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setError(null);
          }}
          className={`flex-1 py-2 font-medium border-b-2 text-center transition-colors ${
            mode === 'signup'
              ? 'border-cobalt-600 text-cobalt-600 dark:text-cobalt-400 font-semibold'
              : 'border-transparent text-ink-400 hover:text-ink-700'
          }`}
        >
          Join Community
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 uppercase tracking-wider mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-ink-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Eleanor Vance"
                className="input-field pl-9"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 uppercase tracking-wider mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="writer@logos.org"
              className="input-field pl-9"
            />
          </div>
        </div>

        {mode !== 'forgot' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 uppercase tracking-wider">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-cobalt-600 dark:text-cobalt-400 hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-9"
              />
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-ink-600 dark:text-ink-300 uppercase tracking-wider">
                Invitation Token
              </label>
              <span className="text-[10px] text-ink-400 font-sans">Required at launch</span>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-ink-400 absolute left-3 top-3" />
              <input
                type="text"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                placeholder="Optional or invite-code"
                className="input-field pl-9"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2"
        >
          {submitting ? (
            'Processing...'
          ) : mode === 'signin' ? (
            <>
              Sign In <ArrowRight className="w-4 h-4" />
            </>
          ) : mode === 'signup' ? (
            'Request Membership'
          ) : (
            'Send Reset Instructions'
          )}
        </button>

        {mode === 'forgot' && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-xs text-ink-500 hover:text-ink-800 dark:hover:text-ink-200 underline"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

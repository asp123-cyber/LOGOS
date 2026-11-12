import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  KeyRound,
  AlertOctagon,
  Users,
  Copy,
  Check,
  EyeOff,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Invite, Report, Profile } from '../lib/database.types';
import { formatDateShort } from '../lib/utils';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'invites' | 'reports' | 'members'>('invites');

  // Invites state
  const [invites, setInvites] = useState<Invite[]>([]);
  const [targetEmail, setTargetEmail] = useState('');
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Members state
  const [members, setMembers] = useState<Profile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Load invites
  const loadInvites = async () => {
    const { data } = await supabase
      .from('invites')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setInvites(data as Invite[]);
  };

  // Load reports
  const loadReports = async () => {
    setLoadingReports(true);
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setReports(data as Report[]);
    setLoadingReports(false);
  };

  // Load members
  const loadMembers = async () => {
    setLoadingMembers(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setMembers(data as Profile[]);
    setLoadingMembers(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadInvites();
      loadReports();
      loadMembers();
    }
  }, [isAdmin]);

  // Generate Invite Token
  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setGeneratingInvite(true);
    setStatusMsg(null);

    try {
      // 32-character hex token
      const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const { error } = await supabase
        .from('invites')
        .insert({
          token,
          email: targetEmail.trim() || null,
          invited_by: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;

      setTargetEmail('');
      setStatusMsg({ type: 'success', text: 'New invitation token minted successfully.' });
      loadInvites();
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to create invite.',
      });
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleCopyInviteLink = (token: string) => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const link = `${origin}${pathname}#/auth?mode=signup&invite=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Moderation: resolve or dismiss report
  const handleUpdateReportStatus = async (
    reportId: string,
    newStatus: Report['status'],
    hideContent = false,
    report?: Report
  ) => {
    try {
      await supabase.from('reports').update({ status: newStatus } as any).eq('id', reportId);

      if (hideContent && report) {
        if (report.target_type === 'article') {
          await supabase.from('articles').update({ status: 'hidden' } as any).eq('id', report.target_id);
        } else if (report.target_type === 'comment') {
          await supabase.from('comments').update({ status: 'hidden' } as any).eq('id', report.target_id);
        }
      }

      loadReports();
      setStatusMsg({ type: 'success', text: `Report status updated to ${newStatus}.` });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to update report.' });
    }
  };

  if (authLoading) return <LoadingSpinner message="Validating authorization..." />;
  if (!isAdmin) return null;

  return (
    <div className="py-6 space-y-8 font-sans">
      <header className="border-b border-ink-100 dark:border-ink-800 pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cobalt-600 dark:text-cobalt-400 mb-1">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Administrative Console
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink-900 dark:text-paper-100">
            Platform Moderation & Access
          </h1>
        </div>

        <div className="flex rounded-lg bg-paper-100 dark:bg-ink-800 p-1 text-xs">
          <button
            onClick={() => setActiveTab('invites')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'invites'
                ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-paper-100 shadow-sm'
                : 'text-ink-500'
            }`}
          >
            Invites ({invites.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-paper-100 shadow-sm'
                : 'text-ink-500'
            }`}
          >
            Reports ({reports.filter((r) => r.status === 'open').length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'members'
                ? 'bg-white dark:bg-ink-700 text-ink-900 dark:text-paper-100 shadow-sm'
                : 'text-ink-500'
            }`}
          >
            Members ({members.length})
          </button>
        </div>
      </header>

      {statusMsg && (
        <div
          className={`p-3 rounded-lg text-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Invites Tab */}
      {activeTab === 'invites' && (
        <div className="space-y-6">
          <div className="card p-6 bg-white dark:bg-ink-800 border-ink-100 dark:border-ink-700/80">
            <h2 className="font-serif text-lg font-bold mb-2">Issue New Member Invitation</h2>
            <p className="text-xs text-ink-400 mb-4">
              Invites generate a single-use token valid for 7 days. Enforced server-side for
              invite-only launch.
            </p>

            <form onSubmit={handleGenerateInvite} className="flex flex-wrap items-center gap-3">
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="Candidate Email (optional note)"
                className="input-field text-xs py-2 max-w-sm"
              />
              <button
                type="submit"
                disabled={generatingInvite}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {generatingInvite ? 'Minting...' : 'Generate Invite Link'}
              </button>
            </form>
          </div>

          <div className="card overflow-x-auto bg-white dark:bg-ink-800 border-ink-100 dark:border-ink-700/80">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-paper-100 dark:bg-ink-900/60 border-b border-ink-100 dark:border-ink-700 text-ink-500 uppercase">
                <tr>
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Designated Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Expires</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
                {invites.map((inv) => {
                  const isExpired = new Date(inv.expires_at) < new Date();
                  const isUsed = !!inv.used_by;
                  return (
                    <tr key={inv.id} className="hover:bg-paper-50 dark:hover:bg-ink-700/30">
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {inv.token.substring(0, 12)}...
                      </td>
                      <td className="py-3 px-4 text-ink-600 dark:text-ink-300">
                        {inv.email || 'Open invite'}
                      </td>
                      <td className="py-3 px-4">
                        {isUsed ? (
                          <span className="badge text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            Claimed
                          </span>
                        ) : isExpired ? (
                          <span className="badge text-[10px] bg-red-50 text-red-700 border-red-200">
                            Expired
                          </span>
                        ) : (
                          <span className="badge text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-ink-400">
                        {formatDateShort(inv.expires_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isUsed && !isExpired && (
                          <button
                            onClick={() => handleCopyInviteLink(inv.token)}
                            className="btn-ghost text-[11px] py-1 px-2 inline-flex items-center gap-1"
                          >
                            {copiedToken === inv.token ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Link
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {loadingReports ? (
            <LoadingSpinner message="Scanning moderation queue..." />
          ) : reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="card p-5 bg-white dark:bg-ink-800 border-ink-100 dark:border-ink-700 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="badge uppercase text-[10px] font-bold">
                        {report.target_type}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          report.status === 'open'
                            ? 'bg-amber-100 text-amber-800'
                            : report.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-ink-100 text-ink-600'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <span className="text-xs text-ink-400">
                      Filed {formatDateShort(report.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-ink-800 dark:text-ink-200 bg-paper-100 dark:bg-ink-900 p-3 rounded">
                    <strong>Report details:</strong> {report.reason}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    {report.status === 'open' && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateReportStatus(report.id, 'resolved', true, report)
                          }
                          className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1"
                        >
                          <EyeOff className="w-3 h-3" /> Hide Content & Resolve
                        </button>
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-ink-400 card">
              The moderation queue is clear. No active reports.
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="card bg-white dark:bg-ink-800 border-ink-100 dark:border-ink-700 overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-paper-100 dark:bg-ink-900/60 border-b border-ink-100 dark:border-ink-700 text-ink-500 uppercase">
              <tr>
                <th className="py-3 px-4">Writer</th>
                <th className="py-3 px-4">Handle</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-paper-50 dark:hover:bg-ink-700/30">
                  <td className="py-3 px-4 font-medium text-ink-900 dark:text-paper-100">
                    {m.display_name}
                  </td>
                  <td className="py-3 px-4 text-ink-500">@{m.username}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`badge text-[10px] ${
                        m.role === 'admin'
                          ? 'bg-cobalt-100 text-cobalt-800'
                          : 'bg-paper-100 text-ink-600'
                      }`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-ink-400">{formatDateShort(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

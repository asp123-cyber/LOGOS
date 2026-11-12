import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Upload, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { validateImageFile } from '../lib/utils';
import Avatar from '../components/ui/Avatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Settings() {
  const { user, profile, refreshProfile, loading } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url);
    }
  }, [user, profile, loading, navigate]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const validation = validateImageFile(file, 2);
    if (!validation.valid) {
      setStatusMsg({ type: 'error', text: validation.error || 'Invalid file format.' });
      return;
    }

    setUploadingAvatar(true);
    setStatusMsg(null);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setStatusMsg({ type: 'success', text: 'Avatar uploaded. Click Save Changes to commit.' });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to upload avatar image.',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate username
    const usernameRegex = /^[a-zA-Z0-9_]{3,24}$/;
    if (!usernameRegex.test(username)) {
      setStatusMsg({
        type: 'error',
        text: 'Username must be 3-24 characters containing only letters, numbers, and underscores.',
      });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          username: username.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl,
        } as any)
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setStatusMsg({ type: 'success', text: 'Profile preferences updated successfully.' });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading user preferences..." />;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 font-sans">
      <div className="border-b border-ink-100 dark:border-ink-800 pb-4 mb-8">
        <h1 className="font-serif text-3xl font-bold text-ink-900 dark:text-paper-100">
          Account Settings
        </h1>
        <p className="text-sm text-ink-400 mt-1">
          Manage your public writer persona and profile details.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-lg mb-6 text-xs flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-800 dark:text-red-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-6 p-4 rounded-xl card bg-white dark:bg-ink-800">
          <Avatar src={avatarUrl} name={displayName || 'User'} size="xl" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-700 dark:text-ink-200 mb-1">
              Profile Avatar
            </h3>
            <p className="text-xs text-ink-400 mb-3">
              Recommended: square image, max 2MB (JPEG, PNG, WebP).
            </p>
            <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              {uploadingAvatar ? 'Uploading...' : 'Choose Image'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploadingAvatar}
                onChange={handleAvatarChange}
              />
            </label>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-xs font-semibold text-ink-700 dark:text-ink-200 uppercase tracking-wider mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-field"
            placeholder="John Stuart Mill"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-ink-700 dark:text-ink-200 uppercase tracking-wider mb-1.5">
            Public Username
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-sm bg-ink-100 dark:bg-ink-800 text-ink-400 border border-r-0 border-ink-200 dark:border-ink-700 rounded-l-md select-none">
              @
            </span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field rounded-l-none"
              placeholder="jsmill"
            />
          </div>
          <span className="block text-[11px] text-ink-400 mt-1">
            Letters, numbers, and underscores only (3-24 characters).
          </span>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-ink-700 dark:text-ink-200 uppercase tracking-wider mb-1.5">
            Biographical Note
          </label>
          <textarea
            rows={3}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input-field resize-none text-sm"
            placeholder="Briefly describe your intellectual interests, research, or background..."
          />
          <span className="block text-right text-[11px] text-ink-400 mt-1">
            {bio.length}/500
          </span>
        </div>

        {/* Read-only system info */}
        <div className="pt-4 border-t border-ink-100 dark:border-ink-800 text-xs text-ink-400 space-y-1">
          <p>
            <strong>Role:</strong> {profile?.role || 'member'}
          </p>
          <p>
            <strong>Registered Email:</strong> {user.email} (private, never exposed to other readers)
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs py-2 px-6"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

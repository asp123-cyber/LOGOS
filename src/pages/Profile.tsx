import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Users, Settings as SettingsIcon, Flag, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocial } from '../hooks/useSocial';
import { supabase } from '../lib/supabase';
import type { Profile, ArticleWithAuthor } from '../lib/database.types';
import { formatDateShort } from '../lib/utils';
import Avatar from '../components/ui/Avatar';
import ArticleCard from '../components/article/ArticleCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ReportModal from '../components/ui/ReportModal';
import EmptyState from '../components/ui/EmptyState';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const {
    isFollowing,
    toggleFollow,
    getFollowerCount,
    getFollowingCount,
  } = useSocial();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);

    let isMounted = true;

    async function loadProfile() {
      try {
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username as string)
          .single();

        if (profErr || !prof) {
          if (isMounted) setError('Writer not found in directory.');
          return;
        }

        const userProfile = prof as unknown as Profile;
        if (isMounted) setProfile(userProfile);

        // Fetch counts and follow state
        const [fCount, folCount, isFol] = await Promise.all([
          getFollowerCount(userProfile.id),
          getFollowingCount(userProfile.id),
          currentUser ? isFollowing(userProfile.id) : Promise.resolve(false),
        ]);

        if (isMounted) {
          setFollowerCount(fCount);
          setFollowingCount(folCount);
          setFollowing(isFol);
        }

        // Fetch published articles by this writer
        const { data: arts } = await supabase
          .from('articles')
          .select(`
            *,
            author:profiles!articles_author_id_fkey(id, username, display_name, avatar_url),
            like_count:article_likes(count),
            comment_count:comments(count)
          `)
          .eq('author_id', userProfile.id)
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (isMounted && arts) {
          setArticles(
            arts.map((item: Record<string, unknown>) => ({
              ...(item as unknown as ArticleWithAuthor),
              author: item['author'] as ArticleWithAuthor['author'],
              like_count: Array.isArray(item['like_count'])
                ? (item['like_count'] as Array<{ count: number }>)[0]?.count ?? 0
                : 0,
              comment_count: Array.isArray(item['comment_count'])
                ? (item['comment_count'] as Array<{ count: number }>)[0]?.count ?? 0
                : 0,
            }))
          );
        }
      } catch (err) {
        if (isMounted) setError('Error loading profile.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [username, currentUser, isFollowing, getFollowerCount, getFollowingCount]);

  const handleFollowToggle = async () => {
    if (!profile || !currentUser || isOwnProfile) return;
    const nextState = !following;
    setFollowing(nextState);
    setFollowerCount((prev) => (nextState ? prev + 1 : prev - 1));
    await toggleFollow(profile.id, following);
  };

  if (loading) return <LoadingSpinner message="Loading writer directory..." />;
  if (error || !profile) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h2 className="font-serif text-2xl font-bold mb-2">Writer Not Found</h2>
        <p className="text-sm text-ink-500 mb-6">
          {error || 'No writer with this handle is recorded.'}
        </p>
        <Link to="/explore" className="btn-primary text-xs py-2 px-4">
          Return to Archives
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-12 font-sans">
      {/* Profile Header */}
      <section className="card p-8 bg-white dark:bg-ink-800 border-ink-100 dark:border-ink-700/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar src={profile.avatar_url} name={profile.display_name} size="xl" />
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 dark:text-paper-100">
                {profile.display_name}
              </h1>
              <p className="text-sm text-ink-400 font-sans mb-2">@{profile.username}</p>

              <div className="flex items-center gap-4 text-xs text-ink-500 dark:text-ink-300">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {formatDateShort(profile.created_at)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <strong>{followerCount}</strong> followers &bull; <strong>{followingCount}</strong>{' '}
                  following
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isOwnProfile ? (
              <Link
                to="/settings"
                className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                Edit Profile
              </Link>
            ) : (
              <>
                <button
                  onClick={handleFollowToggle}
                  disabled={!currentUser}
                  className={`text-xs py-2 px-5 rounded-md font-medium transition-colors flex-1 sm:flex-initial ${
                    following
                      ? 'bg-paper-200 dark:bg-ink-700 text-ink-800 dark:text-paper-100 hover:bg-paper-300'
                      : 'btn-primary'
                  }`}
                >
                  {following ? 'Following' : 'Follow Writer'}
                </button>
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="p-2 text-ink-400 hover:text-red-500 rounded-md border border-ink-200 dark:border-ink-700"
                  title="Report profile"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {profile.bio && (
          <div className="mt-6 pt-6 border-t border-ink-100 dark:border-ink-700/60 max-w-2xl">
            <p className="text-sm text-ink-600 dark:text-ink-200 font-sans leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}
      </section>

      {/* Published Works */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-3">
          <h2 className="font-serif text-2xl font-bold text-ink-900 dark:text-paper-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cobalt-600" />
            Published Inquiries ({articles.length})
          </h2>
        </div>

        {articles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No published essays yet"
            description="This writer has not yet released any public inquiries or essays to the LOGOS forum."
          />
        )}
      </section>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="profile"
        targetId={profile.id}
      />
    </div>
  );
}

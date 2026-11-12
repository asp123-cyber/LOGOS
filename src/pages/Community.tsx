import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Compass } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { ArticleWithAuthor } from '../lib/database.types';
import ArticleCard from '../components/article/ArticleCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function Community() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'following' | 'discover'>(user ? 'following' : 'discover');
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadFeed() {
      try {
        if (tab === 'following' && user) {
          // 1. Get IDs of authors followed by user
          const { data: followRows } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);

          const rows = (followRows || []) as Array<{ following_id: string }>;
          const authorIds = rows.map((r) => r.following_id);
          if (isMounted) setFollowingCount(authorIds.length);

          if (authorIds.length === 0) {
            if (isMounted) {
              setArticles([]);
              setLoading(false);
            }
            return;
          }

          // 2. Fetch published articles by these authors
          const { data: arts } = await supabase
            .from('articles')
            .select(`
              *,
              author:profiles!articles_author_id_fkey(id, username, display_name, avatar_url),
              like_count:article_likes(count),
              comment_count:comments(count)
            `)
            .in('author_id', authorIds)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(20);

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
        } else {
          // Discover feed: global latest
          const { data: arts } = await supabase
            .from('articles')
            .select(`
              *,
              author:profiles!articles_author_id_fkey(id, username, display_name, avatar_url),
              like_count:article_likes(count),
              comment_count:comments(count)
            `)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(20);

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
        }
      } catch (err) {
        console.error('Error fetching community feed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFeed();
    return () => {
      isMounted = false;
    };
  }, [tab, user]);

  return (
    <div className="py-6 space-y-8 font-sans">
      <header className="border-b border-ink-100 dark:border-ink-800 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 dark:text-paper-100 mb-2">
          Community Feed
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Stay attuned to thinkers, researchers, and writers whose perspectives you follow.
        </p>

        {/* Tab switch */}
        <div className="flex items-center gap-3 mt-6">
          {user && (
            <button
              onClick={() => setTab('following')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                tab === 'following'
                  ? 'bg-cobalt-600 text-white'
                  : 'bg-paper-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Writers You Follow
            </button>
          )}
          <button
            onClick={() => setTab('discover')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              tab === 'discover'
                ? 'bg-cobalt-600 text-white'
                : 'bg-paper-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Global Dispatch
          </button>
        </div>
      </header>

      {loading ? (
        <LoadingSpinner message="Curating your community feed..." />
      ) : articles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
      ) : tab === 'following' && followingCount === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title="Your following list is quiet"
          description="You are not following any authors yet. Explore published essays and follow writers to receive their latest inquiries here."
          action={{
            label: 'Switch to Global Dispatch',
            onClick: () => setTab('discover'),
          }}
        />
      ) : (
        <EmptyState
          icon={<Compass className="w-10 h-10" />}
          title="No recent publications"
          description="The authors in this circle have not published new work recently."
        />
      )}
    </div>
  );
}

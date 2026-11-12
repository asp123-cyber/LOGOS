import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Compass } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { ArticleWithAuthor } from '../lib/database.types';
import ArticleCard from '../components/article/ArticleCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function Bookmarks() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (!user) return;

    let isMounted = true;
    async function loadBookmarks() {
      try {
        const { data: bookmarkRows } = await supabase
          .from('bookmarks')
          .select('article_id')
          .eq('user_id', user!.id);

        const rows = (bookmarkRows || []) as Array<{ article_id: string }>;
        const articleIds = rows.map((b) => b.article_id);

        if (articleIds.length === 0) {
          if (isMounted) {
            setArticles([]);
            setLoading(false);
          }
          return;
        }

        const { data: arts } = await supabase
          .from('articles')
          .select(`
            *,
            author:profiles!articles_author_id_fkey(id, username, display_name, avatar_url),
            like_count:article_likes(count),
            comment_count:comments(count)
          `)
          .in('id', articleIds)
          .eq('status', 'published');

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
        console.error('Failed to load bookmarks:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBookmarks();
    return () => {
      isMounted = false;
    };
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return <LoadingSpinner message="Retrieving your saved essays..." />;
  }

  return (
    <div className="py-6 space-y-8 font-sans">
      <header className="border-b border-ink-100 dark:border-ink-800 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="w-5 h-5 text-cobalt-600 dark:text-cobalt-400" />
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 dark:text-paper-100">
            Saved Essays
          </h1>
        </div>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Your personal repository of essays, arguments, and inquiries for slow reading.
        </p>
      </header>

      {articles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bookmark className="w-10 h-10" />}
          title="No saved essays yet"
          description="While reading essays across LOGOS, click the bookmark icon to collect them here for deep study."
          action={{
            label: 'Browse the Archives',
            onClick: () => navigate('/explore'),
          }}
        />
      )}
    </div>
  );
}

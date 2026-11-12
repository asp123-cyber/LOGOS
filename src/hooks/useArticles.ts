import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ArticleWithAuthor, Article } from '../lib/database.types';

interface UseArticlesOptions {
  status?: Article['status'];
  authorId?: string;
  category?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export function useArticles() {
  const [articles, setArticles] = useState<ArticleWithAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = useCallback(async (options: UseArticlesOptions = {}) => {
    const {
      status = 'published',
      authorId,
      category,
      searchQuery,
      limit = 12,
      offset = 0,
    } = options;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('articles')
        .select(`
          *,
          author:profiles!articles_author_id_fkey(id, username, display_name, avatar_url),
          like_count:article_likes(count),
          comment_count:comments(count)
        `)
        .eq('status', status)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (authorId) query = query.eq('author_id', authorId);
      if (category) query = query.eq('category', category);
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const mapped: ArticleWithAuthor[] = (data ?? []).map((item: Record<string, unknown>) => ({
        ...(item as unknown as Article),
        author: (item as Record<string, unknown>)['author'] as ArticleWithAuthor['author'],
        like_count: Array.isArray((item as Record<string, unknown>)['like_count'])
          ? ((item as Record<string, unknown>)['like_count'] as Array<{ count: number }>)[0]?.count ?? 0
          : 0,
        comment_count: Array.isArray((item as Record<string, unknown>)['comment_count'])
          ? ((item as Record<string, unknown>)['comment_count'] as Array<{ count: number }>)[0]?.count ?? 0
          : 0,
      }));

      if (offset === 0) {
        setArticles(mapped);
      } else {
        setArticles((prev) => [...prev, ...mapped]);
      }
      setHasMore(mapped.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArticleBySlug = useCallback(async (slug: string): Promise<ArticleWithAuthor | null> => {
    const { data, error: fetchError } = await supabase
      .from('articles')
      .select(`
        *,
        author:profiles!articles_author_id_fkey(id, username, display_name, avatar_url),
        like_count:article_likes(count),
        comment_count:comments(count)
      `)
      .eq('slug', slug)
      .single();

    if (fetchError || !data) return null;

    const item = data as Record<string, unknown>;
    return {
      ...(item as unknown as Article),
      author: item['author'] as ArticleWithAuthor['author'],
      like_count: Array.isArray(item['like_count'])
        ? (item['like_count'] as Array<{ count: number }>)[0]?.count ?? 0
        : 0,
      comment_count: Array.isArray(item['comment_count'])
        ? (item['comment_count'] as Array<{ count: number }>)[0]?.count ?? 0
        : 0,
    };
  }, []);

  return { articles, loading, error, hasMore, fetchArticles, fetchArticleBySlug };
}

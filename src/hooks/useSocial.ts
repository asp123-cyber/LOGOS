import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useSocial() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // ---- FOLLOWS ----
  const isFollowing = useCallback(async (targetUserId: string): Promise<boolean> => {
    if (!user) return false;
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle();
    return !!data;
  }, [user]);

  const toggleFollow = useCallback(async (targetUserId: string, currentlyFollowing: boolean) => {
    if (!user || user.id === targetUserId) return;
    setLoading(true);
    try {
      if (currentlyFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: targetUserId } as any);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getFollowerCount = useCallback(async (userId: string): Promise<number> => {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
    return count ?? 0;
  }, []);

  const getFollowingCount = useCallback(async (userId: string): Promise<number> => {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
    return count ?? 0;
  }, []);

  // ---- LIKES ----
  const hasLiked = useCallback(async (articleId: string): Promise<boolean> => {
    if (!user) return false;
    const { data } = await supabase
      .from('article_likes')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .maybeSingle();
    return !!data;
  }, [user]);

  const toggleLike = useCallback(async (articleId: string, currentlyLiked: boolean) => {
    if (!user) return;
    setLoading(true);
    try {
      if (currentlyLiked) {
        await supabase
          .from('article_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);
      } else {
        await supabase
          .from('article_likes')
          .insert({ user_id: user.id, article_id: articleId } as any);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getLikeCount = useCallback(async (articleId: string): Promise<number> => {
    const { count } = await supabase
      .from('article_likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId);
    return count ?? 0;
  }, []);

  // ---- BOOKMARKS ----
  const hasBookmarked = useCallback(async (articleId: string): Promise<boolean> => {
    if (!user) return false;
    const { data } = await supabase
      .from('bookmarks')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .maybeSingle();
    return !!data;
  }, [user]);

  const toggleBookmark = useCallback(async (articleId: string, currentlyBookmarked: boolean) => {
    if (!user) return;
    setLoading(true);
    try {
      if (currentlyBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);
      } else {
        await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, article_id: articleId } as any);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ---- COMMENTS ----
  const addComment = useCallback(async (articleId: string, body: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('comments')
      .insert({
        article_id: articleId,
        author_id: user.id,
        body,
        status: 'visible',
      } as any)
      .select(`*, author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url)`)
      .single();

    if (error) throw error;
    return data;
  }, [user]);

  const deleteComment = useCallback(async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId);
  }, []);

  const updateComment = useCallback(async (commentId: string, body: string) => {
    await supabase.from('comments').update({ body } as any).eq('id', commentId);
  }, []);

  // ---- REPORTS ----
  const submitReport = useCallback(async (
    targetType: 'article' | 'comment' | 'profile',
    targetId: string,
    reason: string
  ) => {
    if (!user) return;
    await supabase.from('reports').insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      status: 'open',
    } as any);
  }, [user]);

  return {
    loading,
    isFollowing,
    toggleFollow,
    getFollowerCount,
    getFollowingCount,
    hasLiked,
    toggleLike,
    getLikeCount,
    hasBookmarked,
    toggleBookmark,
    addComment,
    deleteComment,
    updateComment,
    submitReport,
  };
}

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  Clock,
  Flag,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import { useSocial } from '../hooks/useSocial';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { ArticleWithAuthor, CommentWithAuthor, Comment as DbComment } from '../lib/database.types';
import { formatDate, readingTime, extractTextFromContent } from '../lib/utils';
import { renderTipTapJson } from '../lib/renderContent';
import Avatar from '../components/ui/Avatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ReportModal from '../components/ui/ReportModal';
import ArticleCard from '../components/article/ArticleCard';

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const { fetchArticleBySlug } = useArticles();
  const {
    hasLiked,
    toggleLike,
    hasBookmarked,
    toggleBookmark,
    addComment,
    deleteComment,
    updateComment,
  } = useSocial();

  const [article, setArticle] = useState<ArticleWithAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Social states
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Comments state
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState('');

  // Related articles
  const [related, setRelated] = useState<ArticleWithAuthor[]>([]);

  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: 'article' | 'comment';
    id: string;
  }>({ type: 'article', id: '' });

  // Reading progress
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch article data
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    fetchArticleBySlug(slug)
      .then(async (data) => {
        if (!data) {
          setError('Article not found or private.');
          setLoading(false);
          return;
        }
        setArticle(data);
        setLikeCount(data.like_count);

        // Fetch social interactions
        if (user) {
          const [userLiked, userBookmarked] = await Promise.all([
            hasLiked(data.id),
            hasBookmarked(data.id),
          ]);
          setLiked(userLiked);
          setBookmarked(userBookmarked);
        }

        // Fetch comments
        const { data: commentsData } = await supabase
          .from('comments')
          .select(`*, author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url)`)
          .eq('article_id', data.id)
          .eq('status', 'visible')
          .order('created_at', { ascending: true });

        if (commentsData) {
          setComments(commentsData as unknown as CommentWithAuthor[]);
        }

        // Fetch related articles in same category
        const { data: relatedData } = await supabase
          .from('articles')
          .select(`*, author:profiles!articles_author_id_fkey(id, username, display_name, avatar_url)`)
          .eq('status', 'published')
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(3);

        if (relatedData) {
          setRelated(
            relatedData.map((item: Record<string, unknown>) => ({
              ...(item as unknown as ArticleWithAuthor),
              like_count: 0,
              comment_count: 0,
            }))
          );
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Error loading article');
      })
      .finally(() => setLoading(false));
  }, [slug, user, fetchArticleBySlug, hasLiked, hasBookmarked]);

  const handleToggleLike = async () => {
    if (!article || !user) return;
    const nextState = !liked;
    setLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : prev - 1));
    await toggleLike(article.id, liked);
  };

  const handleToggleBookmark = async () => {
    if (!article || !user) return;
    const nextState = !bookmarked;
    setBookmarked(nextState);
    await toggleBookmark(article.id, bookmarked);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !user || !commentBody.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await addComment(article.id, commentBody.trim());
      if (newComment) {
        const commentObj = newComment as unknown as DbComment;
        setComments((prev) => [
          ...prev,
          {
            ...commentObj,
            author: {
              id: user.id,
              username: profile?.username || 'member',
              display_name: profile?.display_name || 'Member',
              avatar_url: profile?.avatar_url || null,
            },
          } as CommentWithAuthor,
        ]);
        setCommentBody('');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (id: string) => {
    await deleteComment(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveEditComment = async (id: string) => {
    if (!editingBody.trim()) return;
    await updateComment(id, editingBody.trim());
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, body: editingBody.trim() } : c))
    );
    setEditingCommentId(null);
    setEditingBody('');
  };

  if (loading) return <LoadingSpinner size="lg" message="Preparing article for reading..." />;
  if (error || !article) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h2 className="font-serif text-2xl font-bold mb-2">Essay Unavailable</h2>
        <p className="text-sm text-ink-500 mb-6">{error || 'This article could not be loaded.'}</p>
        <Link to="/explore" className="btn-primary text-xs py-2 px-4">
          Return to Archive
        </Link>
      </div>
    );
  }

  const plainText = article.excerpt || extractTextFromContent(article.content);
  const minutes = readingTime(plainText);
  const htmlContent = renderTipTapJson(article.content);

  return (
    <>
      {/* Fixed Reading Progress Bar */}
      <div
        className="reading-progress"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={scrollProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <article className="max-w-article mx-auto py-6 font-sans">
        {/* Header / Meta */}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="badge">{article.category}</span>
            <span className="text-xs text-ink-400">
              {formatDate(article.published_at || article.created_at)}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-ink-900 dark:text-paper-100 tracking-tight leading-tight mb-4">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-ink-500 dark:text-ink-300 font-serif italic max-w-xl mx-auto mb-6">
              {article.excerpt}
            </p>
          )}

          {/* Author info & stats */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-ink-100 dark:border-ink-800">
            <Link
              to={`/profile/${article.author.username}`}
              className="flex items-center gap-2 group"
            >
              <Avatar
                src={article.author.avatar_url}
                name={article.author.display_name}
                size="sm"
              />
              <span className="text-xs font-semibold text-ink-800 dark:text-ink-200 group-hover:text-cobalt-600">
                {article.author.display_name}
              </span>
            </Link>
            <span className="text-ink-300 dark:text-ink-700">&bull;</span>
            <span className="text-xs text-ink-400 inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {minutes} min read
            </span>
          </div>
        </header>

        {/* Cover image */}
        {article.cover_image_url && (
          <div className="mb-12 rounded-xl overflow-hidden max-h-[460px] bg-ink-100 dark:bg-ink-900 shadow-sm">
            <img
              src={article.cover_image_url}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Main Editorial Text */}
        <div
          className="article-content mb-12"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-4 border-t border-ink-100 dark:border-ink-800 mb-8">
            <span className="text-xs font-semibold text-ink-400 uppercase tracking-wider mr-2">
              Tags:
            </span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md text-xs bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Floating/Bottom Action Bar */}
        <div className="flex items-center justify-between p-4 rounded-xl card bg-white dark:bg-ink-800 border-ink-100 dark:border-ink-700/80 mb-12 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleLike}
              disabled={!user}
              className={`flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg transition-colors ${
                liked
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                  : 'text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-700/50'
              }`}
              title={user ? 'Appreciate this essay' : 'Sign in to like'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>

            <button
              onClick={handleToggleBookmark}
              disabled={!user}
              className={`flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg transition-colors ${
                bookmarked
                  ? 'bg-cobalt-50 dark:bg-cobalt-950/40 text-cobalt-600 dark:text-cobalt-300'
                  : 'text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-700/50'
              }`}
              title={user ? 'Bookmark this essay' : 'Sign in to bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              <span>{bookmarked ? 'Saved' : 'Save'}</span>
            </button>

            <span className="flex items-center gap-1.5 text-xs text-ink-400">
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="btn-ghost text-xs py-1.5 px-2.5 flex items-center gap-1 text-ink-500"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => {
                setReportTarget({ type: 'article', id: article.id });
                setReportModalOpen(true);
              }}
              className="btn-ghost text-xs p-1.5 text-ink-400 hover:text-red-500"
              title="Report content"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Discussion / Comments Section */}
        <section className="space-y-6 pt-6 border-t border-ink-100 dark:border-ink-800">
          <h3 className="font-serif text-2xl font-bold text-ink-900 dark:text-paper-100">
            Discussion ({comments.length})
          </h3>

          {/* New Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Offer a constructive counterpoint, inquiry, or reflection..."
                rows={3}
                required
                maxLength={5000}
                className="input-field text-sm resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-ink-400">
                  Please uphold the principle of charity and logic in discourse.
                </span>
                <button
                  type="submit"
                  disabled={submittingComment || !commentBody.trim()}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  {submittingComment ? 'Submitting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-lg bg-paper-100 dark:bg-ink-800 text-center text-xs text-ink-500">
              <Link to="/auth" className="text-cobalt-600 dark:text-cobalt-400 font-semibold underline">
                Sign in
              </Link>{' '}
              to contribute your thoughts to this discussion.
            </div>
          )}

          {/* Comment list */}
          <div className="space-y-4 pt-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-lg bg-white dark:bg-ink-800/80 border border-ink-100 dark:border-ink-700/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={comment.author.avatar_url}
                      name={comment.author.display_name}
                      size="sm"
                    />
                    <div>
                      <span className="text-xs font-semibold text-ink-900 dark:text-paper-100 block">
                        {comment.author.display_name}
                      </span>
                      <span className="text-[10px] text-ink-400">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                  </div>

                  {user && (user.id === comment.author_id || profile?.role === 'admin') && (
                    <div className="flex items-center gap-1">
                      {user.id === comment.author_id && (
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingBody(comment.body);
                          }}
                          className="p-1 text-ink-400 hover:text-ink-600"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-ink-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {editingCommentId === comment.id ? (
                  <div className="pt-2 space-y-2">
                    <textarea
                      value={editingBody}
                      onChange={(e) => setEditingBody(e.target.value)}
                      rows={2}
                      className="input-field text-xs resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="btn-secondary text-[11px] py-1 px-2.5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEditComment(comment.id)}
                        className="btn-primary text-[11px] py-1 px-2.5"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-ink-700 dark:text-ink-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {comment.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="pt-16 mt-16 border-t border-ink-100 dark:border-ink-800 space-y-6">
            <h3 className="font-serif text-2xl font-bold text-ink-900 dark:text-paper-100">
              Further Inquiries in {article.category}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType={reportTarget.type}
        targetId={reportTarget.id}
      />
    </>
  );
}

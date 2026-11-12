import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Clock } from 'lucide-react';
import type { ArticleWithAuthor } from '../../lib/database.types';
import { formatDateShort, truncate, readingTime, extractTextFromContent } from '../../lib/utils';
import Avatar from '../ui/Avatar';

interface ArticleCardProps {
  article: ArticleWithAuthor;
  variant?: 'grid' | 'horizontal' | 'compact';
}

export default function ArticleCard({ article, variant = 'grid' }: ArticleCardProps) {
  const wordsText = article.excerpt || extractTextFromContent(article.content);
  const minutes = readingTime(wordsText);

  if (variant === 'compact') {
    return (
      <article className="py-4 border-b border-ink-100 dark:border-ink-800 last:border-none flex items-start gap-4 group">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge text-[10px] px-2 py-0.5">{article.category}</span>
            <span className="text-xs text-ink-400 dark:text-ink-400">
              {formatDateShort(article.published_at || article.created_at)}
            </span>
          </div>
          <Link to={`/article/${article.slug}`}>
            <h3 className="font-serif text-lg font-semibold text-ink-900 dark:text-paper-100 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>
          <div className="flex items-center gap-3 mt-3 text-xs text-ink-400">
            <Link
              to={`/profile/${article.author.username}`}
              className="flex items-center gap-1.5 hover:text-ink-800 dark:hover:text-ink-200"
            >
              <Avatar
                src={article.author.avatar_url}
                name={article.author.display_name}
                size="sm"
                className="w-5 h-5 text-[10px]"
              />
              <span className="font-medium truncate max-w-[120px]">
                {article.author.display_name}
              </span>
            </Link>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {minutes} min
            </span>
          </div>
        </div>
        {article.cover_image_url && (
          <Link
            to={`/article/${article.slug}`}
            className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-ink-100 dark:bg-ink-800"
          >
            <img
              src={article.cover_image_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </Link>
        )}
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article className="card p-6 flex flex-col md:flex-row gap-6 group hover:border-cobalt-200 dark:hover:border-cobalt-800 transition-all">
        {article.cover_image_url && (
          <Link
            to={`/article/${article.slug}`}
            className="w-full md:w-56 h-48 md:h-auto flex-shrink-0 rounded-md overflow-hidden bg-ink-100 dark:bg-ink-800"
          >
            <img
              src={article.cover_image_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </Link>
        )}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge">{article.category}</span>
              <span className="text-xs text-ink-400">
                {formatDateShort(article.published_at || article.created_at)}
              </span>
            </div>
            <Link to={`/article/${article.slug}`}>
              <h3 className="font-serif text-2xl font-bold text-ink-900 dark:text-paper-100 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors mb-2">
                {article.title}
              </h3>
            </Link>
            <p className="text-sm text-ink-500 dark:text-ink-300 font-sans line-clamp-3 leading-relaxed mb-4">
              {article.excerpt || truncate(extractTextFromContent(article.content), 180)}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-ink-100 dark:border-ink-700/60 text-xs text-ink-400">
            <Link
              to={`/profile/${article.author.username}`}
              className="flex items-center gap-2 hover:text-ink-800 dark:hover:text-ink-200"
            >
              <Avatar
                src={article.author.avatar_url}
                name={article.author.display_name}
                size="sm"
              />
              <span className="font-medium text-ink-700 dark:text-ink-200">
                {article.author.display_name}
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {minutes} min read
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                {article.like_count}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {article.comment_count}
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card flex flex-col group hover:border-cobalt-300 dark:hover:border-cobalt-700 transition-all duration-200">
      {article.cover_image_url && (
        <Link
          to={`/article/${article.slug}`}
          className="w-full h-48 overflow-hidden bg-ink-100 dark:bg-ink-800"
        >
          <img
            src={article.cover_image_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
      )}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="badge text-[11px]">{article.category}</span>
            <span className="text-xs text-ink-400">
              {formatDateShort(article.published_at || article.created_at)}
            </span>
          </div>
          <Link to={`/article/${article.slug}`}>
            <h3 className="font-serif text-xl font-bold text-ink-900 dark:text-paper-100 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors mb-2.5 line-clamp-2 leading-snug">
              {article.title}
            </h3>
          </Link>
          <p className="text-sm text-ink-500 dark:text-ink-300 font-sans line-clamp-3 leading-relaxed mb-6">
            {article.excerpt || truncate(extractTextFromContent(article.content), 140)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-ink-100 dark:border-ink-700/60 text-xs text-ink-400">
          <Link
            to={`/profile/${article.author.username}`}
            className="flex items-center gap-2 hover:text-ink-800 dark:hover:text-ink-200"
          >
            <Avatar
              src={article.author.avatar_url}
              name={article.author.display_name}
              size="sm"
            />
            <span className="font-medium text-ink-700 dark:text-ink-200 truncate max-w-[100px]">
              {article.author.display_name}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              {minutes}m
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <Heart className="w-3.5 h-3.5" />
              {article.like_count}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px]">
              <MessageSquare className="w-3.5 h-3.5" />
              {article.comment_count}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

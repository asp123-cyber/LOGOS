import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PenLine, Clock, Compass } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import { CATEGORIES, readingTime, extractTextFromContent, formatDate } from '../lib/utils';
import ArticleCard from '../components/article/ArticleCard';
import Avatar from '../components/ui/Avatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function Home() {
  const { articles, loading, error, fetchArticles } = useArticles();

  useEffect(() => {
    fetchArticles({ limit: 10 });
  }, [fetchArticles]);

  const featured = articles[0];
  const latestArticles = articles.slice(1, 7);

  return (
    <div className="space-y-10 py-4 animate-fade-in font-sans">
      <section className="journal-hero">
        <img className="journal-hero-image" src={`${import.meta.env.BASE_URL}library.jpg`} alt="" fetchPriority="high" />
        <div className="journal-hero-copy">
          <h1 className="font-serif font-bold tracking-tight text-5xl sm:text-6xl lg:text-7xl">The reading room</h1>
          <p className="max-w-md text-base sm:text-lg leading-relaxed text-white/85">Essays on science, philosophy, and the ideas that shape how we see the world.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100" to="/explore">Explore essays</Link>
            <Link className="inline-flex items-center gap-2 rounded-md border border-white/50 px-5 py-3 text-sm font-semibold hover:bg-white/10" to="/write"><PenLine size={16} /> Write an essay</Link>
          </div>
        </div>
      </section>

      {/* Loading state */}
      {loading && articles.length === 0 && (
        <LoadingSpinner size="lg" message="Gathering published essays..." />
      )}

      {/* Error state */}
      {error && (
        <div className="card p-6 border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-center">
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">{error}</p>
          <button onClick={() => fetchArticles({ limit: 10 })} className="btn-secondary text-xs">
            Retry Connection
          </button>
        </div>
      )}

      {/* Hero Featured Essay */}
      {featured && (
        <section className="card p-6 sm:p-10 border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 shadow-sm hover:border-cobalt-300 dark:hover:border-cobalt-700 transition-all">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className={featured.cover_image_url ? "lg:col-span-7 space-y-4" : "lg:col-span-12 space-y-4"}>
              <div className="flex items-center gap-2">
                <span className="badge">{featured.category}</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-300">Featured essay</span>
              </div>
              <Link to={`/article/${featured.slug}`}>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 dark:text-paper-100 hover:text-cobalt-600 dark:hover:text-cobalt-400 transition-colors leading-tight">
                  {featured.title}
                </h2>
              </Link>
              <p className="text-sm sm:text-base text-ink-500 dark:text-ink-300 font-sans line-clamp-3 leading-relaxed">
                {featured.excerpt || extractTextFromContent(featured.content)}
              </p>

              <div className="flex flex-wrap items-center justify-between pt-6 border-t border-ink-100 dark:border-ink-700/60 gap-4">
                <Link
                  to={`/profile/${featured.author.username}`}
                  className="flex items-center gap-3 group"
                >
                  <Avatar
                    src={featured.author.avatar_url}
                    name={featured.author.display_name}
                    size="md"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-ink-900 dark:text-paper-100 group-hover:text-cobalt-600 transition-colors">
                      {featured.author.display_name}
                    </span>
                    <span className="block text-xs text-ink-400">
                      {formatDate(featured.published_at || featured.created_at)}
                    </span>
                  </div>
                </Link>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-ink-400 inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {readingTime(extractTextFromContent(featured.content) || featured.excerpt)} min
                    read
                  </span>
                  <Link
                    to={`/article/${featured.slug}`}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    Read Essay <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {featured.cover_image_url && (
              <div className="lg:col-span-5 h-64 sm:h-80 rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-900 shadow-inner">
                <Link to={`/article/${featured.slug}`}>
                  <img
                    src={featured.cover_image_url}
                    alt={featured.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Pills Discovery */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-ink-900 dark:text-paper-100">
            Fields of Inquiry
          </h2>
          <Link
            to="/explore"
            className="text-xs font-semibold text-cobalt-600 dark:text-cobalt-400 hover:underline flex items-center gap-1"
          >
            All categories <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/explore?category=${encodeURIComponent(cat)}`}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-200 hover:border-cobalt-400 hover:text-cobalt-600 dark:hover:text-cobalt-300 transition-colors whitespace-nowrap shadow-sm"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Published Essays */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-3">
          <h2 className="font-serif text-2xl font-bold text-ink-900 dark:text-paper-100">
            Latest Dispatches
          </h2>
          <Link
            to="/explore"
            className="text-xs font-semibold text-cobalt-600 dark:text-cobalt-400 hover:underline flex items-center gap-1"
          >
            Browse the archive <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {latestArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        ) : !featured && !loading ? (
          <EmptyState
            icon={<Compass className="w-10 h-10" />}
            title="The Forum Awaits"
            description="No essays have been published yet. Once the initial seed is submitted or writers join, essays will appear here."
            action={{
              label: 'Explore Archives',
              onClick: () => (window.location.hash = '#/explore'),
            }}
          />
        ) : null}
      </section>

      {/* Community Manifesto Card */}
      <section className="rounded-2xl p-8 sm:p-12 bg-cobalt-900 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-cobalt-300 font-sans">
            Invitation to Reason
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
            Do not skim the surface of ideas.
          </h2>
          <p className="text-sm text-cobalt-100 font-sans leading-relaxed">
            LOGOS is built to revive slow, deliberate composition and charitable debate. Join our
            circle or read freely.
          </p>
          <div className="pt-2 flex items-center gap-4">
            <Link
              to="/auth?mode=signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white text-cobalt-900 font-semibold text-xs hover:bg-paper-100 transition-colors"
            >
              Request Access
            </Link>
            <Link
              to="/about"
              className="text-xs font-medium text-cobalt-200 hover:text-white underline underline-offset-4"
            >
              Read Manifesto
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

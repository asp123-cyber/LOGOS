import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useArticles } from '../hooks/useArticles';
import { CATEGORIES } from '../lib/utils';
import ArticleCard from '../components/article/ArticleCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || 'All';
  const currentQuery = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  const [searchInput, setSearchInput] = useState(currentQuery);
  const { articles, loading, error, hasMore, fetchArticles } = useArticles();

  useEffect(() => {
    fetchArticles({
      category: currentCategory === 'All' ? undefined : currentCategory,
      searchQuery: currentQuery || undefined,
      limit: 12,
      offset: 0,
    });
  }, [currentCategory, currentQuery, currentSort, fetchArticles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('q', searchInput.trim());
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const handleCategorySelect = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    setSearchParams(params);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    if (sort === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', sort);
    }
    setSearchParams(params);
  };

  const handleLoadMore = () => {
    fetchArticles({
      category: currentCategory === 'All' ? undefined : currentCategory,
      searchQuery: currentQuery || undefined,
      limit: 12,
      offset: articles.length,
    });
  };

  // Sort locally if popular
  const displayedArticles = [...articles].sort((a, b) => {
    if (currentSort === 'popular') {
      return b.like_count - a.like_count;
    }
    return 0; // Default ordering from query is newest
  });

  return (
    <div className="py-6 space-y-8 font-sans">
      <header className="border-b border-ink-100 dark:border-ink-800 pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink-900 dark:text-paper-100 mb-2">
          Explore the Archive
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          Inquiries, counterarguments, scientific interpretations, and philosophical essays.
        </p>
      </header>

      {/* Search & Filters Controls */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
          <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by topic, thesis, or keyword..."
            className="input-field pl-10 pr-20 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 btn-primary text-xs py-1.5 px-3"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => handleCategorySelect('All')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                currentCategory === 'All'
                  ? 'bg-cobalt-600 text-white'
                  : 'bg-paper-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-100'
              }`}
            >
              All Topics
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  currentCategory === cat
                    ? 'bg-cobalt-600 text-white'
                    : 'bg-paper-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-transparent border border-ink-200 dark:border-ink-700 rounded px-2 py-1 text-xs text-ink-700 dark:text-ink-200 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Appreciated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results grid */}
      {error ? (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      ) : displayedArticles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedArticles.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
      ) : !loading ? (
        <EmptyState
          title="No essays match your inquiry"
          description="Try broadening your search term or selecting another field of inquiry."
          action={{
            label: 'Reset Filters',
            onClick: () => {
              setSearchInput('');
              setSearchParams(new URLSearchParams());
            },
          }}
        />
      ) : null}

      {/* Loading Spinner */}
      {loading && <LoadingSpinner message="Scanning archives..." />}

      {/* Pagination / Load more */}
      {!loading && hasMore && displayedArticles.length >= 12 && (
        <div className="text-center pt-6">
          <button onClick={handleLoadMore} className="btn-secondary text-xs py-2 px-6">
            Load More Essays
          </button>
        </div>
      )}
    </div>
  );
}

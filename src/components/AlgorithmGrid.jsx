import React, { useState, useMemo, useEffect, useRef } from 'react';
import AlgorithmCard from './AlgorithmCard';
import { algorithms, categories, difficulties } from '../data/algorithms';
import { useApp } from '../contexts/AppContext';

const SORT_OPTIONS = [
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'favorites', label: 'Favorites first' },
];

const DIFF_ORDER = { Easy: 1, Medium: 2, Hard: 3 };

function FilterChip({ label, active, onClick, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 whitespace-nowrap ${
        active
          ? `${activeClass} shadow-sm scale-105`
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

const DIFF_ACTIVE = {
  All:    'bg-gray-800 text-white border-gray-800 dark:bg-gray-200 dark:text-gray-900 dark:border-gray-200',
  Easy:   'bg-emerald-600 text-white border-emerald-600',
  Medium: 'bg-amber-500 text-white border-amber-500',
  Hard:   'bg-red-600 text-white border-red-600',
};

const CAT_ACTIVE = 'bg-blue-600 text-white border-blue-600';
const CAT_DEFAULT = '';

function AlgorithmGrid({ searchTerm = '' }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('difficulty');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const gridRef = useRef(null);
  const { favorites } = useApp();

  // Listen for category events from Dashboard quick-access cards
  useEffect(() => {
    const handler = (e) => {
      setSelectedCategory(e.detail);
      setSelectedDifficulty('All');
      setShowFavoritesOnly(false);
    };
    window.addEventListener('set-category', handler);
    return () => window.removeEventListener('set-category', handler);
  }, []);

  const filteredAlgorithms = useMemo(() => {
    let list = algorithms.filter(algo => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = !q ||
        algo.title.toLowerCase().includes(q) ||
        algo.description.toLowerCase().includes(q) ||
        algo.category.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'All' || algo.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || algo.difficulty === selectedDifficulty;
      const matchesFav = !showFavoritesOnly || favorites.includes(algo.title);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesFav;
    });

    if (sortBy === 'difficulty') {
      list = list.slice().sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);
    } else if (sortBy === 'name') {
      list = list.slice().sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'favorites') {
      list = list.slice().sort((a, b) => {
        const af = favorites.includes(a.title) ? 0 : 1;
        const bf = favorites.includes(b.title) ? 0 : 1;
        return af - bf || DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty];
      });
    }

    return list;
  }, [searchTerm, selectedCategory, selectedDifficulty, sortBy, showFavoritesOnly, favorites]);

  const hasActiveFilters = selectedCategory !== 'All' || selectedDifficulty !== 'All' || showFavoritesOnly || searchTerm;

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setShowFavoritesOnly(false);
  };

  return (
    <div
      id="algorithm-grid"
      ref={gridRef}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
    >
      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200/70 dark:border-gray-800/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">

          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-none">Algorithm Hub</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Master algorithms with interactive visualizations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
                >
                  Clear filters
                </button>
              )}
              <div className="text-right">
                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{filteredAlgorithms.length}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">/ {algorithms.length}</span>
              </div>
            </div>
          </div>

          {/* Filter row */}
          <div className="flex flex-col gap-3">
            {/* Category chips */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1">Category</span>
              {categories.map(cat => (
                <FilterChip
                  key={cat}
                  label={cat}
                  active={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  activeClass={CAT_ACTIVE}
                />
              ))}
            </div>

            {/* Difficulty + Sort row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1">Difficulty</span>
                {difficulties.map(diff => (
                  <FilterChip
                    key={diff}
                    label={diff}
                    active={selectedDifficulty === diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    activeClass={DIFF_ACTIVE[diff] ?? DIFF_ACTIVE.All}
                  />
                ))}
              </div>

              <div className="ml-auto flex items-center gap-3">
                {/* Favorites toggle */}
                <button
                  onClick={() => setShowFavoritesOnly(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                    showFavoritesOnly
                      ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-3 h-3" fill={showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  Favorites{favorites.length > 0 ? ` (${favorites.length})` : ''}
                </button>

                {/* Sort select */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700
                               bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                               focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                               transition-all duration-200"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Active filter summary */}
        {hasActiveFilters && filteredAlgorithms.length > 0 && (
          <div className="mb-5 flex items-center gap-2 flex-wrap">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-bold text-blue-600 dark:text-blue-400">{filteredAlgorithms.length}</span> algorithm{filteredAlgorithms.length !== 1 ? 's' : ''}
              {selectedCategory !== 'All' && <span className="text-gray-700 dark:text-gray-300"> in <strong>{selectedCategory}</strong></span>}
              {selectedDifficulty !== 'All' && <span> · <span className="font-semibold">{selectedDifficulty}</span></span>}
              {showFavoritesOnly && <span> · ❤️ Favorites only</span>}
              {searchTerm && <span> · matching "<em>{searchTerm}</em>"</span>}
            </p>
          </div>
        )}

        {/* Empty state */}
        {filteredAlgorithms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="text-6xl mb-5 animate-float">
              {showFavoritesOnly ? '💔' : '🔍'}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {showFavoritesOnly ? 'No favorites yet' : 'No algorithms found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              {showFavoritesOnly
                ? 'Click the ❤️ icon on any algorithm card to save your favorites here.'
                : 'Try adjusting your filters or search term to find what you\'re looking for.'}
            </p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-colors duration-200"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAlgorithms.map((algo, i) => (
              <div
                key={algo.title}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms`, animationFillMode: 'both' }}
              >
                <AlgorithmCard
                  title={algo.title}
                  description={algo.description}
                  symbol={algo.symbol}
                  difficulty={algo.difficulty}
                  category={algo.category}
                  route={algo.route}
                  timeComplexity={algo.timeComplexity}
                  spaceComplexity={algo.spaceComplexity}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AlgorithmGrid;

import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { algorithms, stats } from '../data/algorithms';

const CATEGORY_COLORS = {
  'Searching':           { bg: 'bg-blue-100 dark:bg-blue-950/60',   text: 'text-blue-700 dark:text-blue-300',   border: 'border-blue-200 dark:border-blue-800',   icon: '🔍' },
  'Sorting':             { bg: 'bg-violet-100 dark:bg-violet-950/60', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800', icon: '📊' },
  'Graph':               { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', icon: '🕸️' },
  'Dynamic Programming': { bg: 'bg-amber-100 dark:bg-amber-950/60',   text: 'text-amber-700 dark:text-amber-300',   border: 'border-amber-200 dark:border-amber-800',   icon: '💡' },
  'Greedy':              { bg: 'bg-orange-100 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', icon: '🤑' },
  'Backtracking':        { bg: 'bg-pink-100 dark:bg-pink-950/60',   text: 'text-pink-700 dark:text-pink-300',   border: 'border-pink-200 dark:border-pink-800',   icon: '🔙' },
  'Fundamentals':        { bg: 'bg-teal-100 dark:bg-teal-950/60',   text: 'text-teal-700 dark:text-teal-300',   border: 'border-teal-200 dark:border-teal-800',   icon: '🔁' },
  'String Algorithms':   { bg: 'bg-rose-100 dark:bg-rose-950/60',   text: 'text-rose-700 dark:text-rose-300',   border: 'border-rose-200 dark:border-rose-800',   icon: '🔎' },
  'Advanced':            { bg: 'bg-indigo-100 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800', icon: '🧠' },
};

const DIFF_STYLE = {
  Easy:   'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
  Medium: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
  Hard:   'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300',
};

const uniqueCategories = [...new Set(algorithms.map(a => a.category))];

function MiniAlgoCard({ algo, showRemoveRecent }) {
  const { isFavorite, toggleFavorite, clearRecentlyViewed } = useApp();
  const fav = isFavorite(algo.title);

  return (
    <Link
      to={algo.route}
      className="group flex-shrink-0 w-52 rounded-xl border border-gray-200/70 dark:border-gray-700/50
                 bg-white dark:bg-gray-800/70 p-4 hover:shadow-md hover:-translate-y-0.5
                 transition-all duration-200 relative overflow-hidden"
    >
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{algo.symbol}</span>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(algo.title); }}
          className={`p-1 rounded-lg transition-all duration-200 ${fav ? 'text-red-500' : 'text-gray-300 dark:text-gray-600 hover:text-red-400'}`}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2">
        {algo.title}
      </h3>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${DIFF_STYLE[algo.difficulty]}`}>
          {algo.difficulty}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{algo.timeComplexity}</span>
      </div>
    </Link>
  );
}

function StatsBar() {
  const { getProgress, visited } = useApp();
  const progress = getProgress();
  const pct = Math.round((progress / stats.total) * 100);

  return (
    <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/50 bg-white dark:bg-gray-800/70 p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Learning Progress</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress}/{stats.total} explored</span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{pct}% complete · Keep exploring!</p>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:w-auto w-full">
          {[
            { label: 'Easy', count: stats.easy, bar: 'from-emerald-400 to-emerald-500' },
            { label: 'Medium', count: stats.medium, bar: 'from-amber-400 to-amber-500' },
            { label: 'Hard', count: stats.hard, bar: 'from-red-400 to-red-500' },
          ].map(({ label, count, bar }) => (
            <div key={label} className="text-center px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/60">
              <div className={`text-lg font-bold bg-gradient-to-br ${bar} bg-clip-text text-transparent`}>{count}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, action, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          <span>{icon}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function HorizontalScroll({ children }) {
  return (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto pb-3 scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
        {children}
      </div>
    </div>
  );
}

function Dashboard() {
  const { recentlyViewed, favorites, clearRecentlyViewed } = useApp();

  const favoriteAlgos = algorithms.filter(a => favorites.includes(a.title));

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-2">
      <StatsBar />

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <Section
          title="Recently Viewed"
          icon="🕐"
          action={
            <button
              onClick={clearRecentlyViewed}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              Clear all
            </button>
          }
        >
          <HorizontalScroll>
            {recentlyViewed.map(algo => (
              <MiniAlgoCard key={algo.route} algo={algo} />
            ))}
          </HorizontalScroll>
        </Section>
      )}

      {/* Favorites */}
      {favoriteAlgos.length > 0 && (
        <Section
          title="My Favorites"
          icon="❤️"
          action={
            <Link to="/favorites" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
              View all →
            </Link>
          }
        >
          <HorizontalScroll>
            {favoriteAlgos.map(algo => (
              <MiniAlgoCard key={algo.route} algo={algo} />
            ))}
          </HorizontalScroll>
        </Section>
      )}

      {/* Quick access by category */}
      <Section title="Browse by Category" icon="📂">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {uniqueCategories.map(cat => {
            const style = CATEGORY_COLORS[cat] || CATEGORY_COLORS['Advanced'];
            const count = algorithms.filter(a => a.category === cat).length;
            return (
              <a
                key={cat}
                href="#algorithm-grid"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('algorithm-grid')?.scrollIntoView({ behavior: 'smooth' });
                  // Dispatch a custom event to set the category filter
                  window.dispatchEvent(new CustomEvent('set-category', { detail: cat }));
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${style.bg} ${style.border} ${style.text}
                           hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-center`}
              >
                <span className="text-2xl">{style.icon}</span>
                <span className="text-xs font-semibold leading-tight">{cat}</span>
                <span className={`text-xs opacity-70`}>{count} algo{count !== 1 ? 's' : ''}</span>
              </a>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

export default Dashboard;
